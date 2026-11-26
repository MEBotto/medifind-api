import { Response } from 'express';
import { Client } from 'pg';
import AppDataSource from '@/data-source';
import { Notification } from '../models/Notification';
import { logger } from '@/utils/logger';

type StreamClient = { userId: string; response: Response; heartbeat: NodeJS.Timeout; expiry: NodeJS.Timeout };
const subscribers = new Map<string, Set<StreamClient>>();
let listener: Client | undefined;
let reconnectTimer: NodeJS.Timeout | undefined;
let shuttingDown = false;

export function subscribeNotifications(userId: string, response: Response): () => void {
  response.write(': connected\n\n');
  const client: StreamClient = {
    userId, response, heartbeat: setInterval(() => response.write(': heartbeat\n\n'), 25000),
  };
  const set = subscribers.get(userId) ?? new Set<StreamClient>();
  set.add(client);
  subscribers.set(userId, set);
  return () => {
    clearInterval(client.heartbeat);
    clearTimeout(client.expiry);
    set.delete(client);
    if (!set.size) subscribers.delete(userId);
  };
}

async function deliverNotification(id: string, userId: string): Promise<void> {
  const clients = subscribers.get(userId);
  if (!clients?.size) return;
  const notification = await AppDataSource.getRepository(Notification).findOneBy({ id, userId });
  if (!notification) return;
  const payload = `id: ${notification.id}\nevent: notification:new\ndata: ${JSON.stringify(notification)}\n\n`;
  for (const client of clients) client.response.write(payload);
}

async function connectListener(): Promise<void> {
  if (shuttingDown) return;
  const options = AppDataSource.options;
  if (options.type !== 'postgres') throw new Error('Notification stream requires PostgreSQL');
  const client = new Client({
    host: options.host, port: options.port, user: options.username,
    password: options.password, database: options.database,
    ssl: options.ssl,
  });
  try {
    await client.connect();
    await client.query('LISTEN medifind_notifications');
    listener = client;
    client.on('notification', message => {
      if (!message.payload) return;
      try {
        const event = JSON.parse(message.payload) as { id?: unknown; userId?: unknown };
        if (typeof event.id !== 'string' || typeof event.userId !== 'string') return;
        void deliverNotification(event.id, event.userId).catch(error => logger.error('Notification delivery failed', error));
      } catch (error) { logger.error('Invalid notification event', error); }
    });
    client.on('error', error => {
      logger.error('Notification listener error', error);
      void client.end().catch(() => undefined);
      if (listener === client) listener = undefined;
      scheduleReconnect();
    });
    client.on('end', () => {
      if (listener === client) listener = undefined;
      scheduleReconnect();
    });
    logger.info('Notification PostgreSQL listener connected');
  } catch (error) {
    logger.error('Notification listener connection failed', error);
    await client.end().catch(() => undefined);
    scheduleReconnect();
  }
}

function scheduleReconnect(): void {
  if (shuttingDown || reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = undefined;
    void connectListener();
  }, 5000);
}

export async function startNotificationStream(): Promise<void> {
  shuttingDown = false;
  await connectListener();
}

export async function stopNotificationStream(): Promise<void> {
  shuttingDown = true;
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = undefined;
  for (const clients of subscribers.values()) for (const client of clients) {
    clearInterval(client.heartbeat);
    clearTimeout(client.expiry);
    client.response.end();
  }
  subscribers.clear();
  const current = listener;
  listener = undefined;
  if (current) await current.end().catch(() => undefined);
}

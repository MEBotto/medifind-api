import { EntityManager } from 'typeorm';
import { Notification } from '../models/Notification';

/** PostgreSQL delivers NOTIFY only after the enclosing transaction commits. */
export async function publishNotifications(manager: EntityManager, notifications: Notification | Notification[]): Promise<void> {
  for (const notification of Array.isArray(notifications) ? notifications : [notifications]) {
    await manager.query('SELECT pg_notify($1, $2)', [
      'medifind_notifications', JSON.stringify({ id: notification.id, userId: notification.userId }),
    ]);
  }
}

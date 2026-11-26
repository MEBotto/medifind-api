# Notificaciones y alta de catálogo

## Flujo

1. Un usuario PHARMACIST envía `POST /api/catalog-requests`. Se crean notificaciones internas para cada usuario cuyo rol actual es ADMIN.
2. Un ADMIN revisa mediante `PATCH /api/catalog-requests/:id/review`. La operación, la creación de catálogo y la notificación al solicitante ocurren dentro de la misma transacción.
3. Si se aprueba un PRODUCT, se crea una entrada en `pharmacy_products` para la farmacia solicitante, con `active=false`, `quantity=0` y `price=null`. No aparece en la búsqueda pública hasta que el farmacéutico configure precio, cantidad y activación.
4. Si se rechaza, el solicitante recibe el motivo. Los laboratorios y categorías aprobados no crean una entrada de inventario.

## API de notificaciones

- `GET /api/notifications`: últimas 100 notificaciones del usuario autenticado.
- `GET /api/notifications?unread=true`: solo pendientes de lectura.
- `PATCH /api/notifications/:id/read`: marca como leída una notificación propia.
- `GET /api/notifications/stream`: canal SSE autenticado por JWT Bearer, emite eventos `notification:new` con `id` y `data` JSON.

Todas las rutas requieren JWT. No se permite leer ni marcar notificaciones de terceros.

## Alcance

Notificaciones persistentes **dentro de la aplicación**, con entrega en tiempo real mediante **Server-Sent Events (SSE)** y PostgreSQL **LISTEN/NOTIFY**. No se necesita WebSocket: el flujo es unidireccional servidor → cliente. Tampoco hay email ni push. No se migran productos previos: el sistema comienza con el catálogo nuevo.

## Operación

El frontend debe abrir `/api/notifications/stream` con `fetch` y cabecera `Authorization: Bearer ...` (EventSource nativo no admite esa cabecera), interpretar el stream y volver a consultar `GET /api/notifications` al conectar o reconectar para recuperar eventos perdidos. El cliente debe deduplicar por ID. Hay heartbeats cada 25 segundos. No enviar JWT en query strings.

PostgreSQL entrega `NOTIFY` **solo después del commit**, y cada instancia del backend mantiene su propio listener, por lo que funciona con múltiples instancias sin Redis. Los eventos en vivo no son un historial durable; la tabla `notifications` sí lo es. El listener se reconecta ante desconexiones; los clientes también deben reconectar con backoff y sincronizar el inbox. La conexión SSE ocupa una conexión HTTP por usuario, y cada instancia ocupa una conexión PostgreSQL adicional. Revisar límites de proxy, timeouts y concurrencia.

Aplicar la migración `1800000000000-CatalogNotifications` antes de desplegar. Validar en PostgreSQL el flujo completo y la concurrencia antes de producción.

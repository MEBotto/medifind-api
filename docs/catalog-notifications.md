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

Todas las rutas requieren JWT. No se permite leer ni marcar notificaciones de terceros.

## Alcance

Notificaciones persistentes **dentro de la aplicación**; no hay envío de email, push ni WebSocket. El frontend deberá consultar periódicamente el inbox o cargarlo al abrir la aplicación. No se migran productos previos: el sistema comienza con el catálogo nuevo.

## Operación

Aplicar la migración `1800000000000-CatalogNotifications` antes de desplegar. Validar en PostgreSQL el flujo completo y la concurrencia antes de producción.

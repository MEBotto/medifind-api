# Catálogo global e inventario por farmacia — fase 1

## Decisiones

- `catalog_products` representa la identidad comercial compartida de un medicamento. Laboratorio, categoría, dosis y presentación pertenecen al catálogo.
- `pharmacy_products` representa la oferta de una farmacia: precio, cantidad, visibilidad. Unicidad por farmacia + producto.
- `catalog_requests` representa propuestas de PRODUCT, LABORATORY o CATEGORY. Solo un administrador podrá aprobarlas o rechazarlas cuando se implementen los endpoints.
- Una farmacia puede asociar un producto existente directamente a su inventario; un producto o laboratorio nuevo requiere aprobación.
- Si una solicitud de producto depende de un laboratorio nuevo, se relacionan mediante `parentRequest` y se resuelven antes de publicar.
- `price` se almacena como decimal, no PostgreSQL `money`. Cantidades y precios negativos quedan prohibidos por la migración.

## Compatibilidad y despliegue

Esta migración es **aditiva**: mantiene intactos `products`, `order_items`, sus claves foráneas y los endpoints actuales. Las tablas nuevas empiezan vacías. **No cambia todavía el comportamiento público de la API**.

Antes de activar la nueva ruta de lectura o escritura:
1. Auditar datos existentes y detectar equivalencias por código comercial y atributos (nunca solo por nombre).
2. Crear un backfill idempotente de `products` a catálogo + inventario, con tabla de correspondencias entre IDs antiguos y nuevos; revisar duplicados ambiguos manualmente.
3. Migrar referencias de `order_items` conservando el histórico y el precio de cada ítem. No eliminar `products` ni cambiar FKs en esta fase.
4. Adaptar filtros de farmacias, permisos, auditoría y pruebas de integración.
5. Implementar solicitudes y decisiones administrativas transaccionales, con prevención de aprobaciones duplicadas y auditoría.

**No ejecutar la migración destructivamente ni sustituir productos antiguos sin verificar los datos reales.**

## Flujo objetivo

Farmacéutico busca en catálogo → si existe, agrega a su inventario; si no existe, envía solicitud PENDING → administrador aprueba, rechaza o vincula con existente → farmacia activa oferta tras la aprobación.

## Pendientes

- Identificadores comerciales y normalización de duplicados.
- Validación de campos obligatorios y control de concurrencia en aprobaciones.
- Permisos de catálogo y stock, endpoints, tests y notificaciones.
- Definir estrategia de borrado lógico para preservar pedidos históricos.

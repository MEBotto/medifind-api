# Búsqueda geográfica de medicamentos

Endpoint público: `GET /api/catalog/:productId/pharmacies`.

Parámetros opcionales:
- `lat` y `lng`: coordenadas decimales, deben enviarse juntas.
- `radiusKm`: radio en kilómetros, requiere coordenadas, máximo 500.
- `orderBy`: `price` (predeterminado), `distance` (requiere coordenadas) o `name`.
- `order`: `ASC` (predeterminado) o `DESC`.
- `page` (predeterminado 1) y `limit` (predeterminado 20, máximo 50).

Ejemplo: `/api/catalog/11111111-1111-4111-8111-111111111111/pharmacies?lat=-34.6037&lng=-58.3816&radiusKm=10&orderBy=distance`.

Devuelve `product`, `pharmacies` y `pagination`. Cada resultado incluye `distanceKm` cuando se enviaron coordenadas; si no, `null`. Solo se muestran inventarios activos con cantidad positiva. Si se envían coordenadas, se excluyen farmacias sin coordenadas.

Distancia aproximada de gran círculo (km), no tiempo de viaje ni ruta real. El stock y el precio son informativos, no una reserva. No requiere autenticación.

El endpoint anterior sin parámetros sigue funcionando. La API de catálogo por texto `GET /api/catalog?q=...` no cambia.

**Validación previa al merge:** CI, pruebas de integración con PostgreSQL para orden y radio, y paginación con coordenadas. Los tests agregados son de validación de parámetros.

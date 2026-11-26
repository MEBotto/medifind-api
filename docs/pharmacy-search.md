# Búsqueda de farmacias

Endpoint autenticado: `GET /pharmacys` (se mantiene la ruta existente).

## Parámetros

| Parámetro | Tipo | Descripción |
| --- | --- | --- |
| search | string | Busca en nombre o dirección |
| name | string | Filtra por nombre |
| address | string | Filtra por dirección (campo `adress` en BD) |
| idShift | UUID | Turno asignado |
| shiftCode | string | Código del turno |
| hasShift | true/false | Con o sin turno |
| hasCoordinates | true/false | Con o sin geolocalización |
| hasProducts | true/false | Con o sin productos **activos** |
| favoritesOnly | true/false | Solo farmacias favoritas **activas del usuario autenticado** |
| onDuty | true/false | Farmacias del grupo de guardia (o fuera de él) según calendario anual |
| dutyDate | YYYY-MM-DD | Fecha local de Argentina para evaluar `onDuty`; por defecto hoy en `America/Argentina/Buenos_Aires` |
| productName | string | Nombre de producto activo |
| idCategory | UUID | Categoría de producto activo |
| idLaboratory | UUID | Laboratorio de producto activo |
| lat, lng | número | Coordenadas de referencia; deben enviarse juntas |
| radiusKm | número | Radio máximo (0-500 km, requiere coordenadas) |
| orderBy | name/address/distance/id | Campo de orden (distance requiere coordenadas) |
| order | ASC/DESC | Dirección del orden |
| page | entero | Página desde 1; predeterminado 1 |
| limit | entero | Registros por página, 1-100; predeterminado 20 |

El filtro `favoritesOnly=true` usa exclusivamente el usuario del JWT y la tabla `favourite_pharmacies` con `active=true`; no acepta `userId` desde el cliente. Puede combinarse con nombre, distancia, productos y demás filtros.\n\nLos filtros se combinan con AND. `search` combina nombre y dirección con OR. Los filtros de producto se evalúan sobre un mismo producto activo. Las búsquedas de texto ignoran mayúsculas/minúsculas.

Ejemplo:

```http
GET /pharmacys?search=central&lat=-34.6037&lng=-58.3816&radiusKm=5&hasProducts=true&productName=paracetamol&orderBy=distance&page=1&limit=20
```

La respuesta conserva el sobre estándar `status: success` y devuelve `data: { data: Pharmacy[], total, page, limit, totalPages }`. Esto cambia el contrato previo del listado (antes devolvía un arreglo directamente); adaptar los clientes existentes.

La distancia se calcula con fórmula esférica (km). No se implementa `openNow` porque el modelo todavía no dispone de zona horaria ni de un calendario de apertura estructurado: inferirlo a partir de `openingDays` sería incorrecto.

Los resultados de CI y las pruebas con PostgreSQL deben validarse antes del merge.

## Filtro de farmacias de turno

```http
GET /pharmacys?onDuty=true&dutyDate=2026-02-01&page=1&limit=20
```

El filtro se resuelve con la regla anual de mayor prioridad del calendario de turnos. `onDuty=true` devuelve farmacias asignadas al grupo de guardia; `onDuty=false` excluye ese grupo (incluye farmacias sin turno). Se combina con todos los demás filtros y la paginación existente.

La fecha se interpreta en la zona `America/Argentina/Buenos_Aires`. Sin `dutyDate`, se utiliza el día actual de esa zona, no el del servidor. `dutyDate` requiere `onDuty`. Si no hay calendario configurado, la API devuelve 404; reglas empatadas en prioridad devuelven 409. El sistema calcula guardias **por día**, todavía no contempla la hora exacta de relevo. No confundir con `openNow`, que depende de horarios comerciales aún pendientes de modelar.

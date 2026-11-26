# Farmacias favoritas

Todas las rutas requieren `Authorization: Bearer <JWT>`. La identidad del propietario se obtiene exclusivamente del JWT; el cliente no puede enviar `idUser`.

La ruta base se encuentra en el router existente de favoritos (ver `src/users/routes/favouritepharmacys.routes.ts`).

| Método | Ruta relativa | Descripción |
| --- | --- | --- |
| POST | / | Agrega una farmacia o reactiva un favorito existente |
| GET | / | Lista los favoritos activos del usuario |
| GET | /:id | Obtiene un favorito propio |
| PUT | /:id | Actualiza el campo `active` de un favorito propio |
| DELETE | /:id | Desactiva un favorito propio (`active=false`) |

### Crear

```json
{ "idPharmacy": "00000000-0000-4000-8000-000000000001" }
```

### Actualizar

```json
{ "active": false }
```

- La combinación usuario/farmacia tiene restricción de unicidad en la base de datos.
- Repetir POST de un favorito activo devuelve el registro existente.
- Repetir POST de un favorito inactivo lo reactiva.
- El borrado es lógico: no elimina el registro.
- Consultar o modificar un favorito ajeno devuelve 404.
- La búsqueda de farmacias admite `favoritesOnly=true`, que selecciona solo favoritos activos del usuario autenticado.
- No se permite modificar `idUser` ni `idPharmacy` mediante PUT.

El frontend debe dejar de enviar `idUser` al crear favoritos.

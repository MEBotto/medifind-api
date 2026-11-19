# Seguridad y autorización

## Rutas administrativas de usuarios

Las rutas `POST /api/users`, `GET /api/users/:id`, `PUT /api/users/:id` y `DELETE /api/users/:id` requieren autenticación JWT y rol `Admin` según el nombre de rol actualmente utilizado por el middleware.

Antes de este cambio, las rutas de consulta, modificación y eliminación por ID estaban expuestas sin autenticación. Ahora se aplica el control de acceso a todo el router de usuarios.

**Importante:** este cambio no implementa acceso del cliente a su propio perfil. Se agregará un endpoint específico como `GET /api/users/me` con autorización por identidad. Tampoco unifica todavía los nombres de roles con `ADMIN`, `PHARMACIST` y `CUSTOMER`; esa migración requiere revisar roles persistidos y el flujo de login.

## Próximos cambios de seguridad

- Eliminar el secreto JWT de respaldo y validar `JWT_SECRET` al iniciar.
- Evitar exponer el hash de contraseña en respuestas de registro, login y usuarios.
- Corregir la carga del rol al autenticar y asignar `CUSTOMER` al registro público.
- Implementar permisos por propiedad de recursos y farmacia.
- Agregar pruebas automatizadas de acceso autorizado y denegado.

## Verificación

Cambio revisado estáticamente. No se ejecutaron pruebas ni compilación en un entorno con dependencias instaladas.

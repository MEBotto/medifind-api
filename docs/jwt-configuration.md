# Configuración de JWT

La variable de entorno `JWT_SECRET` es obligatoria para iniciar la API.

1. Copiar `.env.example` a `.env`.
2. Configurar `JWT_SECRET` con una cadena aleatoria de alta entropía y mantenerla fuera del repositorio.
3. Iniciar el servidor con `npm run dev` o `npm start`.

Si `JWT_SECRET` falta o está vacío, el servidor debe fallar durante el arranque, antes de conectarse a la base de datos. Los endpoints de registro y login utilizan la misma clave que el middleware de verificación.

Este cambio elimina la clave de respaldo pública que se usaba anteriormente. Los JWT firmados con la clave anterior dejarán de ser válidos al configurar una clave distinta.

## Validación pendiente

- Comprobar el arranque con y sin `JWT_SECRET`.
- Ejecutar `npm run build` y las pruebas existentes.
- Incorporar pruebas automatizadas de configuración.

Este documento no afirma que las pruebas hayan sido ejecutadas.

# Pruebas locales e integración PostgreSQL

El PR #16 incorpora fixtures ficticios y pruebas **opt-in**. Nunca apuntar estas herramientas a producción.

## 1. Base aislada

Crear una base PostgreSQL **descartable**, configurar `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` y `DB_DATABASE` en el entorno de pruebas. No reutilizar una base con información real.

```bash
npm ci
npm run build
npm test -- --runInBand
```

## 2. Datos ficticios para exploración manual

En una base de desarrollo ya migrada:

```bash
ALLOW_DEMO_SEED=true npm run seed:pharmacy:demo
```

Carga 12 grupos A–L y una farmacia ficticia por grupo. Cada una tiene horarios independientes: lunes a viernes en dos franjas, algunas abren sábados, ninguna abre domingos habitualmente y la del grupo L abre 24 horas. Es repetible por nombre; no borra datos existentes. **No genera una configuración anual**: se debe configurar mediante `PUT /api/shifts/calendar/annual` con un token ADMIN.

## 3. Integración con base descartable

```bash
NODE_ENV=test DB_INTEGRATION_ISOLATED=true RUN_DB_INTEGRATION=true npm run test:integration
```

La base debe estar vacía y ser exclusivamente para esta prueba. `NODE_ENV=test` habilita `synchronize` en TypeORM, por lo que **no debe usarse sobre una base compartida**. La suite crea grupos, farmacias y reglas para 2026, verifica persistencia y filtrado, y elimina sus fixtures. Sin las tres variables, la suite no ejecuta conexiones ni mutaciones.

## 4. Verificaciones manuales

- `GET /api/shifts/calendar?year=2026&month=1` y `month=2` después de configurar el año.
- `GET /api/pharmacys?onDuty=true&dutyDate=2026-02-01` debe devolver únicamente el grupo G para la configuración ilustrativa.
- `PUT /api/pharmacys/:pharmacyId/hours` con usuario PHARMACIST asociado a esa farmacia debe aceptar el cambio; otro farmacéutico debe recibir 403.
- `GET /api/pharmacys?openNow=true` debe incluir el grupo de guardia vigente entre las 08:00 y las 08:00 del día siguiente, y farmacias abiertas por su horario normal.
- Verificar 07:59/08:00, medianoche, cambios de mes y año; los tests puros en `src/shifts/utils/active-duty-date.test.ts` cubren los límites de tiempo.

**Pendiente:** automatizar tests HTTP autenticados de permisos y pruebas de `openNow` con reloj controlado en PostgreSQL. Un CI verde por sí solo no demuestra esos escenarios.

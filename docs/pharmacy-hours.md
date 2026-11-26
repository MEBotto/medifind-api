# Horarios de atención y farmacias de turno

## Estado

Esta etapa está **en desarrollo**. No existen todavía los filtros HTTP `openNow` ni `onDuty`: no deben anunciarse como disponibles.

## Modelo actual

`Pharmacy` almacena `openingDays` como texto y `openingTime` / `closingTime` como horas, pero no tiene intervalos independientes por día ni zona horaria. `ShiftRotationRule` y `ShiftRotationRuleShift` describen reglas de rotación y su secuencia. Tener un `shift` asociado no implica automáticamente que la farmacia esté de turno en el instante actual.

## Primera implementación

`src/pharmacies/utils/opening-hours.ts` implementa una función pura para evaluar intervalos semanales (lunes=1 a domingo=7, formato HH:mm), con soporte para cierres después de medianoche, incluidos domingos que continúan el lunes. Los intervalos son semiabiertos: incluye la apertura y excluye el cierre. Una apertura y cierre iguales no se interpreta como 24 horas.

## Pendiente antes de exponer filtros

1. Crear esquema persistente de horarios por día y migración, con zona horaria explícita.
2. Modelar excepciones por feriados y cierres especiales.
3. Definir y probar la resolución de turnos activos a partir de reglas de rotación, prioridades y fechas.
4. Añadir endpoints de administración, validaciones y filtros SQL de búsqueda.
5. Incorporar pruebas de integración PostgreSQL y documentar contratos de API.

No inferir horarios actuales desde texto libre ni equiparar `hasShift` con `onDuty`.

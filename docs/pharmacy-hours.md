# Calendario anual de farmacias de turno

## Reglas confirmadas

Las farmacias pertenecen a 12 grupos (A–L). En enero participa una mitad de seis grupos y en febrero la otra mitad, sin solaparse. La asignación se configura **cada año** y no se infiere de años anteriores. De marzo a diciembre participan los doce grupos. Cada período tiene su propio día/grupo ancla; las reglas especiales no desplazan la referencia de la rotación general.

## Endpoints

### PUT /api/shifts/calendar/annual

Requiere JWT con rol `ADMIN`. Reemplaza transaccionalmente las tres reglas gestionadas para el año indicado y sus secuencias, preservando reglas externas. Los grupos A–L deben existir previamente en `shifts`.

```json
{
  "year": 2026,
  "january": ["A","B","C","D","E","F"],
  "february": ["G","H","I","J","K","L"],
  "januaryAnchor": { "day": 1, "group": "F" },
  "februaryAnchor": { "day": 1, "group": "G" },
  "generalAnchor": { "day": 1, "group": "K" }
}
```

**Este ejemplo es una configuración compatible con las capturas de fechas de 2026, no una confirmación del calendario real completo.** El administrador debe verificarlo antes de publicarlo.

Los anclajes permiten días del 1 al 28 para garantizar fechas válidas en todos los meses. La referencia general corresponde a marzo; enero y febrero tienen referencias independientes. Las prioridades son 10 para verano y 1 para la rotación general. El endpoint valida grupos únicos y partición completa 6+6.

### GET /api/shifts/calendar?year=2026&month=2

Requiere JWT. Devuelve `{year, month, rule, days}`, con un registro por fecha: `date` (YYYY-MM-DD), `group`, `shiftId` y `pharmacies`. Si no hay regla, responde 404; si hay empate de prioridad, 409; si la secuencia está incompleta, 422.

## Algoritmo

Para cada fecha, se calcula la diferencia en días UTC respecto del ancla de la regla elegida, y se aplica módulo sobre la secuencia ordenada por `position`. Así se admiten fechas anteriores al ancla y años bisiestos sin problemas de horario de verano.

## Límites y siguientes pasos

- No hay publicación/borrador de calendarios: la configuración entra en vigencia al guardarse.
- Las reglas manuales existentes pueden tener prioridad superior; los empates se rechazan.
- El calendario es por fecha, no resuelve la hora exacta de cambio de guardia.
- Los horarios de apertura al público son independientes y todavía no se exponen como `openNow`.
- Antes de usar en producción, validar los datos reales y añadir pruebas de integración con PostgreSQL.

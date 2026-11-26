# Nearby pharmacy availability

Authenticated endpoint: `GET /api/pharmacys/nearby?lat=-34.6037&lng=-58.3816&radiusKm=10&page=1&limit=20`

- Requires a JWT bearer token. Coordinates are mandatory; radius defaults to 10 km (maximum 500 km).
- Returns paginated pharmacies with coordinates, sorted by geographic distance (straight-line, **not driving distance**).
- Each item includes `distanceKm`, `onDuty`, `openNow`, `status` (`ON_DUTY`, `OPEN`, `CLOSED`), `nextOpeningAt`, `nextClosingAt`, coordinates and weekly schedule.
- `checkedAt` is UTC ISO; time calculations use `America/Argentina/Buenos_Aires`. Next opening/closing timestamps are UTC ISO.
- A pharmacy on duty is considered open regardless of its normal weekly schedule. When the current year's duty calendar is missing, regular opening hours remain available, but duty status cannot be inferred.
- `nextOpeningAt` describes the next **regular scheduled opening**, not a future duty shift. `nextClosingAt` is omitted for on-duty and 24-hour pharmacies, since the endpoint does not promise an exact duty closing time.
- Pharmacies without coordinates are excluded. Distance and schedule calculations are based on saved data and are not live confirmation from a pharmacy.

Example response data item:
```json
{
  "id": "pharmacy-uuid",
  "name": "Farmacia Ejemplo",
  "address": "Dirección",
  "lat": -34.6037,
  "lng": -58.3816,
  "distanceKm": 0,
  "onDuty": false,
  "openNow": true,
  "status": "OPEN",
  "open24Hours": false,
  "weeklyHours": [],
  "nextOpeningAt": null,
  "nextClosingAt": null
}
```

The response uses the existing API `sendSuccess` envelope and includes `total`, `page`, `limit`, `totalPages`, `checkedAt`, and `timeZone` within the payload.

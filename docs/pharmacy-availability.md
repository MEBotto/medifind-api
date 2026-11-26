# Pharmacy availability detail

`GET /api/pharmacys/:id/availability` requires JWT authentication.

The response uses the standard `sendSuccess` envelope and returns the pharmacy ID, name, address, phone, coordinates, shift group, `weeklyHours`, `open24Hours`, `status` (`ON_DUTY`, `OPEN`, `CLOSED`), `openNow`, `onDuty`, `nextOpeningAt`, `nextClosingAt`, `minutesUntilNextOpening`, `minutesUntilNextClosing`, `dutyEndsAt`, `calendarAvailable`, `checkedAt`, and `timeZone`.

The current duty runs from 08:00 local Argentina time until 08:00 the next day. `dutyEndsAt` is the end of the current duty period, not necessarily the pharmacy's actual closing time. For an on-duty pharmacy, regular next-closing information is null. The regular opening and closing estimates do not predict future guard assignments.

When a duty calendar is not configured, `calendarAvailable=false` and duty status cannot be determined; the endpoint still reports regular hours. Times are ISO UTC strings, with timezone `America/Argentina/Buenos_Aires`.

Invalid IDs return HTTP 400; unknown pharmacies return HTTP 404.

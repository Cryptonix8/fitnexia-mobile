# Services layer

Screens and hooks should call **services**, not `data/mock.ts` directly.

## MVP

- `data/mock.ts` backs mock implementations.
- Domain logic lives in `utils/` (e.g. `class-filters.ts`).

## v2+

Add per-domain modules, e.g.:

- `services/classes-service.ts` → `GET /classes`, `POST /classes`
- `services/bookings-service.ts` → `GET /bookings/me`, `POST /bookings`

Swap mock for `fetch` against `API_BASE_URL` (`types/api.ts`) without changing screen code.

Feature availability: `constants/features.ts` (later `GET /config/features`).

# Services layer

Screens and hooks should depend on **services/repositories**, not on `data/mock.ts` directly.

## Layout

```
services/
  repositories/     # Domain interfaces + mock implementations (MVP)
  api-client.ts     # fetch wrapper (future)
```

## MVP

- `data/mock.ts` backs mock implementations.
- Domain logic lives in `utils/` (e.g. `class-filters.ts`).
- Feature availability: `constants/features.ts` (later `GET /config/features`).

## Migration path

1. MVP: contexts call mock data; adopt repository interfaces (e.g. `ClassesRepository`) as APIs land.
2. v2+: add per-domain modules (`classes-service.ts`, `bookings-service.ts`) and swap to `Api*Repository` using `types/api.ts` DTOs.
3. Feature flags gate UI; repositories may return `FEATURE_NOT_AVAILABLE` for disabled endpoints when needed.

## Example

```ts
// services/repositories/classes.repository.ts
export interface ClassesRepository {
  list(): ClassListItem[];
  getById(id: string): ClassListItem | undefined;
}
```

Contexts (`classes-context.tsx`) will adopt this interface when the backend is connected.

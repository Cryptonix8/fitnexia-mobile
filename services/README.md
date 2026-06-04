# Services layer

Screens and hooks should depend on **repositories**, not on `data/mock.ts` directly.

## Layout

```
services/
  repositories/     # Domain interfaces + mock implementations (MVP)
  api-client.ts     # fetch wrapper (future)
```

## Migration path

1. MVP: contexts call mock repositories (`MockClassesRepository`, etc.).
2. v2+: swap to `ApiClassesRepository` using `types/api.ts` DTOs.
3. Feature flags in `constants/features.ts` gate UI; repositories return `FEATURE_NOT_AVAILABLE` for disabled endpoints when needed.

## Example

```ts
// services/repositories/classes.repository.ts
export interface ClassesRepository {
  list(): Promise<ClassListItem[]>;
  getById(id: string): Promise<ClassListItem | undefined>;
}
```

Contexts (`classes-context.tsx`) will adopt this interface when the backend is connected.

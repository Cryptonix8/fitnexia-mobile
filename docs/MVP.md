# Fitnexia Mobile — MVP scope

This document aligns the mobile app with product requirements. **API contracts stay in `types/api.ts` and `docs/openapi.yaml`** — post-MVP fields remain optional; UI and behavior are gated via `constants/features.ts`.

## MVP enabled (`FEATURES.* = true`)

| Area | Capability |
|------|------------|
| Auth | Email + password, onboarding, role selection, password recovery UI |
| Athlete | Basic search (sport, location, schedule, price, modality), book class (mock confirm), booking history, reviews after class |
| Instructor | Profile, publish/edit classes, calendar, availability, Available now |
| Gym | Institution profile, staff, group classes, dashboard, staff reviews |
| All | Profile editing, notification **preferences** (not in-app inbox) |

## Post-MVP (hidden in UI — `FEATURES.* = false`)

| Feature | Target | Flag |
|---------|--------|------|
| Google sign-in | v2 | `googleSignIn` |
| Mercado Pago / payouts / payment methods | v2 | `integratedPayments` |
| Payment models (monthly, per period) | v2 | `paymentModels` |
| Apple Pay / Google Pay | v2 | `digitalWallets` |
| Multi-currency | v2 | `multiCurrency` |
| Waitlist | v2 | `waitlist` |
| Recurring classes | v2 | `recurringClasses` |
| Live streaming | v2 | `liveStreaming` |
| Recorded VOD | v3 | `recordedClasses` |
| Loyalty credits | v2 | `loyaltyCredits` |
| Advanced search (level, language, gender) | v2 | `advancedSearch` |
| Map / geolocation | v2 | `geolocationMap` |
| Review responses | v2 | `reviewResponses` |
| In-app notification center | v2 | `inAppNotificationCenter` |
| Gym metrics & charts | v2 | `gymMetrics` |
| Platform support tickets | v2 | `platformSupport` |

## How to enable a feature later

1. Set the flag to `true` in `constants/features.ts` (or load from `GET /config/features`).
2. Implement/wire the API client in `services/` (see `services/README.md`).
3. Unhide related UI (search for `isFeatureEnabled` / `useFeature` in the codebase).
4. Update this doc and `docs/API.md` §19 if scope changed.

## Architecture notes

- **Screens** → **hooks/contexts** → **`services/repositories`** → API (future) / mock (now).
- Do not import `MOCK_*` directly from screens when adding real API calls.
- Do not remove post-MVP types from `types/api.ts`.

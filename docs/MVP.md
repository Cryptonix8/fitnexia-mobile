# Fitnexia Mobile — MVP scope

Source of truth for what ships in **v1** vs later. API contract remains in [`API.md`](./API.md) and [`openapi.yaml`](./openapi.yaml).

Feature flags: [`constants/features.ts`](../constants/features.ts).

## In MVP (mobile)

| Area | Included |
|------|----------|
| Auth | Email + password, role selection, onboarding, password recovery UI |
| Athlete | Basic search (sport, location, modality, schedule, price), book class (mock confirm), booking history, reviews, profile edit |
| Instructor | Profile, publish/edit classes, calendar, availability, Available now, earnings mock |
| Gym | Dashboard, staff, classes, staff reviews, institution profile |
| Payments | **Mock** confirm only — no Mercado Pago / wallets in UI |

## Post-MVP (hidden via feature flags)

| Feature | Flag | Target |
|---------|------|--------|
| Google sign-in | `googleSignIn` | v2 |
| Advanced search (level, language, gender) | `advancedSearch` | v2 |
| Recurring classes | `recurringClasses` | v2 |
| Live streaming | `liveStreaming` | v2 |
| Recorded VOD | `recordedClasses` | v3 |
| Waitlist | `waitlist` | v2 |
| Multi-currency | `multipleCurrencies` | v2 |
| Apple / Google Pay | `digitalWallets` | v2 |
| Monthly / period subscriptions | `subscriptionPaymentModels` | v2 |
| Mercado Pago checkout | `integratedPayments` | v2 |
| Loyalty credits | `loyaltyCredits` | v2 |
| Instructor review replies | `reviewResponses` | v2 |
| In-app notification inbox | `inAppNotificationCenter` | v2 |
| Gym analytics tab | `analyticsMetrics` | v2 |
| Support tickets | `platformSupport` | v2 |
| Saved payment methods | `savedPaymentMethods` | v2 |

## Enabling a feature later

1. Set flag to `true` in `constants/features.ts` (or wire API config).
2. Implement service + API endpoints.
3. QA the flow end-to-end.

Types in `types/api.ts` already include optional fields for most post-MVP concepts — do not remove them.

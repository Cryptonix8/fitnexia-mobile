# Fitnexia

Marketplace app connecting athletes, instructors, and gyms. Mobile client built with [Expo](https://expo.dev) and [Expo Router](https://docs.expo.dev/router/introduction/).

## API documentation

The backend API is shared by **web**, **mobile**, and the **admin panel**:

- [API reference (Markdown)](./docs/API.md)
- [OpenAPI 3 spec](./docs/openapi.yaml) — use with Swagger UI or client codegen
- [TypeScript types](./types/api.ts) — shared client types

Staging base URL: `https://api.staging.fitnexia.com/v1` (set `EXPO_PUBLIC_API_URL` in `.env` when integrating).

## Mobile UI (API-backed)

The app connects to the Fitnexia API. Copy `.env.example` to `.env` and set:

```
EXPO_PUBLIC_API_URL=http://localhost:3001/v1
```

Start the backend first (`cd backend && npm run dev`), then `npx expo start`.

**Demo login:** `demo@fitnexia.com` / `password`

**Athlete:** Home, Search, Bookings, Profile (+ class detail, payment, reviews)  
**Instructor:** Dashboard, Classes, Calendar, Earnings, Profile (+ create class)  
**Gym:** Dashboard, Staff, Classes, Metrics, Institution profile

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

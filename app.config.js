/** @type {import('expo/config').ExpoConfig} */
const appJson = require('./app.json');

// Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in .env (Maps SDK for Android must be enabled in GCP).
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || '';

module.exports = {
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      config: {
        ...appJson.expo.android?.config,
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    ios: {
      ...appJson.expo.ios,
      config: {
        ...appJson.expo.ios?.config,
        googleMapsApiKey,
      },
    },
  },
};

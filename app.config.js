/** @type {import('expo/config').ExpoConfig} */
// Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in .env (Maps SDK for Android must be enabled in GCP).
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || '';

module.exports = ({ config }) => ({
  expo: {
    ...config,
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMapsApiKey,
      },
    },
  },
});

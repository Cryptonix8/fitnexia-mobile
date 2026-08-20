/** @type {import('expo/config').ExpoConfig} */
// Expo loads app.json first and passes it in as `config`.
// Only apply the dynamic Google Maps keys here so app.json remains the source of truth.
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || '';

module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        ...config.android?.config?.googleMaps,
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
});

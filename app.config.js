/** @type {import('expo/config').ExpoConfig} */
// Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in .env (Maps SDK for Android must be enabled in GCP).
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || '';
const baseConfig = require('./app.json').expo;

module.exports = ({ config }) => ({
  expo: {
    ...baseConfig,
    ...config,
    android: {
      ...baseConfig.android,
      ...config.android,
      config: {
        ...baseConfig.android?.config,
        ...config.android?.config,
        googleMaps: {
          ...baseConfig.android?.config?.googleMaps,
          apiKey: googleMapsApiKey,
        },
      },
    },
    ios: {
      ...baseConfig.ios,
      ...config.ios,
      config: {
        ...baseConfig.ios?.config,
        ...config.ios?.config,
        googleMapsApiKey,
      },
    },
  },
});

const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// @react-native-firebase ships ESM via package.json "exports". Metro's export
// resolution can serve those modules as lazy eval chunks that Hermes cannot parse.
config.resolver.unstable_enablePackageExports = false;
config.resolver.sourceExts.push('cjs');

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
});

module.exports = config;

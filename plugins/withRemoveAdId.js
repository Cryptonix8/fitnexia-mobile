const { withAndroidManifest } = require('expo/config-plugins');

const AD_ID_PERMISSION = 'com.google.android.gms.permission.AD_ID';

/**
 * Firebase Analytics automatically merges the AD_ID permission into the
 * AndroidManifest. Fitnexia does not use the advertising ID, so we tell the
 * manifest merger to strip it via `tools:node="remove"`. This avoids the
 * Play Console advertising-ID declaration.
 */
module.exports = function withRemoveAdId(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    manifest.$ = manifest.$ || {};
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    manifest['uses-permission'] = manifest['uses-permission'] || [];

    const alreadyRemoved = manifest['uses-permission'].some(
      (perm) =>
        perm.$?.['android:name'] === AD_ID_PERMISSION &&
        perm.$?.['tools:node'] === 'remove'
    );

    if (!alreadyRemoved) {
      manifest['uses-permission'] = manifest['uses-permission'].filter(
        (perm) => perm.$?.['android:name'] !== AD_ID_PERMISSION
      );

      manifest['uses-permission'].push({
        $: {
          'android:name': AD_ID_PERMISSION,
          'tools:node': 'remove',
        },
      });
    }

    return config;
  });
};

const { AndroidConfig, withAndroidManifest, withDangerousMod, withMainApplication } =
  require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const CERT_FILES = ['isrg_root_ye.crt', 'isrg_ye1.crt', 'isrg_ye2.crt', 'isrg_ye3.crt'];
const INSTALL_LINE = '    ApiTls.install(this)';

function copyFile(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function withAndroidApiTls(config) {
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const pluginDir = path.join(projectRoot, 'plugins', 'api-tls');
      const mainRoot = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main');

      copyFile(
        path.join(pluginDir, 'network_security_config.xml'),
        path.join(mainRoot, 'res', 'xml', 'network_security_config.xml'),
      );

      for (const fileName of CERT_FILES) {
        copyFile(
          path.join(pluginDir, 'certs', fileName),
          path.join(mainRoot, 'res', 'raw', fileName),
        );
      }

      copyFile(
        path.join(pluginDir, 'ApiTls.kt'),
        path.join(mainRoot, 'java', 'com', 'fitnexia', 'app', 'ApiTls.kt'),
      );

      return config;
    },
  ]);

  config = withAndroidManifest(config, (config) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    app.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    return config;
  });

  config = withMainApplication(config, (config) => {
    let src = config.modResults.contents;
    if (!src.includes('ApiTls.install')) {
      src = src.replace(
        'override fun onCreate() {\n    super.onCreate()',
        `override fun onCreate() {\n    super.onCreate()\n${INSTALL_LINE}`,
      );
      config.modResults.contents = src;
    }
    return config;
  });

  return config;
}

module.exports = withAndroidApiTls;

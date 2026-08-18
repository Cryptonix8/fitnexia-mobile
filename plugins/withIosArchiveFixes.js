const {
  withDangerousMod,
  withXcodeProject,
  withEntitlementsPlist,
  withInfoPlist,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const PODFILE_MARKER = '# @generated begin fitnexia-ios-archive-fixes';

const PODFILE_SNIPPET = `${PODFILE_MARKER}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
        build_config.build_settings[
          'CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'
        ] = 'YES'

        if target.name.include?('livekit') || target.name.include?('webrtc')
          flags = build_config.build_settings['OTHER_CFLAGS'] || ['$(inherited)']
          flags = flags.split(' ') if flags.is_a?(String)
          flag = '-Wno-non-modular-include-in-framework-module'
          flags << flag unless flags.include?(flag)
          build_config.build_settings['OTHER_CFLAGS'] = flags
        end

        if target.name.start_with?('RNFB')
          build_config.build_settings['CLANG_ENABLE_MODULES'] = 'NO'
        end
      end

      if target.respond_to?(:product_type) && target.product_type == 'com.apple.product-type.bundle'
        target.build_configurations.each do |build_config|
          build_config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        end
      end
    end
    # @generated end fitnexia-ios-archive-fixes
`;

function withIosArchiveFixes(config) {
  config = withEntitlementsPlist(config, (config) => {
    config.modResults['aps-environment'] = 'production';
    return config;
  });

  config = withInfoPlist(config, (config) => {
    config.modResults.ITSAppUsesNonExemptEncryption = false;
    return config;
  });

  config = withXcodeProject(config, (config) => {
    const project = config.modResults;
    const configurations = project.pbxXCBuildConfigurationSection();

    for (const key of Object.keys(configurations)) {
      const buildSettings = configurations[key]?.buildSettings;
      if (!buildSettings) continue;
      buildSettings.ENABLE_USER_SCRIPT_SANDBOXING = 'NO';
      buildSettings.ENABLE_BITCODE = 'NO';
    }

    return config;
  });

  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf8');

      if (contents.includes(PODFILE_MARKER)) {
        return config;
      }

      const postInstallNeedle = 'react_native_post_install(';
      const needleIndex = contents.lastIndexOf(postInstallNeedle);
      if (needleIndex === -1) {
        throw new Error('Could not find react_native_post_install in Podfile');
      }

      const afterCall = contents.indexOf(')', contents.indexOf('\n', needleIndex));
      if (afterCall === -1) {
        throw new Error('Could not find end of react_native_post_install call in Podfile');
      }

      contents =
        contents.slice(0, afterCall + 1) +
        `\n\n${PODFILE_SNIPPET}` +
        contents.slice(afterCall + 1);

      fs.writeFileSync(podfilePath, contents);
      return config;
    },
  ]);

  return config;
}

module.exports = withIosArchiveFixes;

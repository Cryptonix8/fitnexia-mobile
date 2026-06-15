import Constants from 'expo-constants';

function isNativeDevBuild(): boolean {
  return Constants.appOwnership !== 'expo';
}

export async function getFirebaseInstallationId(): Promise<string | null> {
  if (!isNativeDevBuild()) {
    if (__DEV__) {
      console.warn(
        '[firebase] Installation ID requires a development build. Run: npx expo run:android',
      );
    }
    return null;
  }

  try {
    const { default: installations } = await import('@react-native-firebase/installations');
    return await installations().getId();
  } catch (err) {
    console.warn('[firebase] Failed to get Installation ID:', err);
    return null;
  }
}

import installations from '@react-native-firebase/installations';

export async function getFirebaseInstallationId(): Promise<string | null> {
  try {
    return await installations().getId();
  } catch (err) {
    console.warn('[firebase] Failed to get Installation ID:', err);
    return null;
  }
}

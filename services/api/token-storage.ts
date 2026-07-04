import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_KEY = 'fitnexia_access_token';
const REFRESH_KEY = 'fitnexia_refresh_token';
const ACCESS_EXPIRES_KEY = 'fitnexia_access_expires_at';

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_KEY);
}

export async function getAccessExpiresAt(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(ACCESS_EXPIRES_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function setTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn?: number,
): Promise<void> {
  const pairs: [string, string][] = [
    [ACCESS_KEY, accessToken],
    [REFRESH_KEY, refreshToken],
  ];
  if (expiresIn != null && expiresIn > 0) {
    pairs.push([ACCESS_EXPIRES_KEY, String(Date.now() + expiresIn * 1000)]);
  }
  await AsyncStorage.multiSet(pairs);
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY, ACCESS_EXPIRES_KEY]);
}

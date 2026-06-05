import Constants from 'expo-constants';
import { Platform } from 'react-native';

function extractPort(url: string | undefined, fallback = '3001'): string {
  if (!url) return fallback;
  const match = url.match(/:(\d+)/);
  return match?.[1] ?? fallback;
}

function resolveDevHost(): string {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  }

  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }

  return 'localhost';
}

function buildApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  const port = extractPort(envUrl);
  const host = resolveDevHost();
  return `http://${host}:${port}/v1`;
}

export const API_BASE_URL = buildApiBaseUrl();

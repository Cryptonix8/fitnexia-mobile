/**
 * Normalizes incoming deep links before Expo Router handles them.
 * Fixes fitnexia://reset-password?token=… when opened from email / browser.
 */
export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}): string {
  try {
    const raw = path.trim();
    if (!raw || !raw.includes('reset-password')) {
      return path;
    }

    if (raw.startsWith('/reset-password')) {
      return raw;
    }

    const url = raw.includes('://') ? new URL(raw) : new URL(raw, 'fitnexia:///');
    const token = url.searchParams.get('token');
    if (token) {
      return `/reset-password?token=${encodeURIComponent(token)}`;
    }

    return '/reset-password';
  } catch {
    return path;
  }
}

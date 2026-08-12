/**
 * In-app browser helpers (Guideline 4).
 * Never use Linking.openURL / system Safari for authentication or account creation.
 * Prefer ASWebAuthenticationSession (openAuthSessionAsync) so content stays in-app.
 */
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

/**
 * Open a URL inside the app (Safari View Controller / Chrome Custom Tabs).
 * Use for OAuth payout connect and payment checkouts — not for login/register.
 */
export async function openInAppBrowser(url: string, redirectUrl?: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return { type: 'opened' as const };
  }

  if (redirectUrl) {
    return WebBrowser.openAuthSessionAsync(url, redirectUrl);
  }

  return WebBrowser.openBrowserAsync(url, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    createTask: false,
  });
}

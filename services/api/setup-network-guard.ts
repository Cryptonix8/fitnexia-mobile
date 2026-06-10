import { API_BASE_URL } from './config';
import { ApiError } from './errors';

function isFetchPolyfillRangeError(reason: unknown): boolean {
  return (
    reason instanceof RangeError &&
    /response|status/i.test(reason.message) &&
    /0|range/i.test(reason.message)
  );
}

function isBenignNetworkFailure(reason: unknown): boolean {
  if (isFetchPolyfillRangeError(reason)) return true;
  if (reason instanceof ApiError && reason.code === 'NETWORK_ERROR') return true;
  if (reason instanceof SyntaxError && /json|unexpected end of input/i.test(reason.message)) {
    return true;
  }
  return false;
}

function logNetworkWarning(reason?: unknown) {
  if (!__DEV__) return;
  if (reason instanceof ApiError) {
    console.warn(`[Fitnexia] ${reason.message}`);
    return;
  }
  if (reason instanceof SyntaxError) {
    console.warn(
      `[Fitnexia] Invalid or empty API response. Check that the backend is running at ${API_BASE_URL}.`,
    );
    return;
  }
  console.warn(
    `[Fitnexia] Network request failed. Check that the API is running at ${API_BASE_URL}.`,
  );
}

function installNetworkGuard() {
  const globalAny = globalThis as typeof globalThis & {
    __fitnexiaNetworkGuardInstalled?: boolean;
    ErrorUtils?: {
      getGlobalHandler: () => (error: Error, isFatal?: boolean) => void;
      setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
    };
  };

  if (globalAny.__fitnexiaNetworkGuardInstalled) return;
  globalAny.__fitnexiaNetworkGuardInstalled = true;

  if (typeof globalAny.addEventListener === 'function') {
    globalAny.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      if (!isBenignNetworkFailure(event.reason)) return;
      event.preventDefault();
      logNetworkWarning(event.reason);
    });
  }

  const errorUtils = globalAny.ErrorUtils;
  if (errorUtils?.getGlobalHandler && errorUtils?.setGlobalHandler) {
    const defaultHandler = errorUtils.getGlobalHandler();
    errorUtils.setGlobalHandler((error, isFatal) => {
      if (isBenignNetworkFailure(error)) {
        logNetworkWarning(error);
        return;
      }
      defaultHandler(error, isFatal);
    });
  }
}

installNetworkGuard();

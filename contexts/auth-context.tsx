import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  forgotPasswordApi,
  googleSignInApi,
  appleSignInApi,
  type GoogleSignInParams,
  type AppleSignInParams,
  closeAccountApi,
  loadCurrentUser,
  loginApi,
  logoutApi,
  registerApi,
  resetPasswordApi,
  setAvailableNowApi,
  updateAthleteProfileApi,
  updateInstructorProfileApi,
  updateInstitutionProfileApi,
  updateNotificationPrefsApi,
  updateUserAccountApi,
} from '@/services/api/auth.api';
import { refreshSession } from '@/services/api/client';
import {
  cancelSessionRefreshTimer,
  resetSessionExpiredFlag,
  scheduleSessionRefresh,
  subscribeSessionExpired,
} from '@/services/api/session';
import { clearTokens, getAccessToken } from '@/services/api/token-storage';
import { getOnboardingComplete, setOnboardingComplete } from '@/services/onboarding-storage';
import { getErrorMessage } from '@/services/api/errors';
import {
  registerForPushNotifications,
  unregisterPushNotifications,
} from '@/services/push-notifications';
import { DEFAULT_CURRENCY } from '@/constants/currency';
import { resolveMediaUrl, resolveMediaUrls } from '@/services/api/media.api';
import type { UserRole } from '@/types/api';
import type { AuthUser, RegisterParams, UpdateProfileParams } from '@/types/auth-user';
import { markSessionExpiredAlertPending } from '@/utils/auth-navigation';

export type {
  AuthUser,
  InstitutionProfileData,
  InstructorInvite,
  InstructorProfileData,
  NotificationPreferences,
  PaymentMethod,
  RegisterParams,
  UpdateProfileParams,
} from '@/types/auth-user';
export {
  DEFAULT_NOTIFICATIONS,
  defaultInstructorProfile,
  defaultInstitutionProfile,
} from '@/types/auth-user';

interface AuthContextValue {
  user: AuthUser | null;
  hasSeenOnboarding: boolean;
  isLoading: boolean;
  completeOnboarding: () => void;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  loginWithGoogle: (params: GoogleSignInParams) => Promise<void>;
  loginWithApple: (params: AppleSignInParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  updateProfile: (updates: UpdateProfileParams) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  closeAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const startSessionMonitor = useCallback(() => {
    void scheduleSessionRefresh(refreshSession);
  }, []);

  const handleSessionExpired = useCallback(async () => {
    cancelSessionRefreshTimer();
    await clearTokens();
    markSessionExpiredAlertPending();
    setUser(null);
  }, []);

  const markOnboardingComplete = useCallback(async () => {
    await setOnboardingComplete();
    setHasSeenOnboarding(true);
  }, []);

  useEffect(() => {
    return subscribeSessionExpired(() => {
      void handleSessionExpired();
    });
  }, [handleSessionExpired]);

  const refreshUser = useCallback(async () => {
    const refreshed = await loadCurrentUser();
    if (refreshed) setUser(refreshed);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const seenOnboarding = await getOnboardingComplete();
        if (active) setHasSeenOnboarding(seenOnboarding);

        const token = await getAccessToken();
        if (token) {
          const current = await loadCurrentUser();
          if (active && current) {
            setUser(current);
            resetSessionExpiredFlag();
            startSessionMonitor();
            registerForPushNotifications().catch(() => undefined);
          }
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [startSessionMonitor]);

  const completeOnboarding = useCallback(() => {
    void markOnboardingComplete();
  }, [markOnboardingComplete]);

  const login = useCallback(async (email: string, password: string) => {
    const loggedIn = await loginApi(email, password);
    resetSessionExpiredFlag();
    await markOnboardingComplete();
    setUser(loggedIn);
    startSessionMonitor();
    registerForPushNotifications().catch((err) => {
      console.warn('Push registration failed:', getErrorMessage(err));
    });
  }, [startSessionMonitor, markOnboardingComplete]);

  const loginWithGoogle = useCallback(async (params: GoogleSignInParams) => {
    const loggedIn = await googleSignInApi(params);
    resetSessionExpiredFlag();
    await markOnboardingComplete();
    setUser(loggedIn);
    startSessionMonitor();
    registerForPushNotifications().catch((err) => {
      console.warn('Push registration failed:', getErrorMessage(err));
    });
  }, [startSessionMonitor, markOnboardingComplete]);

  const loginWithApple = useCallback(async (params: AppleSignInParams) => {
    const loggedIn = await appleSignInApi(params);
    resetSessionExpiredFlag();
    await markOnboardingComplete();
    setUser(loggedIn);
    startSessionMonitor();
    registerForPushNotifications().catch((err) => {
      console.warn('Push registration failed:', getErrorMessage(err));
    });
  }, [startSessionMonitor, markOnboardingComplete]);

  const register = useCallback(async (params: RegisterParams) => {
    const registered = await registerApi(params);
    resetSessionExpiredFlag();
    await markOnboardingComplete();
    setUser(registered);
    startSessionMonitor();
    registerForPushNotifications().catch((err) => {
      console.warn('Push registration failed:', getErrorMessage(err));
    });
  }, [startSessionMonitor, markOnboardingComplete]);

  const updateProfile = useCallback(
    async (updates: UpdateProfileParams) => {
      if (!user) return;

      const photoUrl =
        updates.avatarUri !== undefined ? await resolveMediaUrl(updates.avatarUri) : undefined;

      if (updates.email !== undefined) {
        const nextEmail = updates.email.trim();
        if (nextEmail.toLowerCase() !== user.email.toLowerCase()) {
          await updateUserAccountApi({ email: nextEmail });
        }
      }

      if (user.role === 'athlete') {
        const body: Record<string, unknown> = {};
        if (updates.firstName !== undefined) body.firstName = updates.firstName;
        if (updates.lastName !== undefined) body.lastName = updates.lastName;
        if (updates.avatarUri !== undefined) body.photoUrl = photoUrl;
        if (updates.favoriteSports !== undefined) body.favoriteSports = updates.favoriteSports;
        if (Object.keys(body).length) await updateAthleteProfileApi(body);
      }

      if (user.role === 'instructor') {
        const p = updates.instructorProfile;
        const body: Record<string, unknown> = {};
        if (p?.displayName !== undefined) body.displayName = p.displayName;
        if (p?.bio !== undefined) body.bio = p.bio;
        if (p?.disciplines !== undefined) body.disciplines = p.disciplines;
        if (p?.certifications !== undefined) body.certifications = p.certifications;
        if (p?.weeklySchedule !== undefined) body.weeklySchedule = p.weeklySchedule;
        if (p?.hourlyRate !== undefined && p.hourlyRate !== '') {
          body.hourlyRate = {
            amount: Math.round(parseFloat(p.hourlyRate) * 100),
            currency: DEFAULT_CURRENCY,
          };
        }
        if (p?.gender !== undefined) body.gender = p.gender;
        if (updates.avatarUri !== undefined) body.photoUrl = photoUrl;
        if (Object.keys(body).length) await updateInstructorProfileApi(body);
        if (p?.availableNow !== undefined) {
          await setAvailableNowApi(p.availableNow);
        }
      }

      if (user.role === 'institution') {
        const p = updates.institutionProfile;
        const body: Record<string, unknown> = {};
        if (p?.name !== undefined) body.name = p.name;
        if (p?.description !== undefined) body.description = p.description;
        if (p?.gallery !== undefined) {
          body.gallery = await resolveMediaUrls(p.gallery);
        }
        if (updates.avatarUri !== undefined) body.logoUrl = photoUrl;
        if (p?.address !== undefined || p?.city !== undefined || p?.country !== undefined) {
          body.location = {
            address: p.address ?? user.institutionProfile?.address ?? '',
            city: p.city ?? user.institutionProfile?.city ?? '',
            country: p.country ?? user.institutionProfile?.country ?? '',
          };
        }
        if (p?.contactPhone !== undefined) body.contactPhone = p.contactPhone;
        if (p?.contactEmail !== undefined) body.contactEmail = p.contactEmail;
        if (p?.website !== undefined) body.website = p.website;
        if (p?.openingHours !== undefined) body.openingHours = p.openingHours;
        if (Object.keys(body).length) await updateInstitutionProfileApi(body);
      }

      if (updates.notificationPreferences) {
        await updateNotificationPrefsApi(updates.notificationPreferences);
      }

      await refreshUser();
    },
    [user, refreshUser],
  );

  const logout = useCallback(async () => {
    cancelSessionRefreshTimer();
    await unregisterPushNotifications();
    await logoutApi();
    setUser(null);
  }, []);

  const closeAccount = useCallback(async () => {
    cancelSessionRefreshTimer();
    await unregisterPushNotifications();
    await closeAccountApi();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      hasSeenOnboarding,
      isLoading,
      completeOnboarding,
      login,
      loginWithGoogle,
      loginWithApple,
      register,
      updateProfile,
      refreshUser,
      logout,
      closeAccount,
    }),
    [
      user,
      hasSeenOnboarding,
      isLoading,
      completeOnboarding,
      login,
      loginWithGoogle,
      loginWithApple,
      register,
      updateProfile,
      refreshUser,
      logout,
      closeAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { forgotPasswordApi, resetPasswordApi, getErrorMessage };

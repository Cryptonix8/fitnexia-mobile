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
  type GoogleSignInParams,
  loadCurrentUser,
  loginApi,
  logoutApi,
  registerApi,
  setAvailableNowApi,
  updateAthleteProfileApi,
  updateInstructorProfileApi,
  updateInstitutionProfileApi,
  updateNotificationPrefsApi,
  updateUserAccountApi,
} from '@/services/api/auth.api';
import { getAccessToken } from '@/services/api/token-storage';
import { getErrorMessage } from '@/services/api/errors';
import { resolveMediaUrl, resolveMediaUrls } from '@/services/api/media.api';
import type { Certification, UserRole, WeeklySchedule } from '@/types/api';
import { defaultWeeklySchedule } from '@/utils/schedule';

export interface NotificationPreferences {
  bookingConfirmed: boolean;
  classReminders: boolean;
  paymentUpdates: boolean;
  creditsExpiring: boolean;
  marketing: boolean;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export interface InstructorProfileData {
  displayName: string;
  bio: string;
  disciplines: string[];
  certifications: Certification[];
  availableNow: boolean;
  weeklySchedule: WeeklySchedule;
  hourlyRate: string;
  verified: boolean;
}

export interface InstructorInvite {
  id: string;
  email: string;
  sentAt: string;
  status: 'pending' | 'accepted';
}

export interface InstitutionProfileData {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  verified: boolean;
  gallery: string[];
  instructorIds: string[];
  pendingInvites: InstructorInvite[];
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatarUri?: string | null;
  favoriteSports: string[];
  notificationPreferences: NotificationPreferences;
  paymentMethods: PaymentMethod[];
  instructorId?: string;
  instructorProfile?: InstructorProfileData;
  institutionId?: string;
  institutionProfile?: InstitutionProfileData;
}

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  bookingConfirmed: true,
  classReminders: true,
  paymentUpdates: true,
  creditsExpiring: true,
  marketing: false,
};

export function defaultInstructorProfile(
  firstName: string,
  lastName: string,
  disciplines: string[] = [],
): InstructorProfileData {
  return {
    displayName: `${firstName} ${lastName}`.trim(),
    bio: '',
    disciplines,
    certifications: [],
    availableNow: false,
    weeklySchedule: defaultWeeklySchedule(),
    hourlyRate: '',
    verified: false,
  };
}

export function defaultInstitutionProfile(name: string): InstitutionProfileData {
  return {
    name,
    description: '',
    address: '',
    city: '',
    country: '',
    verified: false,
    gallery: [],
    instructorIds: [],
    pendingInvites: [],
  };
}

export type RegisterParams = {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatarUri?: string | null;
  favoriteSports?: string[];
  disciplines?: string[];
  institutionName?: string;
};

export type UpdateProfileParams = Partial<
  Pick<AuthUser, 'firstName' | 'lastName' | 'email' | 'avatarUri' | 'favoriteSports'>
> & {
  notificationPreferences?: Partial<NotificationPreferences>;
  paymentMethods?: PaymentMethod[];
  instructorProfile?: Partial<InstructorProfileData>;
  institutionProfile?: Partial<InstitutionProfileData>;
};

interface AuthContextValue {
  user: AuthUser | null;
  hasSeenOnboarding: boolean;
  isLoading: boolean;
  completeOnboarding: () => void;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  loginWithGoogle: (params: GoogleSignInParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  updateProfile: (updates: UpdateProfileParams) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const refreshed = await loadCurrentUser();
    if (refreshed) setUser(refreshed);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const current = await loadCurrentUser();
          if (active && current) setUser(current);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const completeOnboarding = useCallback(() => {
    setHasSeenOnboarding(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedIn = await loginApi(email, password);
    setUser(loggedIn);
  }, []);

  const loginWithGoogle = useCallback(async (params: GoogleSignInParams) => {
    const loggedIn = await googleSignInApi(params);
    setUser(loggedIn);
  }, []);

  const register = useCallback(async (params: RegisterParams) => {
    const registered = await registerApi(params);
    setUser(registered);
  }, []);

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
            currency: 'USD',
          };
        }
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
    await logoutApi();
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
      register,
      updateProfile,
      refreshUser,
      logout,
    }),
    [
      user,
      hasSeenOnboarding,
      isLoading,
      completeOnboarding,
      login,
      loginWithGoogle,
      register,
      updateProfile,
      refreshUser,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { DEFAULT_NOTIFICATIONS, forgotPasswordApi, getErrorMessage };

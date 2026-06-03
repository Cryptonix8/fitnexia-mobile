import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { UserRole } from '@/types/api';

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
  availableNow: boolean;
  hourlyRate: string;
  verified: boolean;
}

export interface InstitutionProfileData {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  verified: boolean;
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
  instructorProfile?: InstructorProfileData;
  institutionProfile?: InstitutionProfileData;
}

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  bookingConfirmed: true,
  classReminders: true,
  paymentUpdates: true,
  creditsExpiring: true,
  marketing: false,
};

export function defaultInstructorProfile(firstName: string, lastName: string, disciplines: string[] = []): InstructorProfileData {
  return {
    displayName: `${firstName} ${lastName}`.trim(),
    bio: '',
    disciplines,
    availableNow: false,
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
  register: (params: RegisterParams) => Promise<void>;
  updateProfile: (updates: UpdateProfileParams) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

type UserSeed = Omit<AuthUser, 'favoriteSports' | 'notificationPreferences' | 'paymentMethods'> & {
  favoriteSports?: string[];
  notificationPreferences?: NotificationPreferences;
  paymentMethods?: PaymentMethod[];
};

function createUser(partial: UserSeed): AuthUser {
  return {
    favoriteSports: partial.favoriteSports ?? [],
    notificationPreferences: partial.notificationPreferences ?? { ...DEFAULT_NOTIFICATIONS },
    paymentMethods: partial.paymentMethods ?? [],
    ...partial,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isLoading] = useState(false);

  const completeOnboarding = useCallback(() => {
    setHasSeenOnboarding(true);
  }, []);

  const login = useCallback(async (email: string, _password: string, role: UserRole = 'athlete') => {
    const base = {
      id: 'mock-user',
      email,
      role,
      firstName: 'Demo',
      lastName: 'User',
      favoriteSports: role === 'athlete' ? ['Yoga', 'Tennis'] : [],
    };

    if (role === 'instructor') {
      setUser(
        createUser({
          ...base,
          instructorProfile: {
            ...defaultInstructorProfile('Demo', 'User', ['Tennis', 'Padel']),
            bio: 'PTR certified tennis coach with 10+ years experience.',
            availableNow: true,
            hourlyRate: '50',
            verified: true,
          },
        }),
      );
      return;
    }

    if (role === 'institution') {
      setUser(
        createUser({
          ...base,
          institutionProfile: {
            ...defaultInstitutionProfile('FitHub Downtown'),
            description: 'Premium fitness studio in the city center.',
            address: '123 Main St',
            city: 'Buenos Aires',
            country: 'AR',
            verified: true,
          },
        }),
      );
      return;
    }

    setUser(createUser(base));
  }, []);

  const register = useCallback(async (params: RegisterParams) => {
    const base: UserSeed = {
      id: 'mock-user-new',
      email: params.email,
      role: params.role,
      firstName: params.firstName,
      lastName: params.lastName,
      avatarUri: params.avatarUri ?? null,
      favoriteSports: params.favoriteSports ?? [],
    };

    if (params.role === 'instructor') {
      setUser(
        createUser({
          ...base,
          instructorProfile: defaultInstructorProfile(
            params.firstName,
            params.lastName,
            params.disciplines ?? [],
          ),
        }),
      );
      return;
    }

    if (params.role === 'institution') {
      const gymName =
        params.institutionName?.trim() || `${params.firstName} ${params.lastName}`.trim();
      setUser(
        createUser({
          ...base,
          institutionProfile: defaultInstitutionProfile(gymName),
        }),
      );
      return;
    }

    setUser(createUser(base));
  }, []);

  const updateProfile = useCallback((updates: UpdateProfileParams) => {
    setUser((prev) => {
      if (!prev) return prev;
      return createUser({
        ...prev,
        ...updates,
        notificationPreferences: updates.notificationPreferences
          ? { ...prev.notificationPreferences, ...updates.notificationPreferences }
          : prev.notificationPreferences,
        paymentMethods: updates.paymentMethods ?? prev.paymentMethods,
        instructorProfile:
          updates.instructorProfile && prev.instructorProfile
            ? { ...prev.instructorProfile, ...updates.instructorProfile }
            : prev.instructorProfile,
        institutionProfile:
          updates.institutionProfile && prev.institutionProfile
            ? { ...prev.institutionProfile, ...updates.institutionProfile }
            : prev.institutionProfile,
      });
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      hasSeenOnboarding,
      isLoading,
      completeOnboarding,
      login,
      register,
      updateProfile,
      logout,
    }),
    [user, hasSeenOnboarding, isLoading, completeOnboarding, login, register, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { DEFAULT_NOTIFICATIONS };

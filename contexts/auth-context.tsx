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
}

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  bookingConfirmed: true,
  classReminders: true,
  paymentUpdates: true,
  creditsExpiring: true,
  marketing: false,
};

export type RegisterParams = {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatarUri?: string | null;
  favoriteSports?: string[];
};

export type UpdateProfileParams = Partial<
  Pick<AuthUser, 'firstName' | 'lastName' | 'email' | 'avatarUri' | 'favoriteSports'>
> & {
  notificationPreferences?: Partial<NotificationPreferences>;
  paymentMethods?: PaymentMethod[];
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

function createUser(partial: Omit<AuthUser, 'favoriteSports' | 'notificationPreferences' | 'paymentMethods'> & {
  favoriteSports?: string[];
  notificationPreferences?: NotificationPreferences;
  paymentMethods?: PaymentMethod[];
}): AuthUser {
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
    setUser(
      createUser({
        id: 'mock-user',
        email,
        role,
        firstName: 'Demo',
        lastName: 'User',
        favoriteSports: role === 'athlete' ? ['Yoga', 'Tennis'] : [],
      }),
    );
  }, []);

  const register = useCallback(async (params: RegisterParams) => {
    setUser(
      createUser({
        id: 'mock-user-new',
        email: params.email,
        role: params.role,
        firstName: params.firstName,
        lastName: params.lastName,
        avatarUri: params.avatarUri ?? null,
        favoriteSports: params.favoriteSports ?? [],
      }),
    );
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

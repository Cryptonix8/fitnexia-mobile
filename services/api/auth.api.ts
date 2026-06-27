import type {
  AuthUser,
  InstructorInvite,
  InstitutionProfileData,
  InstructorProfileData,
  NotificationPreferences,
  RegisterParams,
} from '@/types/auth-user';
import { DEFAULT_NOTIFICATIONS, defaultInstructorProfile, defaultInstitutionProfile } from '@/types/auth-user';
import type { Certification, Instructor, Institution, UserRole, WeeklySchedule } from '@/types/api';
import { defaultWeeklySchedule } from '@/utils/schedule';

import { apiRequest, clearTokens, getRefreshToken, setTokens } from './client';
import { isLocalMediaUri, uploadLocalImage } from './media.api';

type AuthResponse = {
  user: { id: string; email: string; role: UserRole };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

type MeResponse = {
  user: { id: string; email: string; role: UserRole };
  profile: Record<string, unknown> | null;
};

type NotificationPrefsResponse = NotificationPreferences;

function splitName(displayName: string): { firstName: string; lastName: string } {
  const parts = displayName.trim().split(/\s+/);
  if (parts.length <= 1) return { firstName: parts[0] ?? '', lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function mapInstructorProfile(profile: Instructor): InstructorProfileData {
  return {
    displayName: profile.displayName,
    bio: profile.bio ?? '',
    disciplines: profile.disciplines ?? [],
    certifications: (profile.certifications as Certification[]) ?? [],
    availableNow: profile.availableNow ?? false,
    weeklySchedule: ((profile as Instructor & { weeklySchedule?: WeeklySchedule }).weeklySchedule ??
      defaultWeeklySchedule()) as WeeklySchedule,
    hourlyRate: profile.hourlyRate ? String(profile.hourlyRate.amount / 100) : '',
    verified: profile.verified ?? false,
    verificationStatus: profile.verificationStatus ?? (profile.verified ? 'verified' : 'unverified'),
    plan: profile.plan ?? 'basic',
  };
}

function mapInstitutionProfile(
  profile: Institution,
  instructorIds: string[] = [],
  pendingInvites: InstructorInvite[] = [],
): InstitutionProfileData {
  const loc = profile.location;
  return {
    name: profile.name,
    description: profile.description ?? '',
    address: loc?.address ?? '',
    city: loc?.city ?? '',
    country: loc?.country ?? '',
    verified: profile.verified ?? false,
    verificationStatus: profile.verificationStatus ?? (profile.verified ? 'verified' : 'unverified'),
    gallery: profile.gallery ?? [],
    instructorIds,
    pendingInvites,
    plan: profile.plan ?? 'institutional',
    saasTier: profile.saasTier ?? 'basic',
    contactPhone: profile.contactPhone,
    contactEmail: profile.contactEmail,
    website: profile.website,
    openingHours: profile.openingHours ?? {},
  };
}

export async function mapMeToAuthUser(
  me: MeResponse,
  notificationPreferences: NotificationPreferences = DEFAULT_NOTIFICATIONS,
  extras?: { pendingInvites?: InstructorInvite[] },
): Promise<AuthUser> {
  const { user, profile } = me;

  if (user.role === 'athlete' && profile) {
    const p = profile as { firstName: string; lastName: string; photoUrl?: string; favoriteSports?: string[] };
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: p.firstName,
      lastName: p.lastName,
      avatarUri: p.photoUrl ?? null,
      favoriteSports: p.favoriteSports ?? [],
      notificationPreferences,
      paymentMethods: [],
    };
  }

  if (user.role === 'instructor' && profile) {
    const p = profile as Instructor;
    const { firstName, lastName } = splitName(p.displayName);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName,
      lastName,
      avatarUri: p.photoUrl ?? null,
      favoriteSports: [],
      notificationPreferences,
      paymentMethods: [],
      instructorId: p.id,
      instructorProfile: mapInstructorProfile(p),
    };
  }

  if (user.role === 'institution' && profile) {
    const p = profile as Institution;
    const instructorIds = (p.instructors ?? []).map((i) => i.id);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: p.name,
      lastName: '',
      avatarUri: p.logoUrl ?? null,
      favoriteSports: [],
      notificationPreferences,
      paymentMethods: [],
      institutionId: p.id,
      institutionProfile: mapInstitutionProfile(
        p,
        instructorIds,
        extras?.pendingInvites ?? [],
      ),
    };
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: '',
    lastName: '',
    favoriteSports: [],
    notificationPreferences,
    paymentMethods: [],
  };
}

async function fetchNotificationPrefs(): Promise<NotificationPreferences> {
  try {
    return await apiRequest<NotificationPrefsResponse>('/notifications/preferences');
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

async function fetchInstitutionExtras(userId: string, institutionId: string) {
  try {
    const invites = await apiRequest<{ data: InstructorInvite[] }>(
      '/institutions/me/instructors/invites',
    );
    return { pendingInvites: invites.data ?? [] };
  } catch {
    return { pendingInvites: [] as InstructorInvite[] };
  }
}

async function fetchCurrentUser(): Promise<AuthUser> {
  const me = await apiRequest<MeResponse>('/auth/me');
  const prefs = await fetchNotificationPrefs();
  let extras: { pendingInvites?: InstructorInvite[] } | undefined;

  if (me.user.role === 'institution' && me.profile) {
    extras = await fetchInstitutionExtras(me.user.id, (me.profile as Institution).id);
  }

  return mapMeToAuthUser(me, prefs, extras);
}

function fallbackAuthUser(response: AuthResponse, params?: RegisterParams): AuthUser {
  const base: AuthUser = {
    id: response.user.id,
    email: response.user.email,
    role: response.user.role,
    firstName: params?.firstName ?? '',
    lastName: params?.lastName ?? '',
    avatarUri: null,
    favoriteSports: params?.favoriteSports ?? [],
    notificationPreferences: DEFAULT_NOTIFICATIONS,
    paymentMethods: [],
  };

  if (response.user.role === 'instructor') {
    return {
      ...base,
      instructorProfile: defaultInstructorProfile(
        params?.firstName ?? '',
        params?.lastName ?? '',
        params?.disciplines,
      ),
    };
  }

  if (response.user.role === 'institution') {
    return {
      ...base,
      firstName: params?.institutionName ?? params?.firstName ?? '',
      institutionProfile: defaultInstitutionProfile(params?.institutionName ?? ''),
    };
  }

  return base;
}

export async function loadCurrentUser(): Promise<AuthUser | null> {
  try {
    return await fetchCurrentUser();
  } catch {
    await clearTokens();
    return null;
  }
}

async function persistAuthResponse(
  response: AuthResponse,
  registerParams?: RegisterParams,
): Promise<AuthUser> {
  await setTokens(response.accessToken, response.refreshToken);
  try {
    return await fetchCurrentUser();
  } catch {
    return fallbackAuthUser(response, registerParams);
  }
}

export async function loginApi(email: string, password: string): Promise<AuthUser> {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  });
  return persistAuthResponse(response);
}

export async function registerApi(params: RegisterParams): Promise<AuthUser> {
  const localAvatar =
    params.avatarUri && isLocalMediaUri(params.avatarUri) ? params.avatarUri : null;
  const remotePhotoUrl =
    params.avatarUri && !isLocalMediaUri(params.avatarUri) ? params.avatarUri : undefined;

  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    auth: false,
    body: {
      email: params.email,
      password: params.password,
      role: params.role,
      firstName: params.firstName,
      lastName: params.lastName,
      acceptTerms: true,
      photoUrl: remotePhotoUrl,
      favoriteSports: params.favoriteSports,
      disciplines: params.disciplines,
      institutionName: params.institutionName,
    },
  });

  let user = await persistAuthResponse(response, params);

  if (localAvatar) {
    try {
      const photoUrl = await uploadLocalImage(localAvatar);
      if (user.role === 'athlete') {
        await updateAthleteProfileApi({ photoUrl });
      } else if (user.role === 'instructor') {
        await updateInstructorProfileApi({ photoUrl });
      } else if (user.role === 'institution') {
        await updateInstitutionProfileApi({ logoUrl: photoUrl });
      }
      user = await fetchCurrentUser();
    } catch {
      // Registration succeeded; avatar upload can be retried from profile edit.
    }
  }

  return user;
}

export type GoogleSignInParams = {
  idToken: string;
  role?: UserRole;
  institutionName?: string;
};

export async function googleSignInApi(params: GoogleSignInParams): Promise<AuthUser> {
  const response = await apiRequest<AuthResponse>('/auth/oauth/google', {
    method: 'POST',
    auth: false,
    body: {
      idToken: params.idToken,
      role: params.role,
      institutionName: params.institutionName,
    },
  });
  return persistAuthResponse(response);
}

export async function logoutApi(): Promise<void> {
  const refreshToken = await getRefreshToken();
  try {
    if (refreshToken) {
      await apiRequest('/auth/logout', { method: 'POST', body: { refreshToken } });
    }
  } finally {
    await clearTokens();
  }
}

export async function forgotPasswordApi(email: string): Promise<void> {
  await apiRequest('/auth/forgot-password', {
    method: 'POST',
    auth: false,
    body: { email },
  });
}

export async function resetPasswordApi(token: string, password: string): Promise<void> {
  await apiRequest('/auth/reset-password', {
    method: 'POST',
    auth: false,
    body: { token, password },
  });
}

export async function updateUserAccountApi(body: { email: string }) {
  return apiRequest<{ id: string; email: string; role: UserRole }>('/users/me', {
    method: 'PATCH',
    body,
  });
}

export async function updateAthleteProfileApi(body: Record<string, unknown>) {
  return apiRequest('/users/me/profile', { method: 'PATCH', body });
}

export async function updateInstructorProfileApi(body: Record<string, unknown>) {
  return apiRequest('/instructors/me', { method: 'PATCH', body });
}

export async function updateInstitutionProfileApi(body: Record<string, unknown>) {
  return apiRequest('/institutions/me', { method: 'PATCH', body });
}

export async function updateNotificationPrefsApi(prefs: Partial<NotificationPreferences>) {
  return apiRequest('/notifications/preferences', { method: 'PATCH', body: prefs });
}

export async function setAvailableNowApi(availableNow: boolean) {
  return apiRequest('/instructors/me/availability-now', {
    method: 'PATCH',
    body: { availableNow },
  });
}

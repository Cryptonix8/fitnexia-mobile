import type { Certification, InstructorPlan, UserRole, WeeklySchedule } from '@/types/api';
import { defaultWeeklySchedule } from '@/utils/schedule';

export interface NotificationPreferences {
  bookingConfirmed: boolean;
  classReminders: boolean;
  paymentUpdates: boolean;
  creditsExpiring: boolean;
  reviewInvites: boolean;
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
  plan: InstructorPlan;
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
  plan: InstructorPlan;
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

export const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  bookingConfirmed: true,
  classReminders: true,
  paymentUpdates: true,
  creditsExpiring: true,
  reviewInvites: true,
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
    plan: 'basic',
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
    plan: 'institutional',
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

/**
 * Shared API types for Fitnexia clients (mobile, web).
 * Keep in sync with fitnexia-backend/docs/openapi.yaml and fitnexia-backend/docs/API.md
 */

export type UserRole = 'athlete' | 'instructor' | 'institution' | 'admin';

export type ClassFormat = 'individual' | 'group';

export type Modality = 'in_person' | 'online';

export type ClassLevel = 'beginner' | 'intermediate' | 'advanced';

export type InstructorGender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'refunded'
  | 'completed'
  | 'no_show';

export type PaymentModel = 'per_class' | 'monthly_unlimited' | 'per_period';
export type PassPeriodType = 'week' | 'month' | 'quarter';

export type InstructorPlan = 'basic' | 'pro' | 'institutional';

export type GymSaasTier = 'basic' | 'professional' | 'premium' | 'enterprise';

export type ProfileVerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type OpeningHoursDay = { open?: string; close?: string; closed?: boolean };

export type OpeningHours = Partial<
  Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', OpeningHoursDay>
>;

export type ClientPlatform = 'web' | 'ios' | 'android';

export interface Money {
  /** Amount in minor units (cents) */
  amount: number;
  currency: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AthleteProfile {
  firstName: string;
  lastName: string;
  photoUrl?: string;
  favoriteSports: string[];
  locale?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: number;
}

export interface Instructor {
  id: string;
  userId: string;
  displayName: string;
  photoUrl?: string;
  bio?: string;
  disciplines: string[];
  certifications?: Certification[];
  hourlyRate?: Money;
  verified: boolean;
  verificationStatus?: ProfileVerificationStatus;
  availableNow: boolean;
  averageRating: number;
  reviewCount: number;
  plan?: InstructorPlan;
  gender?: InstructorGender;
}

export interface InstitutionLocation {
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface Institution {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  location?: InstitutionLocation;
  gallery?: string[];
  verified: boolean;
  verificationStatus?: ProfileVerificationStatus;
  plan?: InstructorPlan;
  saasTier?: GymSaasTier;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  openingHours?: OpeningHours;
  instructors?: Pick<Instructor, 'id' | 'displayName'>[];
}

export interface GymSubscription {
  tier: GymSaasTier;
  tierName: string;
  monthlyFeeCents: number;
  memberCount: number;
  memberLimit: number | null;
  membersRemaining: number | null;
  atLimit: boolean;
  billingStatus: string;
  entitlements: Record<string, boolean>;
}

export interface GymTierConfig {
  id: GymSaasTier;
  name: string;
  monthlyFeeCents: number;
  memberLimit: number | null;
  entitlements: Record<string, boolean>;
}

export interface JobPosting {
  id: string;
  institutionId: string;
  institutionName?: string;
  institutionLogoUrl?: string;
  title: string;
  roleType: string;
  description: string;
  disciplines: string[];
  status: 'draft' | 'open' | 'closed';
  expiresAt?: string;
  applicationCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  instructorId: string;
  instructorName?: string;
  instructorPhotoUrl?: string;
  message: string;
  status: string;
  createdAt: string;
  jobTitle?: string;
  jobStatus?: string;
  institutionName?: string;
}

export interface ClassRecurrence {
  enabled: boolean;
  frequency: 'weekly';
  weekdays: number[];
  seriesId?: string;
}

/** 0 = Sunday … 6 = Saturday */
export interface WeeklyDaySchedule {
  weekday: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export type WeeklySchedule = WeeklyDaySchedule[];

export interface ClassListItem {
  id: string;
  title: string;
  discipline: string;
  modality: Modality;
  startAt: string;
  durationMinutes: number;
  price: Money;
  capacity?: number;
  spotsLeft?: number;
  instructor: Pick<Instructor, 'id' | 'displayName' | 'photoUrl' | 'verified' | 'gender'>;
  institution?: Pick<Institution, 'id' | 'name' | 'logoUrl' | 'verified'> | null;
  location?: { lat: number; lng: number; label: string };
  averageRating?: number;
  reviewCount?: number;
  classFormat?: ClassFormat;
  level?: ClassLevel;
  language?: string;
  seriesId?: string;
  isSeriesException?: boolean;
  recurrence?: ClassRecurrence;
}

export interface Class extends ClassListItem {
  description?: string;
  level?: ClassLevel;
  language?: string;
  cancellationPolicyHours?: number;
  recurrence?: ClassRecurrence;
}

export interface CreateBookingRequest {
  classId: string;
  paymentModel: PaymentModel;
  periodType?: PassPeriodType;
  useCredits?: boolean;
  promoCode?: string | null;
}

export interface AthletePass {
  id: string;
  paymentModel: PaymentModel;
  periodType?: PassPeriodType;
  status: 'pending_payment' | 'active' | 'expired' | 'cancelled';
  price: Money;
  classCreditsTotal: number | null;
  classCreditsUsed: number;
  classCreditsRemaining: number | null;
  startsAt?: string;
  expiresAt?: string;
  checkoutUrl?: string;
  createdAt: string;
}

export interface PassProducts {
  monthly_unlimited: {
    id: string;
    paymentModel: 'monthly_unlimited';
    name: string;
    priceCents: number;
    periodDays: number;
    unlimited: boolean;
    currency: string;
    price: Money;
  };
  per_period: Record<
    PassPeriodType,
    {
      periodType: PassPeriodType;
      name: string;
      priceCents: number;
      periodDays: number;
      classCredits: number;
      currency: string;
      price: Money;
    }
  >;
}

export interface Booking {
  id: string;
  status: BookingStatus;
  classId: string;
  userId: string;
  price: Money;
  createdAt: string;
  alreadyReviewed?: boolean;
  checkoutUrl?: string;
  paymentId?: string;
  /** Present on /bookings/me and /bookings/:id — includes past classes no longer in search */
  class?: ClassListItem;
}

export interface CreateBookingResponse {
  booking: Booking;
  payment?: {
    provider: 'mercado_pago';
    preferenceId: string;
    checkoutUrl: string;
    paymentId?: string;
    passId?: string;
    paymentModel?: PaymentModel;
    periodType?: PassPeriodType;
  };
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  authorName: string;
  response?: string | null;
  createdAt: string;
}

/** Verified review from a gym that employs the instructor */
export interface StaffReview {
  id: string;
  instructorId: string;
  institutionId: string;
  institutionName: string;
  rating: number;
  comment?: string;
  createdAt: string;
  verified: true;
}

export interface CreditBalance {
  balance: number;
  creditsUntilReward: number;
  expiresAt: string;
  lastBookingAt: string;
  freeClassEligible: boolean;
  maxFreeClassValue: Money;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  data?: {
    tab?: string;
    screen?: string;
    classId?: string;
    bookingId?: string;
  };
}

export interface HomeFeed {
  recommended: ClassListItem[];
  nearby: ClassListItem[];
  popular: ClassListItem[];
}

export type MembershipBillingFrequency = 'monthly' | 'quarterly' | 'annual';
export type MembershipPlanType = 'individual' | 'family';
export type ClubMemberFeeStatus = 'up_to_date' | 'pending' | 'overdue' | 'inactive';
export type ClubMemberStatus =
  | 'invited'
  | 'pending_authorization'
  | 'active'
  | 'pending_payment'
  | 'overdue'
  | 'inactive';

export interface MembershipPlan {
  id: string;
  institutionId: string;
  name: string;
  description: string;
  price: Money;
  priceCents: number;
  priceCurrency: string;
  billingFrequency: MembershipBillingFrequency;
  planType: MembershipPlanType;
  maxMembers?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClubMember {
  id: string;
  institutionId: string;
  userId?: string;
  planId: string;
  status: ClubMemberStatus;
  feeStatus: ClubMemberFeeStatus;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  joinedAt?: string;
  leftAt?: string;
  planName?: string;
  institutionName?: string;
  nextBillingAt?: string;
  subscriptionStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipInvite {
  id: string;
  institutionId: string;
  planId: string;
  code: string;
  email?: string;
  invitedName?: string;
  invitedPhone?: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expiresAt?: string;
  bulkBatchId?: string;
  planName?: string;
  institutionName?: string;
  joinUrl?: string;
  createdAt: string;
}

export interface MembershipInvitePreview {
  code: string;
  institutionName: string;
  institutionLogo?: string;
  plan: Pick<MembershipPlan, 'id' | 'name' | 'description' | 'price' | 'billingFrequency' | 'planType'>;
  invitedName?: string;
  email?: string;
  expiresAt?: string;
}

export interface MembershipPayment {
  id: string;
  subscriptionId: string;
  clubMemberId: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  amount: Money;
  periodStart?: string;
  periodEnd?: string;
  isManual: boolean;
  checkoutUrl?: string;
  createdAt: string;
}

export interface MembershipStatement {
  member: ClubMember;
  plan: { name: string; price: Money; billingFrequency: MembershipBillingFrequency };
  nextDueDate?: string;
  amountDue: Money | null;
  graceDays: number;
  payments: MembershipPayment[];
}

export interface MembersSummary {
  upToDate: number;
  pending: number;
  overdue: number;
  total: number;
}

export interface MembershipSettings {
  graceDays: number;
  dueReminderDays: number;
}

/** Default API base — override per environment */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://api.staging.fitnexia.com/v1';

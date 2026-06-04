/**
 * User-facing copy — single source of truth for product labels.
 * Change a value here instead of hunting strings across screens.
 */
import type { Modality } from '@/types/api';

export const BADGE_LABELS = {
  verified: 'Verified',
  availableNow: 'Available now',
  full: 'Full',
} as const;

export const CLASS_CARD_LABELS = {
  spotsLeft: (count: number) => `${count} spots left`,
} as const;

export const MODALITY_LABELS = {
  online: 'Online',
  inPerson: 'In person',
} as const;

export function modalityBadgeLabel(modality: Modality): string {
  return modality === 'online' ? MODALITY_LABELS.online : MODALITY_LABELS.inPerson;
}

export function modalityLocationLabel(modality: Modality, locationLabel?: string): string {
  if (modality === 'online') return MODALITY_LABELS.online;
  return locationLabel ?? MODALITY_LABELS.inPerson;
}

export const TAB_LABELS = {
  athlete: {
    home: 'Home',
    search: 'Search',
    bookings: 'Bookings',
    profile: 'Profile',
  },
  instructor: {
    dashboard: 'Dashboard',
    classes: 'Classes',
    calendar: 'Calendar',
    earnings: 'Earnings',
    profile: 'Profile',
  },
  gym: {
    dashboard: 'Dashboard',
    staff: 'Staff',
    classes: 'Classes',
    metrics: 'Metrics',
    profile: 'Gym',
  },
} as const;

export const PROFILE_MENU_LABELS = {
  favoriteSports: 'Favorite sports',
  notifications: 'Notifications',
  paymentMethods: 'Payment methods',
  payoutAccount: 'Payout account',
  planCommission: 'Plan & commission',
  helpSupport: 'Help & support',
  location: 'Location',
  disciplines: 'Disciplines',
  certifications: 'Certifications',
  scheduleAvailability: 'Schedule & availability',
  photoGallery: 'Photo gallery',
  instructors: 'Instructors',
} as const;

export const SCREEN_TITLES = {
  profile: 'Profile',
  gymProfile: 'Gym profile',
  editProfile: 'Edit profile',
  notifications: 'Notifications',
  favoriteSports: 'Favorite sports',
  paymentMethods: 'Payment methods',
  payoutAccount: 'Payout account',
  helpSupport: 'Help & support',
  planCommission: 'Plan & commission',
  inviteInstructor: 'Invite instructor',
  class: 'Class',
  classDetails: 'Class details',
  classNotFound: 'Class not found',
} as const;

export const BUTTON_LABELS = {
  signOut: 'Sign out',
  save: 'Save',
  saveChanges: 'Save changes',
  edit: 'Edit',
  continue: 'Continue',
  createAccount: 'Create account',
  signIn: 'Sign in',
  bookNow: 'Book now',
  joinWaitlist: 'Join waiting list',
  joinWaitlistShort: 'Join waitlist',
  classFull: 'Class full',
  viewProfile: 'Profile',
  confirmBooking: 'Confirm booking',
  payAndConfirm: 'Pay & confirm',
} as const;

export const CLASS_DETAIL_LABELS = {
  when: 'When',
  duration: 'Duration',
  where: 'Where',
  price: 'Price',
  spots: 'Spots',
  about: 'About',
  locationTbd: 'TBD',
  full: 'Full',
  fullWaitlist: 'Full — waitlist available',
  liveStream: 'Live stream on Fitnexia',
  onlineSessionLink: 'Online session (link shared after booking)',
} as const;

export function classSpotsLabel(
  spotsLeft: number,
  capacity: number,
  options?: { waitlistEnabled?: boolean },
): string {
  if (spotsLeft === 0) {
    return options?.waitlistEnabled
      ? CLASS_DETAIL_LABELS.fullWaitlist
      : CLASS_DETAIL_LABELS.full;
  }
  return `${spotsLeft} of ${capacity} left`;
}

export const AUTH_LABELS = {
  welcomeBack: 'Welcome back',
  signInSubtitle: 'Sign in to continue',
  chooseProfile: 'Choose your profile',
  createAccount: 'Create account',
  howWillYouUse: 'How will you use Fitnexia?',
  completeProfile: 'Complete your basic profile',
  gymSchoolName: 'Gym / school name',
  gymSchoolPlaceholder: 'Your facility name',
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email',
  password: 'Password',
  logoPhoto: 'Logo / photo',
  profilePhoto: 'Profile photo',
} as const;

export const ALERT_LABELS = {
  signOutTitle: 'Sign out',
  signOutMessage: 'Are you sure?',
  cancel: 'Cancel',
  missingInfoTitle: 'Missing info',
  fillAllFields: 'Please fill in all fields.',
  gymNameRequired: 'Gym / school name is required.',
  savedTitle: 'Saved',
} as const;

export const ROLE_DESCRIPTIONS = {
  athlete: 'Find and book classes near you',
  instructor: 'Teach and manage your schedule',
  institution: 'Manage instructors and group classes',
  admin: '',
} as const;

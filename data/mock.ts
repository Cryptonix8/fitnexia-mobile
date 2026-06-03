import type {
  Booking,
  ClassListItem,
  CreditBalance,
  Instructor,
  Institution,
} from '@/types/api';

export const MOCK_INSTRUCTORS: Instructor[] = [
  {
    id: 'inst-1',
    userId: 'u-1',
    displayName: 'Carlos Ruiz',
    bio: 'PTR certified tennis coach with 10+ years experience.',
    disciplines: ['Tennis', 'Padel'],
    verified: true,
    availableNow: true,
    averageRating: 4.9,
    reviewCount: 124,
    plan: 'pro',
    hourlyRate: { amount: 5000, currency: 'USD' },
    certifications: [
      { name: 'PTR Certified', issuer: 'PTR', year: 2018 },
      { name: 'Sports Psychology', issuer: 'ITF', year: 2020 },
    ],
  },
  {
    id: 'inst-2',
    userId: 'u-2',
    displayName: 'Mia Chen',
    bio: 'Yoga & mindfulness instructor. RYT-500.',
    disciplines: ['Yoga', 'Pilates'],
    verified: true,
    availableNow: false,
    averageRating: 4.8,
    reviewCount: 89,
    plan: 'basic',
    hourlyRate: { amount: 3500, currency: 'USD' },
    certifications: [{ name: 'RYT-500', issuer: 'Yoga Alliance', year: 2019 }],
  },
  {
    id: 'inst-3',
    userId: 'u-3',
    displayName: 'James Okonkwo',
    bio: 'HIIT & strength specialist.',
    disciplines: ['HIIT', 'CrossFit'],
    verified: false,
    availableNow: false,
    averageRating: 4.6,
    reviewCount: 42,
    plan: 'basic',
  },
];

export const MOCK_INSTITUTIONS: Institution[] = [
  {
    id: 'gym-1',
    name: 'FitHub Downtown',
    description: 'Premium fitness studio in the city center.',
    verified: true,
    plan: 'institutional',
    location: {
      address: '123 Main St',
      city: 'Buenos Aires',
      country: 'AR',
      lat: -34.6037,
      lng: -58.3816,
    },
    instructors: [
      { id: 'inst-1', displayName: 'Carlos Ruiz' },
      { id: 'inst-2', displayName: 'Mia Chen' },
      { id: 'inst-3', displayName: 'James Okonkwo' },
    ],
  },
];

export const MOCK_CLASSES: ClassListItem[] = [
  {
    id: 'class-1',
    title: 'Morning Flow Yoga',
    discipline: 'Yoga',
    modality: 'in_person',
    startAt: '2026-06-10T08:00:00Z',
    durationMinutes: 60,
    price: { amount: 2500, currency: 'USD' },
    capacity: 12,
    spotsLeft: 4,
    instructor: {
      id: 'inst-2',
      displayName: 'Mia Chen',
    },
    location: { lat: -34.6, lng: -58.38, label: 'FitHub Studio A' },
    averageRating: 4.8,
  },
  {
    id: 'class-2',
    title: 'Tennis Fundamentals',
    discipline: 'Tennis',
    modality: 'in_person',
    startAt: '2026-06-11T10:00:00Z',
    durationMinutes: 90,
    price: { amount: 4500, currency: 'USD' },
    capacity: 4,
    spotsLeft: 1,
    instructor: {
      id: 'inst-1',
      displayName: 'Carlos Ruiz',
    },
    location: { lat: -34.61, lng: -58.39, label: 'Central Courts' },
    averageRating: 4.9,
  },
  {
    id: 'class-3',
    title: 'HIIT Burn (Online)',
    discipline: 'HIIT',
    modality: 'online',
    startAt: '2026-06-12T18:00:00Z',
    durationMinutes: 45,
    price: { amount: 1500, currency: 'USD' },
    capacity: 30,
    spotsLeft: 12,
    instructor: {
      id: 'inst-3',
      displayName: 'James Okonkwo',
    },
    averageRating: 4.6,
  },
  {
    id: 'class-4',
    title: 'Group CrossFit',
    discipline: 'CrossFit',
    modality: 'in_person',
    startAt: '2026-06-13T07:00:00Z',
    durationMinutes: 55,
    price: { amount: 2000, currency: 'USD' },
    capacity: 20,
    spotsLeft: 0,
    instructor: {
      id: 'inst-3',
      displayName: 'James Okonkwo',
    },
    institution: { id: 'gym-1', name: 'FitHub Downtown' },
    location: { lat: -34.6037, lng: -58.3816, label: 'FitHub Downtown' },
    averageRating: 4.7,
  },
  {
    id: 'class-5',
    title: 'Evening Pilates',
    discipline: 'Pilates',
    modality: 'in_person',
    startAt: '2026-06-14T19:00:00Z',
    durationMinutes: 50,
    price: { amount: 2800, currency: 'USD' },
    capacity: 10,
    spotsLeft: 6,
    instructor: {
      id: 'inst-2',
      displayName: 'Mia Chen',
    },
    location: { lat: -34.59, lng: -58.37, label: 'Wellness Loft' },
    averageRating: 4.8,
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'book-1',
    status: 'confirmed',
    classId: 'class-1',
    userId: 'me',
    price: { amount: 2500, currency: 'USD' },
    createdAt: '2026-05-28T10:00:00Z',
  },
  {
    id: 'book-2',
    status: 'completed',
    classId: 'class-2',
    userId: 'me',
    price: { amount: 4500, currency: 'USD' },
    createdAt: '2026-05-01T10:00:00Z',
  },
];

export const MOCK_CREDITS: CreditBalance = {
  balance: 7,
  creditsUntilReward: 3,
  expiresAt: '2027-06-01T00:00:00Z',
  lastBookingAt: '2026-05-28T10:00:00Z',
  freeClassEligible: false,
  maxFreeClassValue: { amount: 3000, currency: 'USD' },
};

export type GymDayMetric = {
  label: string;
  bookings: number;
  revenueCents: number;
  attendancePct: number;
};

export type GymWeeklyMetrics = {
  bookings: number;
  revenueCents: number;
  attendanceRate: number;
  bookingsChangePct: number;
  revenueChangePct: number;
  attendanceChangePct: number;
  daily: GymDayMetric[];
};

export const MOCK_GYM_WEEKLY_METRICS: GymWeeklyMetrics = {
  bookings: 47,
  revenueCents: 284000,
  attendanceRate: 0.82,
  bookingsChangePct: 0.12,
  revenueChangePct: 0.08,
  attendanceChangePct: 0.05,
  daily: [
    { label: 'Mon', bookings: 6, revenueCents: 36000, attendancePct: 0.65 },
    { label: 'Tue', bookings: 8, revenueCents: 48000, attendancePct: 0.82 },
    { label: 'Wed', bookings: 5, revenueCents: 30000, attendancePct: 0.45 },
    { label: 'Thu', bookings: 9, revenueCents: 54000, attendancePct: 0.9 },
    { label: 'Fri', bookings: 8, revenueCents: 48000, attendancePct: 0.78 },
    { label: 'Sat', bookings: 7, revenueCents: 42000, attendancePct: 0.95 },
    { label: 'Sun', bookings: 4, revenueCents: 26000, attendancePct: 0.55 },
  ],
};

export function formatMoney(m: { amount: number; currency: string }): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: m.currency,
  }).format(m.amount / 100);
}

export function formatClassDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getClassById(id: string): ClassListItem | undefined {
  return MOCK_CLASSES.find((c) => c.id === id);
}

export function getInstructorById(id: string): Instructor | undefined {
  return MOCK_INSTRUCTORS.find((i) => i.id === id);
}

export function getInstitutionById(id: string): Institution | undefined {
  return MOCK_INSTITUTIONS.find((g) => g.id === id);
}

export function updateMockInstitution(id: string, patch: Partial<Institution>): void {
  const index = MOCK_INSTITUTIONS.findIndex((g) => g.id === id);
  if (index >= 0) {
    MOCK_INSTITUTIONS[index] = { ...MOCK_INSTITUTIONS[index], ...patch };
  }
}

export function updateMockInstructor(id: string, patch: Partial<Instructor>): void {
  const index = MOCK_INSTRUCTORS.findIndex((i) => i.id === id);
  if (index >= 0) {
    MOCK_INSTRUCTORS[index] = { ...MOCK_INSTRUCTORS[index], ...patch };
  }
}

export function getBookingById(id: string): Booking | undefined {
  return MOCK_BOOKINGS.find((b) => b.id === id);
}

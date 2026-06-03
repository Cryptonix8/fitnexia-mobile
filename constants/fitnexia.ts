/** Fitnexia brand & layout tokens */
export const FitnexiaColors = {
  primary: '#0D9488',
  primaryDark: '#0F766E',
  primaryLight: '#CCFBF1',
  accent: '#F97316',
  success: '#22C55E',
  warning: '#EAB308',
  error: '#EF4444',
  white: '#FFFFFF',
  black: '#0F172A',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray700: '#334155',
  gray900: '#0F172A',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const DISCIPLINES = [
  'Yoga',
  'CrossFit',
  'Tennis',
  'Swimming',
  'HIIT',
  'Pilates',
  'Boxing',
  'Running',
] as const;

export const ROLE_LABELS = {
  athlete: 'Athlete',
  instructor: 'Instructor',
  institution: 'Gym / School',
} as const;

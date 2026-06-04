/** UI copy (labels, buttons, screen titles): see `constants/labels.ts`. */

/** Semantic theme tokens for light & dark mode */
export type AppThemeColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryMuted: string;
  primaryText: string;
  accent: string;
  success: string;
  successMuted: string;
  warning: string;
  warningMuted: string;
  error: string;
  tabBar: string;
  tabBarBorder: string;
  input: string;
  shadow: string;
  onPrimary: string;
};

export const LightThemeColors: AppThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  border: '#E2E8F0',
  primary: '#0D9488',
  primaryMuted: '#CCFBF1',
  primaryText: '#0F766E',
  accent: '#F97316',
  success: '#22C55E',
  successMuted: '#DCFCE7',
  warning: '#EAB308',
  warningMuted: '#FEF9C3',
  error: '#EF4444',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  input: '#FFFFFF',
  shadow: '#000000',
  onPrimary: '#FFFFFF',
};

export const DarkThemeColors: AppThemeColors = {
  background: '#0B1120',
  surface: '#1E293B',
  surfaceMuted: '#334155',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#334155',
  primary: '#2DD4BF',
  primaryMuted: '#134E4A',
  primaryText: '#5EEAD4',
  accent: '#FB923C',
  success: '#4ADE80',
  successMuted: '#14532D',
  warning: '#FACC15',
  warningMuted: '#713F12',
  error: '#F87171',
  tabBar: '#1E293B',
  tabBarBorder: '#334155',
  input: '#334155',
  shadow: '#000000',
  onPrimary: '#FFFFFF',
};

/** @deprecated Use useAppTheme() instead */
export const FitnexiaColors = {
  primary: LightThemeColors.primary,
  primaryDark: '#0F766E',
  primaryLight: LightThemeColors.primaryMuted,
  accent: LightThemeColors.accent,
  success: LightThemeColors.success,
  warning: LightThemeColors.warning,
  error: LightThemeColors.error,
  white: '#FFFFFF',
  black: '#0F172A',
  gray50: LightThemeColors.background,
  gray100: LightThemeColors.surfaceMuted,
  gray200: LightThemeColors.border,
  gray400: '#94A3B8',
  gray500: LightThemeColors.textMuted,
  gray700: LightThemeColors.textSecondary,
  gray900: LightThemeColors.text,
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

export const MOCK_LOCATION_AREAS = [
  'Downtown',
  'FitHub',
  'Wellness Loft',
  'Central Courts',
  'Online',
] as const;

export const PRICE_RANGES = [
  { id: 'any', label: 'Any price', min: 0, max: Infinity },
  { id: 'budget', label: 'Under $20', min: 0, max: 2000 },
  { id: 'mid', label: '$20 – $35', min: 2000, max: 3500 },
  { id: 'premium', label: '$35+', min: 3500, max: Infinity },
] as const;

export type ScheduleFilter =
  | 'any'
  | 'week'
  | 'month'
  | 'morning'
  | 'afternoon'
  | 'evening';

export const SCHEDULE_FILTERS: { id: ScheduleFilter; label: string }[] = [
  { id: 'any', label: 'Any time' },
  { id: 'week', label: 'Next 7 days' },
  { id: 'month', label: 'Next 30 days' },
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
];

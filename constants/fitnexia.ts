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
  primary: '#2B59C3',
  primaryMuted: '#E0E9F7',
  primaryText: '#1E4294',
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
  primary: '#5B8DEF',
  primaryMuted: '#1A2744',
  primaryText: '#AECBFA',
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
  primaryDark: '#1E4294',
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
  'Musculación',
  'Entrenamiento Funcional',
  'Entrenamiento Personalizado',
  'Entrenamiento para adultos mayores',
  'Entrenamiento para embarazadas',
  'Zumba/Ritmos',
  'Indoor Cycling',
  'Pilates Mat/Reformer',
  'Tenis',
  'Pádel',
  'Hidrogimnasia',
  'Natación',
  'Fútbol',
  'Basquetbol',
  'Voleibol',
  'Hockey',
  'Yoga',
  'Crossfit',
  'Otros',
] as const;

export const ROLE_LABELS = {
  athlete: 'Atleta',
  instructor: 'Instructor',
  institution: 'Gimnasio / Escuela',
} as const;

export const MOCK_LOCATION_AREAS = [
  'Centro',
  'FitHub',
  'Wellness Loft',
  'Central Courts',
  'En línea',
] as const;

/** Price filter thresholds in minor units (centésimos de peso). */
const UYU_800 = 80_000;
const UYU_1500 = 150_000;

export const PRICE_RANGES = [
  { id: 'any', label: 'Cualquier precio', min: 0, max: Infinity },
  { id: 'budget', label: 'Menos de 800 UYU', min: 0, max: UYU_800 - 1 },
  { id: 'mid', label: 'Entre 800 y 1500 UYU', min: UYU_800, max: UYU_1500 },
  { id: 'premium', label: 'Más de 1500 UYU', min: UYU_1500 + 1, max: Infinity },
] as const;

export type ScheduleFilter =
  | 'any'
  | 'week'
  | 'month'
  | 'morning'
  | 'afternoon'
  | 'evening';

export const SCHEDULE_FILTERS: { id: ScheduleFilter; label: string }[] = [
  { id: 'any', label: 'Cualquier horario' },
  { id: 'week', label: 'Próximos 7 días' },
  { id: 'month', label: 'Próximos 30 días' },
  { id: 'morning', label: 'Mañana' },
  { id: 'afternoon', label: 'Tarde' },
  { id: 'evening', label: 'Noche' },
];

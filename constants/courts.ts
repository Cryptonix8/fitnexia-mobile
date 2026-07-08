import type { CourtSportType } from '@/services/api/courts.api';
import type { OpeningHours } from '@/types/api';

export const COURT_SPORT_OPTIONS: { value: CourtSportType; label: string }[] = [
  { value: 'football_5', label: 'Fútbol 5' },
  { value: 'football_7', label: 'Fútbol 7' },
  { value: 'football_11', label: 'Fútbol 11' },
  { value: 'padel', label: 'Pádel' },
  { value: 'tennis', label: 'Tenis' },
  { value: 'rugby', label: 'Rugby' },
  { value: 'other', label: 'Otro' },
];

export const COURT_SURFACE_OPTIONS = [
  { value: 'synthetic', label: 'Sintética' },
  { value: 'grass', label: 'Césped natural' },
  { value: 'clay', label: 'Polvo de ladrillo' },
  { value: 'hard', label: 'Cemento / dura' },
  { value: 'other', label: 'Otra' },
] as const;

export const COURT_LOCATION_OPTIONS = [
  { value: 'outdoor', label: 'Exterior' },
  { value: 'indoor', label: 'Interior' },
] as const;

export const COURT_SLOT_DURATION_OPTIONS = [
  { value: '30', label: '30 min' },
  { value: '60', label: '60 min' },
  { value: '90', label: '90 min' },
  { value: '120', label: '120 min' },
] as const;

export const COURT_WEEKDAY_OPTIONS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
] as const;

export const COURT_RESERVATION_STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pago pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  refunded: 'Reembolsada',
  completed: 'Completada',
  no_show: 'No asistió',
};

export function courtSportLabel(value?: string) {
  return COURT_SPORT_OPTIONS.find((o) => o.value === value)?.label ?? value ?? '';
}

export function courtSurfaceLabel(value?: string) {
  return COURT_SURFACE_OPTIONS.find((o) => o.value === value)?.label ?? value ?? '';
}

export function defaultCourtOperatingHours(): OpeningHours {
  const day = { open: '08:00', close: '22:00' };
  return {
    mon: { ...day },
    tue: { ...day },
    wed: { ...day },
    thu: { ...day },
    fri: { ...day },
    sat: { ...day },
    sun: { ...day },
  };
}

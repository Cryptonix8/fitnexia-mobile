import type { OpeningHours } from '@/types/api';

export const OPENING_HOUR_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type OpeningHourKey = (typeof OPENING_HOUR_KEYS)[number];

export const OPENING_HOUR_LABELS: Record<OpeningHourKey, string> = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
};

export function formatOperatingHoursSummary(hours: OpeningHours): string {
  const enabled = OPENING_HOUR_KEYS.filter((key) => !hours[key]?.closed);
  if (!enabled.length) return 'Sin horarios';
  const first = hours[enabled[0]];
  const same = enabled.every(
    (key) =>
      hours[key]?.open === first?.open &&
      hours[key]?.close === first?.close &&
      !hours[key]?.closed,
  );
  if (same && first?.open && first?.close) {
    return `${first.open} – ${first.close} (${enabled.length} días)`;
  }
  return `${enabled.length} días configurados`;
}

export function patchOperatingHour(
  hours: OpeningHours,
  key: OpeningHourKey,
  patch: { open?: string; close?: string; closed?: boolean },
): OpeningHours {
  const current = hours[key] ?? { open: '08:00', close: '22:00' };
  return {
    ...hours,
    [key]: { ...current, ...patch },
  };
}

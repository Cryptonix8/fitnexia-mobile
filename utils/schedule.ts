import type { WeeklyDaySchedule, WeeklySchedule } from '@/types/api';

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;
const WEEKDAY_SHORT_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'] as const;

/** Monday-first order for UI (still uses JS getDay: 0=Sun … 6=Sat). */
export const WEEKDAYS_MON_FIRST = [1, 2, 3, 4, 5, 6, 0] as const;

export function weekdayLabel(weekday: number): string {
  return WEEKDAY_LABELS[weekday] ?? '?';
}

export function weekdayShortLabel(weekday: number): string {
  return WEEKDAY_SHORT_LABELS[weekday] ?? '?';
}

export function defaultWeeklySchedule(): WeeklySchedule {
  return Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    enabled: weekday >= 1 && weekday <= 5,
    startTime: '09:00',
    endTime: '17:00',
  }));
}

export function parseTimeString(time: string): { hours: number; minutes: number } {
  const [h, m] = time.split(':').map((part) => parseInt(part, 10));
  return { hours: h || 0, minutes: m || 0 };
}

export function formatTimeString(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function timeStringToDate(time: string, base = new Date()): Date {
  const { hours, minutes } = parseTimeString(time);
  const d = new Date(base);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function dateToTimeString(date: Date): string {
  return formatTimeString(date.getHours(), date.getMinutes());
}

export function combineDateAndTime(date: Date, time: Date): Date {
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return result;
}

export function formatScheduleDay(day: WeeklyDaySchedule): string {
  if (!day.enabled) return 'Apagado';
  return `${day.startTime} – ${day.endTime}`;
}

export function formatWeeklyScheduleSummary(schedule: WeeklySchedule): string {
  const active = schedule.filter((d) => d.enabled);
  if (active.length === 0) return 'Sin horario definido';
  if (active.length === 7 && active.every((d) => d.startTime === active[0].startTime && d.endTime === active[0].endTime)) {
    return `Diario ${active[0].startTime}–${active[0].endTime}`;
  }
  const weekdays = active.filter((d) => d.weekday >= 1 && d.weekday <= 5);
  if (weekdays.length === 5 && active.length === 5) {
    return `Lun–Vie ${weekdays[0].startTime}–${weekdays[0].endTime}`;
  }
  return `${active.length} días/semana`;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function defaultClassStart(): { date: Date; time: Date } {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);
  const time = new Date();
  time.setHours(9, 0, 0, 0);
  return { date, time };
}

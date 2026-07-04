import { isSameCalendarDay } from '@/utils/schedule';
import { APP_LOCALE } from '@/utils/locale';

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString(APP_LOCALE, { month: 'long', year: 'numeric' });
}

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;

export function getWeekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS;
}

/** Flat grid: leading nulls + each day of the month (Sun-first week rows). */
export function buildMonthGrid(month: Date): (Date | null)[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leading = first.getDay();
  const cells: (Date | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, monthIndex, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

/** Split a flat month grid into Sun–Sat week rows (length is always a multiple of 7). */
export function chunkMonthGrid(cells: (Date | null)[]): (Date | null)[][] {
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function isToday(date: Date): boolean {
  return isSameCalendarDay(date, new Date());
}

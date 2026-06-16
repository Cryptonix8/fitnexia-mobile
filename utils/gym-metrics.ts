import { MOCK_GYM_WEEKLY_METRICS } from '@/data/mock';
import { DEFAULT_CURRENCY } from '@/constants/currency';
import { APP_LOCALE } from '@/utils/locale';
import type { ClassListItem } from '@/types/api';

export type GymMetricsView = {
  bookings: number;
  revenueCents: number;
  attendanceRate: number;
  bookingsChangePct: number;
  revenueChangePct: number;
  attendanceChangePct: number;
  daily: typeof MOCK_GYM_WEEKLY_METRICS.daily;
  topClasses: { title: string; attendancePct: number; bookings: number }[];
};

function formatChange(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${Math.round(pct * 100)}% vs semana anterior`;
}

export function formatGymChange(pct: number): string {
  return formatChange(pct);
}

export function formatRevenueCompact(cents: number): string {
  if (cents >= 1_000_000) {
    return `${new Intl.NumberFormat(APP_LOCALE, {
      style: 'currency',
      currency: DEFAULT_CURRENCY,
      maximumFractionDigits: 0,
    }).format(cents / 100_000)}k`;
  }
  return new Intl.NumberFormat(APP_LOCALE, {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function getGymMetrics(institutionId: string, classes: ClassListItem[]): GymMetricsView {
  const gymClasses = classes.filter((c) => c.institution?.id === institutionId);
  const base = MOCK_GYM_WEEKLY_METRICS;

  let extraBookings = 0;
  let extraRevenue = 0;
  let totalCapacity = 0;
  let totalBooked = 0;

  const topClasses = gymClasses.map((c) => {
    const capacity = c.capacity ?? 1;
    const spotsLeft = c.spotsLeft ?? capacity;
    const booked = Math.max(0, capacity - spotsLeft);
    totalCapacity += capacity;
    totalBooked += booked;
    extraBookings += booked;
    extraRevenue += booked * c.price.amount;
    return {
      title: c.title,
      attendancePct: capacity > 0 ? booked / capacity : 0,
      bookings: booked,
    };
  });

  const liveAttendance = totalCapacity > 0 ? totalBooked / totalCapacity : base.attendanceRate;

  return {
    bookings: base.bookings + extraBookings,
    revenueCents: base.revenueCents + extraRevenue,
    attendanceRate: gymClasses.length > 0 ? liveAttendance : base.attendanceRate,
    bookingsChangePct: base.bookingsChangePct,
    revenueChangePct: base.revenueChangePct,
    attendanceChangePct: base.attendanceChangePct,
    daily: base.daily,
    topClasses:
      topClasses.length > 0
        ? topClasses.sort((a, b) => b.attendancePct - a.attendancePct)
        : [
            { title: 'CrossFit Grupal', attendancePct: 1, bookings: 20 },
            { title: 'HIIT Matutino', attendancePct: 0.85, bookings: 17 },
          ],
  };
}

export function formatAttendanceRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

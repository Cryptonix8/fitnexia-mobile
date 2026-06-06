import type { ClassListItem } from '@/types/api';

import { computeClassBooked } from '@/utils/gym-classes';

export type InstructorTodayStats = {
  bookings: number;
  revenueCents: number;
  classes: number;
};

export function computeInstructorTodayStats(todayClasses: ClassListItem[]): InstructorTodayStats {
  return todayClasses.reduce(
    (acc, cls) => {
      const booked = computeClassBooked(cls);
      return {
        bookings: acc.bookings + booked,
        revenueCents: acc.revenueCents + booked * cls.price.amount,
        classes: acc.classes + 1,
      };
    },
    { bookings: 0, revenueCents: 0, classes: 0 },
  );
}

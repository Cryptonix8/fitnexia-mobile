import type { ClassListItem } from '@/types/api';
import { MOCK_INSTRUCTORS } from '@/data/mock';
import { getLinkedInstitutionId } from '@/utils/institution';
import { isSameCalendarDay } from '@/utils/schedule';

export function getGymClasses(institutionId: string, classes: ClassListItem[]): ClassListItem[] {
  return classes.filter((c) => c.institution?.id === institutionId);
}

export function canManageGymClass(
  cls: ClassListItem,
  institutionId: string,
  instructorId?: string,
): boolean {
  if (cls.institution?.id === institutionId) return true;
  if (instructorId && cls.instructor.id === instructorId) return true;
  return false;
}

export function getLinkedInstructors(instructorIds: string[]) {
  return instructorIds
    .map((id) => MOCK_INSTRUCTORS.find((i) => i.id === id))
    .filter((i): i is (typeof MOCK_INSTRUCTORS)[number] => Boolean(i));
}

export function computeClassBooked(cls: ClassListItem): number {
  const capacity = cls.capacity ?? 0;
  const spotsLeft = cls.spotsLeft ?? capacity;
  return Math.max(0, capacity - spotsLeft);
}

export function computeOccupancyRate(classes: ClassListItem[]): number {
  let capacity = 0;
  let booked = 0;
  for (const cls of classes) {
    capacity += cls.capacity ?? 0;
    booked += computeClassBooked(cls);
  }
  return capacity > 0 ? booked / capacity : 0;
}

export function computeGymDashboardStats(institutionId: string, classes: ClassListItem[]) {
  const gymClasses = getGymClasses(institutionId, classes);
  const today = new Date();
  const todayClasses = gymClasses
    .filter((c) => isSameCalendarDay(new Date(c.startAt), today))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const todayBookings = todayClasses.reduce((sum, c) => sum + computeClassBooked(c), 0);
  const occupancyRate = computeOccupancyRate(gymClasses);

  const weekRevenueCents = gymClasses.reduce(
    (sum, c) => sum + computeClassBooked(c) * c.price.amount,
    0,
  );

  return {
    gymClasses,
    todayClasses,
    todayBookings,
    occupancyRate,
    weekRevenueCents,
  };
}

export function gymLocationLabel(
  profile: { name: string; address?: string; city?: string } | undefined,
  institutionId: string,
): string {
  if (!profile) return 'Gym location';
  const parts = [profile.address, profile.city].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : profile.name || institutionId;
}

/** Resolve institution id from auth user */
export function resolveInstitutionId(user: { institutionId?: string } | null | undefined): string {
  return getLinkedInstitutionId(user);
}

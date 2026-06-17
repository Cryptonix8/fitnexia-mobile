import type { ClassListItem } from '@/types/api';
import type { ScheduleFilter } from '@/constants/fitnexia';
import { translateDisciplineLabel, translateLocationLabel } from '@/constants/labels';
import { isWithinRadius } from '@/utils/geo';

export interface ClassSearchFilters {
  query: string;
  discipline: string | null;
  modality: 'in_person' | 'online' | null;
  location: string;
  schedule: ScheduleFilter;
  priceMin: number | null;
  priceMax: number | null;
  /** When set with lat/lng, keep only in-person classes within radiusKm. */
  nearMe?: boolean;
  userLat?: number | null;
  userLng?: number | null;
  radiusKm?: number;
}

function classHour(iso: string): number {
  return new Date(iso).getHours();
}

function matchesSchedule(item: ClassListItem, schedule: ScheduleFilter): boolean {
  if (schedule === 'any') return true;

  const start = new Date(item.startAt);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (schedule === 'week') {
    const end = new Date(now);
    end.setDate(end.getDate() + 7);
    end.setHours(23, 59, 59, 999);
    return start >= now && start <= end;
  }

  if (schedule === 'month') {
    const end = new Date(now);
    end.setDate(end.getDate() + 30);
    end.setHours(23, 59, 59, 999);
    return start >= now && start <= end;
  }

  const hour = classHour(item.startAt);
  if (schedule === 'morning') return hour < 12;
  if (schedule === 'afternoon') return hour >= 12 && hour < 17;
  if (schedule === 'evening') return hour >= 17;
  return true;
}

function matchesLocation(item: ClassListItem, location: string): boolean {
  if (!location.trim()) return true;
  const q = location.toLowerCase().trim();
  if (q === 'online' && item.modality === 'online') return true;
  const parts = [
    translateLocationLabel(item.location?.label),
    item.institution?.name,
    item.modality === 'online' ? 'en línea' : null,
  ].filter(Boolean) as string[];
  return parts.some((p) => p.toLowerCase().includes(q));
}

export function filterClasses(
  classes: ClassListItem[],
  filters: ClassSearchFilters,
): ClassListItem[] {
  return classes.filter((item) => {
    if (filters.discipline && translateDisciplineLabel(item.discipline) !== filters.discipline) return false;
    if (filters.modality && item.modality !== filters.modality) return false;

    if (filters.priceMin != null && item.price.amount < filters.priceMin) return false;
    if (filters.priceMax != null && item.price.amount > filters.priceMax) return false;

    if (!matchesLocation(item, filters.location)) return false;
    if (!matchesSchedule(item, filters.schedule)) return false;

    if (
      filters.nearMe &&
      filters.userLat != null &&
      filters.userLng != null &&
      !isWithinRadius(
        item,
        { lat: filters.userLat, lng: filters.userLng },
        filters.radiusKm ?? 10,
      )
    ) {
      return false;
    }

    if (filters.query.trim()) {
      const q = filters.query.toLowerCase();
      const haystack = [
        item.title,
        item.discipline,
        item.instructor.displayName,
        item.institution?.name,
        item.location?.label,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

export function sortClassesByDate(classes: ClassListItem[]): ClassListItem[] {
  return [...classes].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
}

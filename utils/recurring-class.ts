import type { ClassListItem } from '@/types/api';

export function isRecurringClass(
  item: Pick<ClassListItem, 'seriesId' | 'recurrence'>,
): boolean {
  return Boolean(item.seriesId || item.recurrence?.enabled);
}

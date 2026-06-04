import type { ClassListItem } from '@/types/api';

/** Contract for class data — swap mock for API without changing screens. */
export interface ClassesRepository {
  list(): ClassListItem[];
  getById(id: string): ClassListItem | undefined;
  listByInstructor(instructorId: string): ClassListItem[];
}

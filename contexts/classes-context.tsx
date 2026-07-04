import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  cancelClassApi,
  createClassApi,
  fetchClassesSearch,
  fetchGymClasses,
  fetchMyClasses,
  updateClassApi,
} from '@/services/api/classes.api';
import { getErrorMessage } from '@/services/api/errors';
import { useAuth } from '@/contexts/auth-context';
import type { ClassListItem } from '@/types/api';

export type NewClassInput = Omit<ClassListItem, 'id' | 'averageRating'> & {
  description?: string;
  recurrence?: import('@/types/api').ClassRecurrence;
};

interface ClassesContextValue {
  classes: ClassListItem[];
  isLoading: boolean;
  error: string | null;
  refreshClasses: () => Promise<void>;
  getClassById: (id: string) => ClassListItem | undefined;
  getClassesByInstructor: (instructorId: string) => ClassListItem[];
  addClass: (input: NewClassInput) => Promise<ClassListItem>;
  updateClass: (
    id: string,
    updates: Partial<ClassListItem>,
    options?: { editScope?: 'this' | 'following' },
  ) => Promise<void>;
  cancelClass: (id: string) => Promise<void>;
}

const ClassesContext = createContext<ClassesContextValue | null>(null);

function sortByStartAt(items: ClassListItem[]): ClassListItem[] {
  return [...items].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
}

function toCreatePayload(input: NewClassInput, userRole?: string, institutionId?: string, instructorId?: string) {
  const body: Record<string, unknown> = {
    title: input.title,
    discipline: input.discipline,
    modality: input.modality,
    classFormat: input.classFormat,
    startAt: input.startAt,
    durationMinutes: input.durationMinutes,
    price: input.price,
    capacity: input.capacity,
    institutionId: input.institution?.id ?? (userRole === 'institution' ? institutionId : undefined),
    instructorId: userRole === 'institution' ? input.instructor.id : instructorId,
    location: input.location
      ? { label: input.location.label, lat: input.location.lat, lng: input.location.lng }
      : undefined,
  };
  if (input.description) body.description = input.description;
  if (input.recurrence?.enabled) body.recurrence = input.recurrence;
  return body;
}

function toUpdatePayload(
  updates: Partial<ClassListItem>,
  options?: { editScope?: 'this' | 'following' },
) {
  const body: Record<string, unknown> = {};
  if (updates.title !== undefined) body.title = updates.title;
  if (updates.discipline !== undefined) body.discipline = updates.discipline;
  if (updates.modality !== undefined) body.modality = updates.modality;
  if (updates.classFormat !== undefined) body.classFormat = updates.classFormat;
  if (updates.startAt !== undefined) body.startAt = updates.startAt;
  if (updates.durationMinutes !== undefined) body.durationMinutes = updates.durationMinutes;
  if (updates.price !== undefined) body.price = updates.price;
  if (updates.capacity !== undefined) body.capacity = updates.capacity;
  if (updates.location !== undefined) {
    body.location = updates.location;
  }
  if (options?.editScope) body.editScope = options.editScope;
  return body;
}

export function ClassesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (user?.role === 'instructor') {
        const mine = await fetchMyClasses();
        setClasses(sortByStartAt(mine));
      } else if (user?.role === 'institution') {
        const gymClasses = await fetchGymClasses();
        const search = await fetchClassesSearch({ limit: 50 });
        const merged = new Map<string, ClassListItem>();
        for (const c of [...search.data, ...gymClasses]) merged.set(c.id, c);
        setClasses(sortByStartAt([...merged.values()]));
      } else {
        const result = await fetchClassesSearch({ limit: 50 });
        setClasses(sortByStartAt(result.data));
      }
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar las clases'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    refreshClasses();
  }, [refreshClasses]);

  const getClassById = useCallback(
    (id: string) => classes.find((c) => c.id === id),
    [classes],
  );

  const getClassesByInstructor = useCallback(
    (instructorId: string) =>
      sortByStartAt(classes.filter((c) => c.instructor.id === instructorId)),
    [classes],
  );

  const addClass = useCallback(
    async (input: NewClassInput) => {
      const created = await createClassApi(
        toCreatePayload(
          input,
          user?.role,
          user?.institutionId,
          user?.instructorId,
        ),
      );
      setClasses((prev) => sortByStartAt([...prev, created]));
      return created;
    },
    [user?.role, user?.institutionId, user?.instructorId],
  );

  const updateClass = useCallback(
    async (id: string, updates: Partial<ClassListItem>, options?: { editScope?: 'this' | 'following' }) => {
      const updated = await updateClassApi(id, toUpdatePayload(updates, options));
      setClasses((prev) => sortByStartAt(prev.map((c) => (c.id === id ? updated : c))));
      if (options?.editScope === 'following') {
        await refreshClasses();
      }
    },
    [refreshClasses],
  );

  const cancelClass = useCallback(async (id: string) => {
    await cancelClassApi(id);
    setClasses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      classes,
      isLoading,
      error,
      refreshClasses,
      getClassById,
      getClassesByInstructor,
      addClass,
      updateClass,
      cancelClass,
    }),
    [
      classes,
      isLoading,
      error,
      refreshClasses,
      getClassById,
      getClassesByInstructor,
      addClass,
      updateClass,
      cancelClass,
    ],
  );

  return <ClassesContext.Provider value={value}>{children}</ClassesContext.Provider>;
}

export function useClasses() {
  const ctx = useContext(ClassesContext);
  if (!ctx) throw new Error('useClasses must be used within ClassesProvider');
  return ctx;
}

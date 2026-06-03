import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { MOCK_CLASSES } from '@/data/mock';
import type { ClassListItem } from '@/types/api';

export type NewClassInput = Omit<ClassListItem, 'id' | 'averageRating'>;

interface ClassesContextValue {
  classes: ClassListItem[];
  getClassById: (id: string) => ClassListItem | undefined;
  getClassesByInstructor: (instructorId: string) => ClassListItem[];
  addClass: (input: NewClassInput) => ClassListItem;
  updateClass: (id: string, updates: Partial<ClassListItem>) => void;
  cancelClass: (id: string) => void;
}

const ClassesContext = createContext<ClassesContextValue | null>(null);

function sortByStartAt(items: ClassListItem[]): ClassListItem[] {
  return [...items].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
}

export function ClassesProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState<ClassListItem[]>(() => sortByStartAt(MOCK_CLASSES));

  const getClassById = useCallback(
    (id: string) => classes.find((c) => c.id === id),
    [classes],
  );

  const getClassesByInstructor = useCallback(
    (instructorId: string) =>
      sortByStartAt(classes.filter((c) => c.instructor.id === instructorId)),
    [classes],
  );

  const addClass = useCallback((input: NewClassInput) => {
    const created: ClassListItem = {
      ...input,
      id: `class-${Date.now()}`,
    };
    setClasses((prev) => sortByStartAt([...prev, created]));
    return created;
  }, []);

  const updateClass = useCallback((id: string, updates: Partial<ClassListItem>) => {
    setClasses((prev) =>
      sortByStartAt(
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      ),
    );
  }, []);

  const cancelClass = useCallback((id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      classes,
      getClassById,
      getClassesByInstructor,
      addClass,
      updateClass,
      cancelClass,
    }),
    [classes, getClassById, getClassesByInstructor, addClass, updateClass, cancelClass],
  );

  return <ClassesContext.Provider value={value}>{children}</ClassesContext.Provider>;
}

export function useClasses() {
  const ctx = useContext(ClassesContext);
  if (!ctx) throw new Error('useClasses must be used within ClassesProvider');
  return ctx;
}

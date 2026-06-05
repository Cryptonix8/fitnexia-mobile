import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { fetchStaffReviewsForInstructor, submitStaffReviewApi } from '@/services/api/instructors.api';
import type { StaffReview } from '@/types/api';

interface ReviewsContextValue {
  staffReviews: StaffReview[];
  isLoading: boolean;
  loadStaffReviewsForInstructor: (instructorId: string) => Promise<StaffReview[]>;
  getStaffReviewsForInstructor: (instructorId: string) => StaffReview[];
  getGymReviewForInstructor: (institutionId: string, instructorId: string) => StaffReview | undefined;
  canGymReviewInstructor: (
    institutionId: string,
    instructorId: string,
    linkedInstructorIds: string[],
  ) => boolean;
  addStaffReview: (review: Omit<StaffReview, 'id' | 'verified' | 'createdAt'>) => Promise<StaffReview>;
}

const ReviewsContext = createContext<ReviewsContextValue | null>(null);

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [staffReviews, setStaffReviews] = useState<StaffReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, StaffReview[]>>({});

  const loadStaffReviewsForInstructor = useCallback(async (instructorId: string) => {
    setIsLoading(true);
    try {
      const data = await fetchStaffReviewsForInstructor(instructorId);
      setCache((prev) => ({ ...prev, [instructorId]: data }));
      setStaffReviews((prev) => {
        const others = prev.filter((r) => r.instructorId !== instructorId);
        return [...others, ...data];
      });
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStaffReviewsForInstructor = useCallback(
    (instructorId: string) =>
      (cache[instructorId] ?? staffReviews.filter((r) => r.instructorId === instructorId)).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [cache, staffReviews],
  );

  const getGymReviewForInstructor = useCallback(
    (institutionId: string, instructorId: string) =>
      staffReviews.find(
        (r) => r.institutionId === institutionId && r.instructorId === instructorId,
      ),
    [staffReviews],
  );

  const canGymReviewInstructor = useCallback(
    (institutionId: string, instructorId: string, linkedInstructorIds: string[]) => {
      if (!linkedInstructorIds.includes(instructorId)) return false;
      return !staffReviews.some(
        (r) => r.institutionId === institutionId && r.instructorId === instructorId,
      );
    },
    [staffReviews],
  );

  const addStaffReview = useCallback(
    async (input: Omit<StaffReview, 'id' | 'verified' | 'createdAt'>) => {
      const created = await submitStaffReviewApi(
        input.instructorId,
        input.rating,
        input.comment,
      );
      setStaffReviews((prev) => [...prev, created]);
      setCache((prev) => ({
        ...prev,
        [input.instructorId]: [...(prev[input.instructorId] ?? []), created],
      }));
      return created;
    },
    [],
  );

  const value = useMemo(
    () => ({
      staffReviews,
      isLoading,
      loadStaffReviewsForInstructor,
      getStaffReviewsForInstructor,
      getGymReviewForInstructor,
      canGymReviewInstructor,
      addStaffReview,
    }),
    [
      staffReviews,
      isLoading,
      loadStaffReviewsForInstructor,
      getStaffReviewsForInstructor,
      getGymReviewForInstructor,
      canGymReviewInstructor,
      addStaffReview,
    ],
  );

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewsProvider');
  return ctx;
}

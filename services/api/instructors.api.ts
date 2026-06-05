import type { Instructor, StaffReview } from '@/types/api';

import { apiRequest } from './client';

type InstructorsListResponse = {
  data: Pick<Instructor, 'id' | 'displayName' | 'disciplines' | 'verified' | 'averageRating' | 'reviewCount'>[];
};

type ReviewsResponse = { data: StaffReview[] };

export async function fetchInstructorById(id: string) {
  return apiRequest<Instructor>(`/instructors/${id}`, { auth: false });
}

export async function fetchAllInstructors() {
  const result = await apiRequest<InstructorsListResponse>('/instructors', { auth: false });
  return result.data;
}

export async function fetchStaffReviewsForInstructor(instructorId: string) {
  const result = await apiRequest<ReviewsResponse>(`/instructors/${instructorId}/staff-reviews`, {
    auth: false,
  });
  return result.data;
}

export async function submitStaffReviewApi(instructorId: string, rating: number, comment?: string) {
  return apiRequest<StaffReview>('/institutions/me/staff-reviews', {
    method: 'POST',
    body: { instructorId, rating, comment: comment || undefined },
  });
}

/** Mock institution id linked to the logged-in gym account */
export function getLinkedInstitutionId(
  user: { institutionId?: string } | null | undefined,
): string {
  return user?.institutionId ?? 'gym-1';
}

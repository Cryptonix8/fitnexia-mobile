import type { UserRole } from '@/types/auth-user';
import type { Notification } from '@/types/api';

export type TabKey = string;

const TYPE_TAB: Record<string, Partial<Record<UserRole | 'institution', TabKey>>> = {
  class_scheduled: { athlete: 'bookings' },
  booking_confirmed: { instructor: 'dashboard', institution: 'dashboard' },
  class_posted: { instructor: 'classes', institution: 'classes' },
  class_ended: { athlete: 'bookings', instructor: 'calendar' },
  class_reminder_24h: { athlete: 'bookings' },
  class_reminder_1h: { athlete: 'bookings' },
  class_reminder_10m: { athlete: 'bookings' },
  review_invite: { athlete: 'bookings' },
  payment_confirmed: { athlete: 'bookings', instructor: 'earnings' },
  class_cancelled_by_instructor: { athlete: 'bookings' },
  class_updated_by_instructor: { athlete: 'bookings' },
  series_paused: { athlete: 'bookings' },
  series_deleted: { athlete: 'bookings' },
  waitlist_spot: { athlete: 'bookings' },
  instructor_invite: { instructor: 'dashboard', institution: 'instructors' },
  club_arrears_alert: { institution: 'members' },
  membership_due_reminder: { athlete: 'profile', institution: 'members' },
  membership_payment_confirmed: { athlete: 'profile', institution: 'members' },
  membership_payment_failed: { athlete: 'profile', institution: 'members' },
  membership_overdue: { athlete: 'profile', institution: 'members' },
  membership_invite: { athlete: 'profile' },
  verification_approved: { athlete: 'profile', instructor: 'profile', institution: 'profile' },
  verification_rejected: { athlete: 'profile', instructor: 'profile', institution: 'profile' },
};

export function notificationTab(
  notification: Notification & { data?: { tab?: string } },
  role: UserRole,
): TabKey | null {
  const explicit = notification.data?.tab;
  if (explicit) return explicit;
  const roleKey = role === 'institution' ? 'institution' : role;
  return TYPE_TAB[notification.type]?.[roleKey] ?? null;
}

export function formatTabBadge(count: number): string | number | undefined {
  if (count <= 0) return undefined;
  return count > 9 ? '9+' : count;
}

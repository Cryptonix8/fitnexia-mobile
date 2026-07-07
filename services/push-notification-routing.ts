export type PushNotificationData = {
  type?: string;
  bookingId?: string;
  classId?: string;
  inviteId?: string;
  memberId?: string;
  inviteCode?: string;
  screen?: string;
};

export function routeFromPushData(data: PushNotificationData | undefined) {
  if (!data) return null;

  if (data.screen) return data.screen;

  switch (data.type) {
    case 'password_reset':
      return '/(auth)/forgot-password';
    case 'booking_confirmed':
    case 'class_scheduled':
    case 'payment_confirmed':
      return data.classId ? `/class/${data.classId}` : '/(athlete)/(tabs)/bookings';
    case 'class_reminder_24h':
    case 'class_reminder_1h':
    case 'class_reminder_10m':
    case 'class_ended':
      return data.classId ? `/class/${data.classId}` : '/(athlete)/(tabs)/bookings';
    case 'class_posted':
      return data.classId ? `/class/${data.classId}` : '/(instructor)/(tabs)/classes';
    case 'instructor_invite':
      return '/(instructor)/(tabs)/dashboard';
    case 'review_invite':
      return data.bookingId ? `/review/${data.bookingId}` : '/(athlete)/(tabs)/bookings';
    case 'membership_invite':
      return data.inviteCode ? `/membership/join?code=${data.inviteCode}` : '/membership/join';
    case 'membership_due_reminder':
    case 'membership_payment_confirmed':
    case 'membership_payment_failed':
    case 'membership_overdue':
      return data.memberId ? `/membership/${data.memberId}` : '/membership';
    case 'club_arrears_alert':
      return '/(gym)/(tabs)/members';
    default:
      return null;
  }
}

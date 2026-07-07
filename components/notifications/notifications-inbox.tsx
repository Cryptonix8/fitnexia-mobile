import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Radius, Spacing } from '@/constants/fitnexia';
import { NOTIFICATION_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';
import { useLiveNotifications } from '@/hooks/use-live-notifications';
import {
  deleteNotificationApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from '@/services/api/v2-features.api';
import { requestAppRefresh } from '@/services/app-refresh';
import type { Notification } from '@/types/api';

const PREVIEW_LIMIT = 5;

function iconForType(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'class_posted':
      return 'megaphone-outline';
    case 'class_scheduled':
    case 'booking_confirmed':
      return 'calendar-outline';
    case 'class_ended':
    case 'review_invite':
      return 'checkmark-circle-outline';
    case 'class_reminder_24h':
    case 'class_reminder_1h':
    case 'class_reminder_10m':
      return 'alarm-outline';
    case 'payment_confirmed':
    case 'membership_payment_confirmed':
      return 'card-outline';
    case 'class_cancelled_by_instructor':
    case 'series_deleted':
      return 'close-circle-outline';
    case 'class_updated_by_instructor':
      return 'create-outline';
    case 'verification_approved':
      return 'shield-checkmark-outline';
    case 'verification_rejected':
      return 'shield-outline';
    case 'instructor_invite':
    case 'membership_invite':
      return 'mail-outline';
    default:
      return 'notifications-outline';
  }
}

type NotificationData = Notification & { data?: { screen?: string } };

type Props = {
  /** When true, only the first five items are shown until expanded. */
  compact?: boolean;
};

export function NotificationsInbox({ compact = false }: Props) {
  const { colors } = useAppTheme();
  const { items, setItems, loading } = useLiveNotifications();
  const [expanded, setExpanded] = useState(false);

  const visibleItems = useMemo(() => {
    if (!compact || expanded) return items;
    return items.slice(0, PREVIEW_LIMIT);
  }, [compact, expanded, items]);

  const hasMore = compact && !expanded && items.length > PREVIEW_LIMIT;

  const markRead = async (notification: NotificationData) => {
    if (!notification.read) {
      await markNotificationReadApi(notification.id);
      setItems((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
      );
      requestAppRefresh();
    }
    const screen = notification.data?.screen;
    if (screen) {
      router.push(screen as never);
    }
  };

  const markAllRead = async () => {
    await markAllNotificationsReadApi();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    requestAppRefresh();
  };

  const remove = (notification: Notification) => {
    Alert.alert(
      NOTIFICATION_LABELS.deleteTitle,
      NOTIFICATION_LABELS.deleteMessage,
      [
        { text: NOTIFICATION_LABELS.cancel, style: 'cancel' },
        {
          text: NOTIFICATION_LABELS.deleteConfirm,
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await deleteNotificationApi(notification.id);
              setItems((prev) => prev.filter((n) => n.id !== notification.id));
              requestAppRefresh();
            })();
          },
        },
      ],
    );
  };

  const unread = items.filter((n) => !n.read).length;

  if (loading && items.length === 0) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <EmptyState
        icon="notifications-outline"
        title={NOTIFICATION_LABELS.emptyTitle}
        description={NOTIFICATION_LABELS.emptyDescription}
      />
    );
  }

  return (
    <View>
      {unread > 0 ? (
        <View style={styles.toolbar}>
          <Text style={[styles.unreadHint, { color: colors.textMuted }]}>
            {unread === 1
              ? NOTIFICATION_LABELS.unreadOne
              : NOTIFICATION_LABELS.unreadMany.replace('{count}', String(unread))}
          </Text>
          <Button title={NOTIFICATION_LABELS.markAll} variant="ghost" onPress={() => void markAllRead()} />
        </View>
      ) : null}

      {visibleItems.map((n) => {
        const icon = iconForType(n.type);
        return (
          <Pressable
            key={n.id}
            onPress={() => void markRead(n as NotificationData)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: n.read ? colors.surface : colors.primaryMuted,
                borderColor: n.read ? colors.border : colors.primary,
                opacity: pressed ? 0.92 : 1,
              },
            ]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
              <Ionicons name={icon} size={22} color={colors.primary} />
              {!n.read ? <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} /> : null}
            </View>

            <View style={styles.content}>
              <Text style={[styles.title, { color: colors.text }]}>{n.title}</Text>
              {n.body ? (
                <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={3}>
                  {n.body}
                </Text>
              ) : null}
              <Text style={[styles.date, { color: colors.textMuted }]}>
                {new Date(n.createdAt).toLocaleString('es-UY', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <Pressable
              accessibilityLabel={NOTIFICATION_LABELS.deleteConfirm}
              hitSlop={12}
              onPress={() => remove(n)}
              style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
            </Pressable>
          </Pressable>
        );
      })}

      {hasMore ? (
        <Button
          title={NOTIFICATION_LABELS.seeMore.replace('{count}', String(items.length - PREVIEW_LIMIT))}
          variant="outline"
          onPress={() => setExpanded(true)}
          style={styles.seeMore}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  unreadHint: { fontSize: 13, flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: { flex: 1, gap: 4 },
  title: { fontWeight: '700', fontSize: 15, lineHeight: 20 },
  body: { fontSize: 14, lineHeight: 20 },
  date: { fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: 4, marginTop: 2 },
  seeMore: { marginTop: Spacing.xs },
  loadingWrap: { paddingVertical: Spacing.xl, alignItems: 'center' },
});

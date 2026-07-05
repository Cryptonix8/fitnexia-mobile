import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import {
  fetchNotifications,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from '@/services/api/v2-features.api';
import type { Notification } from '@/types/api';

export default function NotificationsScreen() {
  const { colors } = useAppTheme();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchNotifications();
      setItems(result.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const markRead = async (id: string) => {
    await markNotificationReadApi(id);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = async () => {
    await markAllNotificationsReadApi();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <Screen
      scroll
      loading={loading && items.length === 0}
      loadingMessage={LOADING_LABELS.default}
      header={
        <View style={styles.headerRow}>
          <Header title="Notificaciones" showBack />
          {unread > 0 ? (
            <Button title="Marcar todas" variant="ghost" onPress={markAllRead} />
          ) : null}
        </View>
      }>
      {items.length === 0 && !loading ? (
        <EmptyState icon="notifications-outline" title="Sin notificaciones" />
      ) : (
        items.map((n) => (
          <Pressable
            key={n.id}
            onPress={() => !n.read && markRead(n.id)}
            style={[
              styles.card,
              {
                backgroundColor: n.read ? colors.surface : colors.surfaceMuted,
                borderColor: colors.border,
              },
            ]}>
            <Text style={[styles.title, { color: colors.text }]}>{n.title}</Text>
            {n.body ? (
              <Text style={[styles.body, { color: colors.textSecondary }]}>{n.body}</Text>
            ) : null}
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {new Date(n.createdAt).toLocaleString('es-UY')}
            </Text>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  title: { fontWeight: '700', fontSize: 16 },
  body: { marginTop: 4, fontSize: 14 },
  date: { marginTop: 8, fontSize: 12 },
});

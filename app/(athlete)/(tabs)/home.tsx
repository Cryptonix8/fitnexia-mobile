import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ActionHubGrid, type HubAction } from '@/components/ui/action-hub-grid';
import { ClassCard } from '@/components/class-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useClasses } from '@/contexts/classes-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import { fetchUnreadNotificationCount } from '@/services/api/v2-features.api';
import { useUserLocation } from '@/hooks/use-user-location';
import {
  classDistanceKm,
  formatDistanceKm,
  sortClassesByDistance,
} from '@/utils/geo';

export default function AthleteHomeScreen() {
  const { colors } = useAppTheme();
  const { classes, isLoading, error, refreshClasses } = useClasses();
  const geoEnabled = useFeature('geolocationMap');
  const inboxEnabled = useFeature('inAppNotificationCenter');
  const openGamesEnabled = useFeature('openGames');
  const { coords, requestLocation } = useUserLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (geoEnabled) {
      requestLocation();
    }
  }, [geoEnabled, requestLocation]);

  useFocusEffect(
    useCallback(() => {
      void refreshClasses();
      if (inboxEnabled) {
        fetchUnreadNotificationCount()
          .then((r) => setUnreadCount(r.unread))
          .catch(() => setUnreadCount(0));
      }
    }, [refreshClasses, inboxEnabled]),
  );

  const allClasses = useMemo(() => {
    if (geoEnabled && coords) {
      return sortClassesByDistance(classes, coords);
    }
    return classes;
  }, [classes, coords, geoEnabled]);

  const quickActions: HubAction[] = openGamesEnabled
    ? [
        {
          id: 'open-games',
          label: 'Partidos abiertos',
          subtitle: 'Pádel y fútbol — buscá jugadores',
          icon: 'people',
          tint: colors.primaryMuted,
          iconColor: colors.primary,
          featured: true,
          onPress: () => router.push('/open-games'),
        },
      ]
    : [];

  return (
    <Screen
      scroll
      loading={isLoading && classes.length === 0}
      loadingMessage={LOADING_LABELS.classes}
      header={
        <View style={styles.top}>
          <View>
            <Text style={[styles.greet, { color: colors.textMuted }]}>Buenos días 👋</Text>
            <Text style={[styles.headline, { color: colors.text }]}>Encontrá tu próxima clase</Text>
          </View>
          {inboxEnabled ? (
            <Pressable
              style={[styles.bell, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push('/(athlete)/notifications')}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              {unreadCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.error }]}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              ) : null}
            </Pressable>
          ) : (
            <View style={[styles.bell, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
            </View>
          )}
        </View>
      }>

      <View style={[styles.searchBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          placeholder="Buscar clases, coaches, gimnasios..."
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.text }]}
          onFocus={() => router.push('/(athlete)/(tabs)/search')}
        />
      </View>

      {quickActions.length > 0 ? <ActionHubGrid actions={quickActions} /> : null}

      {error && classes.length === 0 ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="No se pudieron cargar las clases"
          description={error}
          actionLabel="Reintentar"
          onAction={() => void refreshClasses()}
        />
      ) : allClasses.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No hay clases disponibles"
        />
      ) : (
        allClasses.map((c) => (
          <ClassCard
            key={c.id}
            item={c}
            distanceLabel={
              geoEnabled && coords
                ? (() => {
                    const km = classDistanceKm(c, coords);
                    return km != null ? formatDistanceKm(km) : undefined;
                  })()
                : undefined
            }
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  greet: { fontSize: 14 },
  headline: { fontSize: 26, fontWeight: '800', marginTop: 4 },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  searchInput: { flex: 1, fontSize: 16 },
});

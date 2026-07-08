import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { CourtCard } from '@/components/courts/court-card';
import { ActionHubGrid } from '@/components/ui/action-hub-grid';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import { fetchGymCourts } from '@/services/api/courts.api';

export default function GymCourtsScreen() {
  const { colors } = useAppTheme();
  const [courts, setCourts] = useState<Awaited<ReturnType<typeof fetchGymCourts>>>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCourts(await fetchGymCourts());
    } catch {
      setCourts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const actions = useMemo(
    () => [
      {
        id: 'create',
        label: 'Nueva cancha',
        subtitle: 'Alta con deporte, superficie e iluminación',
        icon: 'add-circle-outline' as const,
        tint: colors.primary,
        iconColor: colors.surface,
        featured: true,
        onPress: () => router.push('/(gym)/courts/create'),
      },
      {
        id: 'schedule',
        label: 'Disponibilidad',
        subtitle: 'Turnos libres y ocupados',
        icon: 'calendar-outline' as const,
        tint: colors.successMuted,
        iconColor: colors.success,
        onPress: () => router.push('/(gym)/courts/schedule'),
      },
      {
        id: 'pricing',
        label: 'Tarifas',
        subtitle: 'Socios, peak y fin de semana',
        icon: 'cash-outline' as const,
        tint: colors.warningMuted,
        iconColor: colors.warning,
        onPress: () => router.push('/(gym)/courts/pricing'),
      },
      {
        id: 'reservations',
        label: 'Reservas',
        subtitle: 'Reservas del club por día',
        icon: 'clipboard-outline' as const,
        tint: colors.primaryMuted,
        iconColor: colors.primary,
        onPress: () => router.push('/(gym)/courts/reservations'),
      },
      {
        id: 'settings',
        label: 'Configuración',
        subtitle: 'Turnos y cancelación',
        icon: 'settings-outline' as const,
        tint: colors.surfaceMuted,
        iconColor: colors.textSecondary,
        onPress: () => router.push('/(gym)/courts/settings'),
      },
    ],
    [colors],
  );

  return (
    <Screen
      scroll
      loading={loading && courts.length === 0}
      loadingMessage={LOADING_LABELS.default}
      header={<Header title="Canchas y espacios" showBack />}>
      <Text style={[styles.intro, { color: colors.textMuted }]}>
        Gestioná canchas, horarios, tarifas y reservas desde un solo lugar.
      </Text>

      <ActionHubGrid actions={actions} />

      <Text style={[styles.section, { color: colors.text }]}>Tus canchas ({courts.length})</Text>

      {courts.length === 0 && !loading ? (
        <EmptyState
          icon="football-outline"
          title="Sin canchas registradas"
          description="Creá tu primera cancha para habilitar reservas con turnos y pagos."
        />
      ) : (
        courts.map((court) => (
          <CourtCard
            key={court.id}
            court={court}
            onPress={() => router.push(`/(gym)/courts/edit/${court.id}`)}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.md },
  section: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
});

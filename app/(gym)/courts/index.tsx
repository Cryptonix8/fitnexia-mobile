import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import { fetchGymCourts, type Court } from '@/services/api/courts.api';

const SPORT_LABELS: Record<string, string> = {
  football_5: 'Fútbol 5',
  football_7: 'Fútbol 7',
  football_11: 'Fútbol 11',
  padel: 'Pádel',
  tennis: 'Tenis',
  rugby: 'Rugby',
  other: 'Otro',
};

export default function GymCourtsScreen() {
  const { colors } = useAppTheme();
  const [courts, setCourts] = useState<Court[]>([]);
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

  return (
    <Screen
      scroll
      loading={loading && courts.length === 0}
      loadingMessage={LOADING_LABELS.default}
      header={<Header title="Canchas y espacios" showBack />}>
      <View style={styles.actions}>
        <Button title="Nueva cancha" onPress={() => router.push('/(gym)/courts/create')} />
        <Button
          title="Horarios"
          variant="secondary"
          onPress={() => router.push('/(gym)/courts/schedule')}
        />
        <Button
          title="Tarifas"
          variant="secondary"
          onPress={() => router.push('/(gym)/courts/pricing')}
        />
      </View>

      {courts.length === 0 && !loading ? (
        <EmptyState
          icon="football-outline"
          title="Sin canchas registradas"
          description="Agregá canchas con tipo, superficie, iluminación y horarios."
        />
      ) : (
        courts.map((court) => (
          <View
            key={court.id}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.name, { color: colors.text }]}>{court.name}</Text>
            <Text style={{ color: colors.textMuted }}>
              {SPORT_LABELS[court.sportType] ?? court.sportType} ·{' '}
              {court.locationType === 'indoor' ? 'Indoor' : 'Outdoor'} ·{' '}
              {court.hasLighting ? 'Con luz' : 'Sin luz'}
            </Text>
            {!court.active ? (
              <Text style={{ color: colors.textMuted, marginTop: 4 }}>Inactiva</Text>
            ) : null}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: Spacing.sm, marginBottom: Spacing.lg },
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  name: { fontWeight: '700', fontSize: 16 },
});

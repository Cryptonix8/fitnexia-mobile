import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionHubGrid, type HubAction } from '@/components/ui/action-hub-grid';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterChip } from '@/components/ui/filter-chip';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { courtSportLabel } from '@/constants/courts';
import { Radius, Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import { fetchMyOpenGames, fetchOpenGames, type OpenGame } from '@/services/api/open-games.api';

const SPORT_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'padel', label: 'Pádel' },
  { value: 'football_5', label: 'Fútbol 5' },
  { value: 'football_7', label: 'Fútbol 7' },
];

function GameCard({ game, onPress }: { game: OpenGame; onPress: () => void }) {
  const { colors } = useAppTheme();
  const when = new Date(game.startAt).toLocaleString('es-UY', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.92 : 1 },
      ]}>
      <View style={styles.cardTop}>
        <View style={[styles.sportBadge, { backgroundColor: colors.primaryMuted }]}>
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>
            {courtSportLabel(game.sportType)}
          </Text>
        </View>
        <Text style={[styles.spots, { color: game.spotsLeft > 0 ? colors.primary : colors.textMuted }]}>
          {game.spotsLeft > 0 ? `${game.spotsLeft} cupo${game.spotsLeft === 1 ? '' : 's'}` : 'Completo'}
        </Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{game.title}</Text>
      <Text style={{ color: colors.textMuted }}>{when}</Text>
      {game.locationLabel ? (
        <View style={styles.locRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, flex: 1 }}>{game.locationLabel}</Text>
        </View>
      ) : null}
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>
        {game.joinedCount}/{game.capacity} jugadores
        {game.level ? ` · Nivel ${game.level}` : ''}
      </Text>
    </Pressable>
  );
}

export default function OpenGamesScreen() {
  const { colors } = useAppTheme();
  const { mine } = useLocalSearchParams<{ mine?: string }>();
  const showMine = mine === '1';
  const [games, setGames] = useState<OpenGame[]>([]);
  const [sportFilter, setSportFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = showMine
        ? await fetchMyOpenGames()
        : await fetchOpenGames(sportFilter ? { sportType: sportFilter } : undefined);
      setGames(data);
    } catch {
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [sportFilter, showMine]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const hubActions: HubAction[] = [
    {
      id: 'create',
      label: 'Crear partido',
      subtitle: 'Buscá jugadores para pádel o fútbol',
      icon: 'add-circle',
      tint: colors.primaryMuted,
      iconColor: colors.primary,
      featured: true,
      onPress: () => router.push('/open-games/create'),
    },
    {
      id: 'mine',
      label: 'Mis partidos',
      subtitle: 'Organizados y a los que me sumé',
      icon: 'football',
      tint: '#dbeafe',
      iconColor: '#2563eb',
      onPress: () => router.push('/open-games?mine=1'),
    },
  ];

  return (
    <Screen
      scroll
      loading={loading && games.length === 0}
      loadingMessage={LOADING_LABELS.default}
      header={<Header title={showMine ? 'Mis partidos' : 'Partidos abiertos'} showBack />}>
      {!showMine ? (
        <>
          <Text style={[styles.intro, { color: colors.textMuted }]}>
            Creá una sesión de pádel o fútbol con cupos libres y sumá jugadores que buscan partido.
          </Text>

          <ActionHubGrid actions={hubActions} />

          <Text style={[styles.section, { color: colors.text }]}>Buscar partidos</Text>
          <View style={styles.chips}>
            {SPORT_FILTERS.map((f) => (
              <FilterChip
                key={f.value || 'all'}
                label={f.label}
                active={sportFilter === f.value}
                onPress={() => setSportFilter(f.value)}
              />
            ))}
          </View>
        </>
      ) : null}

      {games.length === 0 && !loading ? (
        <EmptyState
          icon="people-outline"
          title="No hay partidos abiertos"
          description="Sé el primero en crear uno o probá otro deporte."
          actionLabel="Crear partido"
          onAction={() => router.push('/open-games/create')}
        />
      ) : (
        games.map((game) => (
          <GameCard key={game.id} game={game} onPress={() => router.push(`/open-games/${game.id}`)} />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.md },
  section: { fontSize: 17, fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: 6,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sportBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  spots: { fontSize: 13, fontWeight: '700' },
  title: { fontSize: 17, fontWeight: '700' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});

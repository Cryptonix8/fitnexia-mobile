import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Screen } from '@/components/ui/screen';
import { UserAvatar } from '@/components/user-avatar';
import { useAppTheme } from '@/contexts/theme-context';
import { courtSportLabel } from '@/constants/courts';
import { Radius, Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import { getErrorMessage } from '@/services/api/errors';
import {
  cancelOpenGameApi,
  fetchOpenGameById,
  joinOpenGameApi,
  leaveOpenGameApi,
  type OpenGame,
} from '@/services/api/open-games.api';

export default function OpenGameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const [game, setGame] = useState<OpenGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchOpenGameById(id);
      setGame(data);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const join = async () => {
    if (!id) return;
    setActing(true);
    try {
      const updated = await joinOpenGameApi(id);
      setGame(updated);
    } catch (err) {
      Alert.alert('No se pudo unir', getErrorMessage(err));
    } finally {
      setActing(false);
    }
  };

  const leave = async () => {
    if (!id) return;
    setActing(true);
    try {
      const updated = await leaveOpenGameApi(id);
      setGame(updated);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setActing(false);
    }
  };

  const cancel = () => {
    if (!id) return;
    Alert.alert('Cancelar partido', '¿Seguro que querés cancelar este partido?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          setActing(true);
          try {
            await cancelOpenGameApi(id);
            router.replace('/open-games');
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          } finally {
            setActing(false);
          }
        },
      },
    ]);
  };

  if (!game) {
    return (
      <Screen loading={loading} loadingMessage={LOADING_LABELS.default} header={<Header title="Partido" showBack />} />
    );
  }

  const when = new Date(game.startAt).toLocaleString('es-UY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
  const isJoined = game.myStatus === 'joined';
  const canJoin = game.status === 'open' && !isJoined && game.spotsLeft > 0;

  return (
    <Screen scroll header={<Header title="Partido abierto" showBack />}>
      <View style={[styles.hero, { backgroundColor: colors.primaryMuted }]}>
        <Text style={[styles.sport, { color: colors.primary }]}>{courtSportLabel(game.sportType)}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{game.title}</Text>
        <Text style={{ color: colors.textMuted }}>{when}</Text>
        {game.locationLabel ? (
          <View style={styles.locRow}>
            <Ionicons name="location-outline" size={16} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted }}>{game.locationLabel}</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.stats, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{game.joinedCount}</Text>
          <Text style={{ color: colors.textMuted }}>Jugadores</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>{game.spotsLeft}</Text>
          <Text style={{ color: colors.textMuted }}>Cupos libres</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>{game.capacity}</Text>
          <Text style={{ color: colors.textMuted }}>Total</Text>
        </View>
      </View>

      {game.description ? (
        <Text style={[styles.desc, { color: colors.text }]}>{game.description}</Text>
      ) : null}

      <Text style={[styles.section, { color: colors.text }]}>Jugadores</Text>
      {game.participants.map((p) => (
        <View key={p.userId} style={[styles.player, { borderColor: colors.border }]}>
          <UserAvatar size={40} kind="user" uri={p.avatarUri} />
          <Text style={{ color: colors.text, fontWeight: '600', flex: 1 }}>
            {p.firstName} {p.lastName}
            {p.userId === game.creatorUserId ? ' (organizador)' : ''}
          </Text>
        </View>
      ))}

      {canJoin ? <Button title="Unirme al partido" onPress={join} style={{ marginTop: Spacing.lg }} /> : null}
      {isJoined && !game.isCreator ? (
        <Button title="Salir del partido" variant="outline" onPress={leave} style={{ marginTop: Spacing.md }} />
      ) : null}
      {game.isCreator && game.status !== 'cancelled' ? (
        <Button title="Cancelar partido" variant="outline" onPress={cancel} style={{ marginTop: Spacing.md }} />
      ) : null}

      <LoadingOverlay visible={acting} message="Actualizando…" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, gap: 6 },
  sport: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  stats: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800' },
  desc: { fontSize: 15, lineHeight: 22, marginBottom: Spacing.md },
  section: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
});

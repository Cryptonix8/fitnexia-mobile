import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { LiveClassRoom } from '@/components/live/live-class-room';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import { getErrorMessage } from '@/services/api/errors';
import {
  endClassStream,
  fetchClassStreamStatus,
  joinClassStream,
  leaveClassStream,
  type ClassStreamJoin,
  type ClassStreamStatus,
} from '@/services/api/live-streaming.api';

export default function LiveClassScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const { colors } = useAppTheme();
  const [status, setStatus] = useState<ClassStreamStatus | null>(null);
  const [session, setSession] = useState<ClassStreamJoin | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const data = await fetchClassStreamStatus(classId);
      setStatus(data);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err), [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const join = async () => {
    if (!classId) return;
    setJoining(true);
    try {
      const result = await joinClassStream(classId);
      setSession(result);
    } catch (err) {
      Alert.alert('No se pudo entrar', getErrorMessage(err));
      await loadStatus();
    } finally {
      setJoining(false);
    }
  };

  const leave = async () => {
    if (!classId) return;
    try {
      await leaveClassStream(classId);
    } catch {
      /* ignore */
    }
    setSession(null);
    router.back();
  };

  const endForAll = () => {
    if (!classId) return;
    Alert.alert('Terminar clase en vivo', '¿Cerrar la transmisión para todos?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Terminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await endClassStream(classId);
            setSession(null);
            router.back();
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  if (session) {
    return (
      <View style={styles.full}>
        <LiveClassRoom
          token={session.token}
          serverUrl={session.url}
          role={session.role}
          classTitle={session.classTitle}
          onLeave={leave}
          onEndForAll={session.role === 'host' ? endForAll : undefined}
        />
      </View>
    );
  }

  const startLabel = status?.classStartAt
    ? new Date(status.classStartAt).toLocaleString('es-UY', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <Screen
      loading={loading}
      loadingMessage={LOADING_LABELS.default}
      header={<Header title="Clase en vivo" showBack />}>
      <Text style={[styles.title, { color: colors.text }]}>
        {status?.classTitle || 'Transmisión en vivo'}
      </Text>
      <Text style={[styles.meta, { color: colors.textMuted }]}>
        {startLabel}
        {status?.classDurationMinutes ? ` · ${status.classDurationMinutes} min` : ''}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Video integrado en Fitnexia</Text>
        <Text style={[styles.cardBody, { color: colors.textMuted }]}>
          No hace falta Zoom ni otra app. La clase se transmite por LiveKit dentro de Fitnexia, con
          audio y video en tiempo real.
        </Text>
        {!status?.livekitConfigured ? (
          <Text style={styles.warn}>
            LiveKit aún no está configurado en el servidor. Pedile al admin que agregue LIVEKIT_URL,
            LIVEKIT_API_KEY y LIVEKIT_API_SECRET.
          </Text>
        ) : null}
        {status && !status.withinJoinWindow ? (
          <Text style={styles.warn}>
            La sala abre 15 minutos antes del horario de la clase.
          </Text>
        ) : null}
        {status?.status === 'live' ? (
          <Text style={[styles.live, { color: colors.primary }]}>La clase está en vivo ahora</Text>
        ) : null}
      </View>

      <Button
        title={
          joining
            ? 'Conectando…'
            : status?.role === 'host'
              ? status.status === 'live'
                ? 'Entrar como instructor'
                : 'Iniciar transmisión'
              : 'Unirme a la clase'
        }
        onPress={join}
        disabled={!status?.canJoin || joining}
        style={{ marginTop: Spacing.lg }}
      />
      {!status?.canJoin && status?.livekitConfigured ? (
        <Text style={[styles.footer, { color: colors.textMuted }]}>
          Necesitás una reserva confirmada (o ser el instructor) y estar dentro de la ventana de la
          clase.
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, backgroundColor: '#0b1220' },
  title: { fontSize: 24, fontWeight: '800' },
  meta: { fontSize: 14, marginTop: 4, marginBottom: Spacing.lg },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardBody: { fontSize: 14, lineHeight: 20 },
  warn: { fontSize: 13, lineHeight: 18, marginTop: 4, color: '#b45309' },
  live: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  footer: { fontSize: 13, lineHeight: 18, marginTop: Spacing.md },
});

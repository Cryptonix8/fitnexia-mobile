import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/fitnexia';
import { ALERT_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';
import { getErrorMessage } from '@/services/api/errors';
import {
  disconnectMpAccount,
  fetchMpConnectStatus,
  fetchMpConnectUrl,
  type MpConnectStatusResponse,
} from '@/services/api/mp-connect.api';
import { openInAppBrowser } from '@/utils/in-app-browser';

function statusLabel(status: MpConnectStatusResponse['connection']['status'], connected: boolean) {
  if (connected) return 'Conectada';
  if (status === 'revoked') return 'Desconectada';
  if (status === 'pending') return 'Pendiente';
  return 'No conectada';
}

export function MpPayoutConnect() {
  const { colors } = useAppTheme();
  const [data, setData] = useState<MpConnectStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const status = await fetchMpConnectStatus();
      setData(status);
    } catch (err) {
      Alert.alert('No se pudo cargar Mercado Pago', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const connect = async () => {
    if (!data?.marketplace.configured) {
      Alert.alert(
        'Marketplace pendiente',
        'Las credenciales de Mercado Pago aún no están configuradas en el servidor.',
      );
      return;
    }

    if (!data?.marketplace.enabled) {
      Alert.alert(
        'Marketplace desactivado',
        'El marketplace está configurado pero desactivado en el servidor. Contactá a soporte Fitnexia.',
      );
      return;
    }

    setBusy(true);
    try {
      const { url } = await fetchMpConnectUrl();
      if (Platform.OS === 'web') {
        window.open(url, '_blank', 'noopener,noreferrer');
        Alert.alert(
          'Continuá en Mercado Pago',
          'Completá la autorización en la nueva pestaña y volvé a esta pantalla.',
        );
        return;
      }

      const result = await openInAppBrowser(url, 'fitnexia://profile/payout-connected');
      if (result && 'type' in result && result.type === 'cancel') return;
      await load();
      Alert.alert('Mercado Pago', 'Tu cuenta de cobro fue vinculada correctamente.');
    } catch (err) {
      Alert.alert('Conexión fallida', getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const disconnect = () => {
    Alert.alert('Desconectar Mercado Pago', '¿Querés desvincular tu cuenta de cobro?', [
      { text: ALERT_LABELS.cancel, style: 'cancel' },
      {
        text: 'Desconectar',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await disconnectMpAccount();
            await load();
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.hint, { color: colors.textMuted }]}>Cargando cuenta de cobro…</Text>
      </View>
    );
  }

  const connected = data?.connection.connected ?? false;
  const marketplaceEnabled = data?.marketplace.enabled ?? false;

  return (
    <>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Conectá tu cuenta de cobros de Mercado Pago (no es crear cuenta Fitnexia). Así recibís el
        neto de clases y reservas pagadas por atletas; Fitnexia retiene su comisión.
      </Text>

      <SurfaceCard style={styles.card}>
        <Ionicons
          name={connected ? 'checkmark-circle' : 'wallet-outline'}
          size={32}
          color={connected ? colors.success : colors.primary}
        />
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Mercado Pago</Text>
          <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
            Estado: {statusLabel(data?.connection.status ?? 'disconnected', connected)}
          </Text>
          {data?.connection.connectedAt ? (
            <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
              Conectada el {new Date(data.connection.connectedAt).toLocaleDateString()}
            </Text>
          ) : null}
          {!data?.marketplace.configured ? (
            <Text style={[styles.pending, { color: colors.primary }]}>
              Marketplace sin credenciales en el servidor.
            </Text>
          ) : !marketplaceEnabled ? (
            <Text style={[styles.pending, { color: colors.primary }]}>
              Marketplace configurado pero desactivado en el servidor.
            </Text>
          ) : null}
        </View>
      </SurfaceCard>

      {connected ? (
        <Button title="Desconectar cuenta" variant="outline" onPress={disconnect} disabled={busy} />
      ) : (
        <Button title="Conectar Mercado Pago" onPress={connect} disabled={busy} />
      )}

      <LoadingOverlay visible={busy} message="Conectando…" />
    </>
  );
}

const styles = StyleSheet.create({
  centered: { paddingVertical: Spacing.lg },
  hint: { fontSize: 15, marginBottom: Spacing.lg, lineHeight: 22 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardMeta: { fontSize: 13, marginTop: 4 },
  pending: {
    fontSize: 13,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
});

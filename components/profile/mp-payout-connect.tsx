import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import { ALERT_LABELS } from '@/constants/labels';
import { getErrorMessage } from '@/services/api/errors';
import {
  disconnectMpAccount,
  fetchMpConnectStatus,
  fetchMpConnectUrl,
  type MpConnectStatusResponse,
} from '@/services/api/mp-connect.api';

WebBrowser.maybeCompleteAuthSession();

function statusLabel(status: MpConnectStatusResponse['connection']['status'], connected: boolean) {
  if (connected) return 'Conectada';
  if (status === 'revoked') return 'Desconectada';
  if (status === 'pending') return 'Pendiente';
  return 'No conectada';
}

export function MpPayoutConnect() {
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
        'Fitnexia aún no tiene credenciales de Marketplace de Mercado Pago. Cuando el cliente las entregue, podrás conectar tu cuenta aquí.',
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

      const result = await WebBrowser.openAuthSessionAsync(url, 'fitnexia://profile/payout-connected');
      if (result.type === 'cancel') return;
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
        <Text style={styles.hint}>Cargando cuenta de cobro…</Text>
      </View>
    );
  }

  const connected = data?.connection.connected ?? false;
  const marketplaceEnabled = data?.marketplace.enabled ?? false;

  return (
    <>
      <Text style={styles.hint}>
        Conectá tu cuenta de Mercado Pago para recibir el neto de tus clases automáticamente cuando
        el marketplace esté activo.
      </Text>

      <View style={styles.card}>
        <Ionicons
          name={connected ? 'checkmark-circle' : 'wallet-outline'}
          size={32}
          color={connected ? '#15803d' : FitnexiaColors.primary}
        />
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>Mercado Pago</Text>
          <Text style={styles.cardMeta}>
            Estado: {statusLabel(data?.connection.status ?? 'disconnected', connected)}
          </Text>
          {data?.connection.connectedAt ? (
            <Text style={styles.cardMeta}>
              Conectada el {new Date(data.connection.connectedAt).toLocaleDateString()}
            </Text>
          ) : null}
          {!data?.marketplace.configured ? (
            <Text style={styles.pending}>
              Marketplace en configuración — tu cliente debe entregar credenciales MP.
            </Text>
          ) : !marketplaceEnabled ? (
            <Text style={styles.pending}>
              Marketplace configurado pero desactivado — se habilitará al confirmar reglas de cobro.
            </Text>
          ) : null}
        </View>
      </View>

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
  hint: { fontSize: 15, color: FitnexiaColors.gray500, marginBottom: Spacing.lg, lineHeight: 22 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: FitnexiaColors.gray900 },
  cardMeta: { fontSize: 13, color: FitnexiaColors.gray500, marginTop: 4 },
  pending: {
    fontSize: 13,
    color: FitnexiaColors.primary,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
});

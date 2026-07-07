import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { DEFAULT_NOTIFICATIONS, useAuth, type NotificationPreferences } from '@/contexts/auth-context';
import { isNotificationPrefVisible } from '@/constants/features';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import { ALERT_LABELS, BUTTON_LABELS } from '@/constants/labels';

const ALL_ITEMS: { key: keyof NotificationPreferences; label: string; desc: string }[] = [
  { key: 'bookingConfirmed', label: 'Confirmaciones de reserva', desc: 'Cuando alguien reserva o cancela' },
  { key: 'classReminders', label: 'Recordatorios de clase', desc: '24 h, 1 h y 10 min antes de tus clases' },
  { key: 'paymentUpdates', label: 'Actualizaciones de pago', desc: 'Cobros y recibos de transacciones' },
  { key: 'reviewInvites', label: 'Invitaciones a reseñar', desc: 'Después de completar una clase' },
  { key: 'creditsExpiring', label: 'Alertas de cuenta', desc: 'Verificación y actualizaciones de políticas' },
  { key: 'marketing', label: 'Promociones', desc: 'Ofertas del plan Pro y novedades de la plataforma' },
];

export function NotificationsSettings() {
  const { user, updateProfile } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences>(
    user?.notificationPreferences ?? DEFAULT_NOTIFICATIONS,
  );

  const toggle = (key: keyof NotificationPreferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const save = () => {
    updateProfile({ notificationPreferences: prefs });
    Alert.alert(ALERT_LABELS.savedTitle, 'Preferencias de notificación actualizadas.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <>
      <Text style={styles.hint}>Elegí qué querés recibir por push y email.</Text>
      {ALL_ITEMS.filter((item) => isNotificationPrefVisible(item.key)).map((item) => (
        <View key={item.key} style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
          <Switch
            value={prefs[item.key]}
            onValueChange={() => toggle(item.key)}
            trackColor={{ true: FitnexiaColors.primaryLight, false: FitnexiaColors.gray200 }}
            thumbColor={prefs[item.key] ? FitnexiaColors.primary : FitnexiaColors.gray400}
          />
        </View>
      ))}
      <Button title={BUTTON_LABELS.save} onPress={save} style={{ marginTop: Spacing.lg }} />
    </>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15, color: FitnexiaColors.gray500, marginBottom: Spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  rowText: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600', color: FitnexiaColors.gray900 },
  desc: { fontSize: 13, color: FitnexiaColors.gray500, marginTop: 2 },
});

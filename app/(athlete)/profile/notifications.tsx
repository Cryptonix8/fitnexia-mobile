import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { DEFAULT_NOTIFICATIONS, useAuth, type NotificationPreferences } from '@/contexts/auth-context';
import { isNotificationPrefVisible } from '@/constants/features';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import { ALERT_LABELS, BUTTON_LABELS, SCREEN_TITLES } from '@/constants/labels';

const ALL_ITEMS: { key: keyof NotificationPreferences; label: string; desc: string }[] = [
  { key: 'bookingConfirmed', label: 'Confirmaciones de reserva', desc: 'Cuando se reserva o cancela una clase' },
  { key: 'classReminders', label: 'Recordatorios de clase', desc: '24 h y 1 h antes de tu clase' },
  { key: 'paymentUpdates', label: 'Actualizaciones de pago', desc: 'Recibos y avisos de reembolso' },
  { key: 'creditsExpiring', label: 'Créditos por vencer', desc: '30 días antes de que venzan los créditos' },
  { key: 'marketing', label: 'Promociones', desc: 'Ofertas y novedades' },
];

export default function NotificationsScreen() {
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
    <Screen scroll>
      <Header title={SCREEN_TITLES.notifications} showBack />
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
    </Screen>
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

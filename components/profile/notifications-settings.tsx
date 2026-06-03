import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { DEFAULT_NOTIFICATIONS, useAuth, type NotificationPreferences } from '@/contexts/auth-context';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';

const ITEMS: { key: keyof NotificationPreferences; label: string; desc: string }[] = [
  { key: 'bookingConfirmed', label: 'Booking confirmations', desc: 'When someone books or cancels' },
  { key: 'classReminders', label: 'Class reminders', desc: '24h and 1h before your classes' },
  { key: 'paymentUpdates', label: 'Payment updates', desc: 'Payouts and transaction receipts' },
  { key: 'creditsExpiring', label: 'Account alerts', desc: 'Verification and policy updates' },
  { key: 'marketing', label: 'Promotions', desc: 'Pro plan offers and platform news' },
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
    Alert.alert('Saved', 'Notification preferences updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <>
      <Text style={styles.hint}>Choose what you want to receive by push and email.</Text>
      {ITEMS.map((item) => (
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
      <Button title="Save" onPress={save} style={{ marginTop: Spacing.lg }} />
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

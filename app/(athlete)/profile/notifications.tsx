import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { DEFAULT_NOTIFICATIONS, useAuth, type NotificationPreferences } from '@/contexts/auth-context';
import { isNotificationPrefVisible } from '@/constants/features';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';

const ALL_ITEMS: { key: keyof NotificationPreferences; label: string; desc: string }[] = [
  { key: 'bookingConfirmed', label: 'Booking confirmations', desc: 'When a class is booked or cancelled' },
  { key: 'classReminders', label: 'Class reminders', desc: '24h and 1h before your class' },
  { key: 'paymentUpdates', label: 'Payment updates', desc: 'Receipts and refund notices' },
  { key: 'creditsExpiring', label: 'Credits expiring', desc: '30 days before loyalty credits expire' },
  { key: 'marketing', label: 'Promotions', desc: 'Offers and new features' },
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
    Alert.alert('Saved', 'Notification preferences updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen scroll>
      <Header title="Notifications" showBack />
      <Text style={styles.hint}>Choose what you want to receive by push and email.</Text>
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
      <Button title="Save" onPress={save} style={{ marginTop: Spacing.lg }} />
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

import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { ToggleChip } from '@/components/ui/toggle-chip';
import { useAuth } from '@/contexts/auth-context';
import { DISCIPLINES, Spacing } from '@/constants/fitnexia';
import { ALERT_LABELS, BUTTON_LABELS, SCREEN_TITLES } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';

export default function FavoriteSportsScreen() {
  const { colors } = useAppTheme();
  const { user, updateProfile } = useAuth();
  const [selected, setSelected] = useState<string[]>(user?.favoriteSports ?? []);

  const toggle = (sport: string) => {
    setSelected((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport],
    );
  };

  const save = () => {
    updateProfile({ favoriteSports: selected });
    Alert.alert(ALERT_LABELS.savedTitle, 'Deportes favoritos actualizados.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen scroll header={<Header title={SCREEN_TITLES.favoriteSports} showBack />}>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Seleccioná los deportes que te gustan. Los usamos para personalizar tu feed.
      </Text>
      <View style={styles.grid}>
        {DISCIPLINES.map((sport) => (
          <ToggleChip
            key={sport}
            label={sport}
            active={selected.includes(sport)}
            onPress={() => toggle(sport)}
            textStyle={{ fontSize: 15, fontWeight: '500' }}
            style={{ paddingHorizontal: 16, paddingVertical: 10 }}
          />
        ))}
      </View>
      <Button title={BUTTON_LABELS.save} onPress={save} style={{ marginTop: Spacing.lg }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15, marginBottom: Spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});

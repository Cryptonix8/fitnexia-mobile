import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { DISCIPLINES, FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import { ALERT_LABELS, BUTTON_LABELS, SCREEN_TITLES } from '@/constants/labels';

export default function FavoriteSportsScreen() {
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
    <Screen scroll>
      <Header title={SCREEN_TITLES.favoriteSports} showBack />
      <Text style={styles.hint}>
        Seleccioná los deportes que te gustan. Los usamos para personalizar tu feed.
      </Text>
      <View style={styles.grid}>
        {DISCIPLINES.map((sport) => {
          const active = selected.includes(sport);
          return (
            <Pressable
              key={sport}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggle(sport)}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{sport}</Text>
            </Pressable>
          );
        })}
      </View>
      <Button title={BUTTON_LABELS.save} onPress={save} style={{ marginTop: Spacing.lg }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15, color: FitnexiaColors.gray500, marginBottom: Spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: FitnexiaColors.white,
    borderWidth: 1,
    borderColor: FitnexiaColors.gray200,
  },
  chipActive: {
    backgroundColor: FitnexiaColors.primary,
    borderColor: FitnexiaColors.primary,
  },
  chipText: { fontSize: 15, fontWeight: '500', color: FitnexiaColors.gray700 },
  chipTextActive: { color: FitnexiaColors.white },
});

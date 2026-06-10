import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { PROFILE_MENU_LABELS } from '@/constants/labels';
import { fetchStaffRoster, type StaffRosterEntry } from '@/services/api/institutions.api';

export default function GymManageInstructorsScreen() {
  const { colors } = useAppTheme();
  const [roster, setRoster] = useState<StaffRosterEntry[]>([]);

  const loadRoster = useCallback(async () => {
    try {
      setRoster(await fetchStaffRoster());
    } catch {
      setRoster([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRoster();
    }, [loadRoster]),
  );

  const linked = roster.filter((i) => i.staffStatus === 'linked');

  return (
    <Screen scroll>
      <Header title={PROFILE_MENU_LABELS.instructors} showBack />
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Gestioná invitaciones y staff desde la pestaña Equipo. Usá esta pantalla para invitar por
        email si la persona aún no está registrada.
      </Text>

      <Text style={[styles.section, { color: colors.text }]}>Vinculados ({linked.length})</Text>
      {linked.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>Todavía no hay instructores vinculados.</Text>
      ) : (
        linked.map((i) => (
          <Text key={i.id} style={[styles.linkedName, { color: colors.text }]}>
            · {i.displayName}
          </Text>
        ))
      )}

      <Button
        title="Ir a Equipo"
        onPress={() => router.replace('/(gym)/(tabs)/instructors')}
        style={{ marginTop: Spacing.lg }}
      />
      <Button
        title="Invitar por email"
        variant="outline"
        onPress={() => router.push('/(gym)/profile/invite-instructor')}
        style={{ marginTop: Spacing.sm }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15, marginBottom: Spacing.lg, lineHeight: 22 },
  section: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  empty: { fontSize: 14, marginBottom: Spacing.md },
  linkedName: { fontSize: 15, marginBottom: 4 },
});

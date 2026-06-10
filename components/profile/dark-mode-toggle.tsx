import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/fitnexia';
import { useAppTheme } from '@/contexts/theme-context';

export function DarkModeToggle() {
  const { colors, isDark, toggleDarkMode, themeMode } = useAppTheme();

  return (
    <View style={[styles.row, { backgroundColor: colors.surface }]}>
      <Ionicons name={isDark ? 'moon' : 'sunny-outline'} size={22} color={colors.textSecondary} />
      <View style={styles.text}>
        <Text style={[styles.label, { color: colors.text }]}>Modo oscuro</Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          {themeMode === 'system' ? 'Sistema' : isDark ? 'Activado' : 'Desactivado'}
        </Text>
      </View>
      <Switch
        value={isDark}
        onValueChange={toggleDarkMode}
        trackColor={{ true: colors.primaryMuted, false: colors.surfaceMuted }}
        thumbColor={isDark ? colors.primary : colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  text: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 13, marginTop: 2 },
});

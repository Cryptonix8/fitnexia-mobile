import { UserAvatar } from '@/components/user-avatar';
import { FilterChip } from '@/components/ui/filter-chip';
import { useAppTheme } from '@/contexts/theme-context';
import type { Instructor } from '@/types/api';
import { StyleSheet, Text, View } from 'react-native';
import { Spacing } from '@/constants/fitnexia';

type InstructorOption = Pick<Instructor, 'id' | 'displayName' | 'disciplines' | 'photoUrl'>;

type InstructorPickerProps = {
  instructors: InstructorOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  label?: string;
};

export function InstructorPicker({
  instructors,
  selectedId,
  onSelect,
  label = 'Instructor',
}: InstructorPickerProps) {
  const { colors } = useAppTheme();

  if (instructors.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No hay staff vinculado. Agregá o invitá instructores primero.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.row}>
        {instructors.map((i) => (
          <FilterChip
            key={i.id}
            label={i.displayName}
            active={selectedId === i.id}
            onPress={() => onSelect(i.id)}
          />
        ))}
      </View>
      {selectedId ? (
        <View style={[styles.preview, { backgroundColor: colors.surfaceMuted }]}>
          <UserAvatar
            size={36}
            kind="instructor"
            uri={instructors.find((i) => i.id === selectedId)?.photoUrl}
          />
          <Text style={[styles.previewText, { color: colors.textSecondary }]}>
            {instructors.find((i) => i.id === selectedId)?.disciplines?.join(' · ') ||
              'Sin disciplinas'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: Spacing.md },
  label: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.xs },
  empty: { marginBottom: Spacing.md },
  emptyText: { fontSize: 14, lineHeight: 20 },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: 10,
    marginTop: Spacing.sm,
  },
  previewText: { flex: 1, fontSize: 13 },
});

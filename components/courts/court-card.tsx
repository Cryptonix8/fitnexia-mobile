import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Badge } from '@/components/ui/badge';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { courtSportLabel, courtSurfaceLabel } from '@/constants/courts';
import type { Court } from '@/services/api/courts.api';
import { formatOperatingHoursSummary } from '@/utils/court-hours';

type Props = {
  court: Court;
  onPress?: () => void;
};

export function CourtCard({ court, onPress }: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryMuted }]}>
          <Ionicons name="football-outline" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.text }]}>{court.name}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>
            {courtSportLabel(court.sportType)} · {courtSurfaceLabel(court.surface)}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>
            {court.locationType === 'indoor' ? 'Interior' : 'Exterior'} ·{' '}
            {court.hasLighting ? 'Con iluminación' : 'Sin iluminación'}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>
            {formatOperatingHoursSummary(court.operatingHours)}
          </Text>
        </View>
        {!court.active ? <Badge label="Inactiva" variant="warning" /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
});

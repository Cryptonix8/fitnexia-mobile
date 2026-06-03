import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { formatClassDate, MOCK_CLASSES } from '@/data/mock';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';

export default function InstructorCalendarScreen() {
  const events = MOCK_CLASSES.slice(0, 4);

  return (
    <Screen scroll>
      <Text style={styles.title}>Agenda</Text>
      <Text style={styles.sub}>June 2026</Text>
      {events.map((c, i) => (
        <View key={c.id} style={styles.event}>
          <View style={styles.dotCol}>
            <View style={styles.dot} />
            {i < events.length - 1 ? <View style={styles.line} /> : null}
          </View>
          <View style={styles.eventBody}>
            <Text style={styles.time}>{formatClassDate(c.startAt)}</Text>
            <Text style={styles.eventTitle}>{c.title}</Text>
            <Text style={styles.meta}>
              {c.modality === 'online' ? 'Online' : c.location?.label}
            </Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: FitnexiaColors.gray900 },
  sub: { fontSize: 15, color: FitnexiaColors.gray500, marginBottom: Spacing.lg },
  event: { flexDirection: 'row', marginBottom: Spacing.md },
  dotCol: { alignItems: 'center', width: 24 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: FitnexiaColors.primary,
  },
  line: { flex: 1, width: 2, backgroundColor: FitnexiaColors.gray200, marginTop: 4 },
  eventBody: {
    flex: 1,
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginLeft: Spacing.md,
  },
  time: { fontSize: 12, color: FitnexiaColors.primary, fontWeight: '600' },
  eventTitle: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  meta: { fontSize: 13, color: FitnexiaColors.gray500, marginTop: 4 },
});

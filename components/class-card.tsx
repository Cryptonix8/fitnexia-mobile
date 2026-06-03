import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import { formatClassDate, formatMoney } from '@/data/mock';
import type { ClassListItem } from '@/types/api';

export function ClassCard({ item, compact }: { item: ClassListItem; compact?: boolean }) {
  const full = item.spotsLeft === 0;

  return (
    <Pressable
      style={[styles.card, compact && styles.compact]}
      onPress={() => router.push(`/class/${item.id}`)}>
      <UserAvatar size={72} kind="instructor" style={styles.thumb} />
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          {full ? <Badge label="Full" variant="warning" /> : null}
        </View>
        <Text style={styles.meta}>{item.discipline} · {formatClassDate(item.startAt)}</Text>
        <View style={styles.footer}>
          <Text style={styles.instructor}>{item.instructor.displayName}</Text>
          <Text style={styles.price}>{formatMoney(item.price)}</Text>
        </View>
        <View style={styles.tags}>
          <View style={styles.tag}>
            <Ionicons
              name={item.modality === 'online' ? 'videocam' : 'location'}
              size={12}
              color={FitnexiaColors.gray500}
            />
            <Text style={styles.tagText}>
              {item.modality === 'online' ? 'Online' : item.location?.label ?? 'In person'}
            </Text>
          </View>
          {item.spotsLeft != null && !full ? (
            <Text style={styles.spots}>{item.spotsLeft} spots left</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  compact: { marginBottom: Spacing.sm },
  thumb: {},
  body: { flex: 1, marginLeft: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: FitnexiaColors.gray900 },
  meta: { fontSize: 13, color: FitnexiaColors.gray500, marginTop: 4 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  instructor: { fontSize: 13, color: FitnexiaColors.gray700, fontWeight: '500' },
  price: { fontSize: 15, fontWeight: '700', color: FitnexiaColors.primary },
  tags: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.md },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tagText: { fontSize: 12, color: FitnexiaColors.gray500 },
  spots: { fontSize: 12, color: FitnexiaColors.primary, fontWeight: '500' },
});

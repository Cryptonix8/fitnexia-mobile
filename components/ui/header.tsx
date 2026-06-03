import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FitnexiaColors, Spacing } from '@/constants/fitnexia';

export function Header({
  title,
  subtitle,
  showBack,
  right,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      {showBack ? (
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={FitnexiaColors.gray900} />
        </Pressable>
      ) : (
        <View style={styles.backPlaceholder} />
      )}
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>{right ?? <View style={styles.backPlaceholder} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    minHeight: 44,
  },
  back: { width: 40 },
  backPlaceholder: { width: 40 },
  center: { flex: 1, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: FitnexiaColors.gray900 },
  subtitle: { fontSize: 13, color: FitnexiaColors.gray500, marginTop: 2 },
  right: { width: 40, alignItems: 'flex-end' },
});

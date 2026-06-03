import { StyleSheet, Text, View } from 'react-native';

import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';

type BadgeVariant = 'default' | 'success' | 'warning' | 'verified';

export function Badge({
  label,
  variant = 'default',
}: {
  label: string;
  variant?: BadgeVariant;
}) {
  return (
    <View style={[styles.badge, styles[variant]]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  default: { backgroundColor: FitnexiaColors.gray100 },
  success: { backgroundColor: '#DCFCE7' },
  warning: { backgroundColor: '#FEF9C3' },
  verified: { backgroundColor: FitnexiaColors.primaryLight },
  text: { fontSize: 11, fontWeight: '600' },
  text_default: { color: FitnexiaColors.gray700 },
  text_success: { color: '#166534' },
  text_warning: { color: '#854D0E' },
  text_verified: { color: FitnexiaColors.primaryDark },
});

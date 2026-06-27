import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/fitnexia';
import { VERIFICATION_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';
import type { ProfileVerificationStatus } from '@/services/api/verification.api';

type VerificationBannerProps = {
  verificationStatus: ProfileVerificationStatus;
  profileRoute: string;
};

export function VerificationBanner({ verificationStatus, profileRoute }: VerificationBannerProps) {
  const { colors } = useAppTheme();

  if (verificationStatus === 'verified') return null;

  const isPending = verificationStatus === 'pending';
  const isRejected = verificationStatus === 'rejected';

  return (
    <Pressable
      onPress={() => router.push(profileRoute as never)}
      style={[
        styles.banner,
        {
          backgroundColor: isPending ? colors.warningMuted : colors.primaryMuted,
          borderColor: isPending ? colors.warning : colors.primary,
        },
      ]}>
      <Ionicons
        name={isPending ? 'time-outline' : isRejected ? 'alert-circle-outline' : 'shield-checkmark-outline'}
        size={22}
        color={isPending ? colors.warning : colors.primary}
      />
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.text }]}>
          {isPending
            ? VERIFICATION_LABELS.pendingTitle
            : isRejected
              ? VERIFICATION_LABELS.rejectedTitle
              : VERIFICATION_LABELS.bannerTitle}
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          {isPending
            ? VERIFICATION_LABELS.pendingBody
            : isRejected
              ? VERIFICATION_LABELS.rejectedBody
              : VERIFICATION_LABELS.bannerBody}
        </Text>
      </View>
      {!isPending ? (
        <Text style={[styles.cta, { color: colors.primary }]}>{VERIFICATION_LABELS.cta}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  body: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700' },
  sub: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  cta: { fontSize: 13, fontWeight: '700', alignSelf: 'center' },
});

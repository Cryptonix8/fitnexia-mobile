import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/ui/header';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Badge } from '@/components/ui/badge';
import { Radius, Spacing } from '@/constants/fitnexia';
import { BADGE_LABELS, VERIFICATION_LABELS } from '@/constants/labels';
import { getErrorMessage, useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import {
  fetchVerificationStatusApi,
  submitVerificationApi,
  type ProfileVerificationStatus,
} from '@/services/api/verification.api';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

type DocKey = 'dniFront' | 'dniBack' | 'certification';

type DocState = Record<DocKey, string | null>;

const EMPTY: DocState = { dniFront: null, dniBack: null, certification: null };

function statusBadge(status: ProfileVerificationStatus) {
  if (status === 'verified') return { label: BADGE_LABELS.verified, variant: 'verified' as const };
  if (status === 'pending') return { label: VERIFICATION_LABELS.pendingBadge, variant: 'warning' as const };
  if (status === 'rejected') return { label: VERIFICATION_LABELS.rejectedBadge, variant: 'default' as const };
  return null;
}

export function VerifyProfileScreen() {
  const { user, refreshUser } = useAuth();
  const { colors } = useAppTheme();
  const profileStatus =
    user?.role === 'instructor'
      ? user.instructorProfile?.verificationStatus
      : user?.role === 'institution'
        ? user.institutionProfile?.verificationStatus
        : 'unverified';

  const [status, setStatus] = useState<ProfileVerificationStatus>(profileStatus ?? 'unverified');
  const [rejectionReason, setRejectionReason] = useState<string | undefined>();
  const [docs, setDocs] = useState<DocState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchVerificationStatusApi();
      setStatus(res.verificationStatus);
      setRejectionReason(res.latestRequest?.rejectionReason);
    } catch {
      setStatus(profileStatus ?? 'unverified');
    } finally {
      setLoading(false);
    }
  }, [profileStatus]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const pickImage = async (key: DocKey) => {
    const { status: perm } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm !== 'granted') {
      Alert.alert('Permiso necesario', 'Permití acceso a la galería para subir documentos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setDocs((s) => ({ ...s, [key]: result.assets[0].uri }));
    }
  };

  const pickCertification = async () => {
    Alert.alert(VERIFICATION_LABELS.certification, undefined, [
      { text: 'Foto', onPress: () => void pickImage('certification') },
      {
        text: 'PDF',
        onPress: async () => {
          const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'image/*'],
            copyToCacheDirectory: true,
          });
          if (!result.canceled && result.assets[0]) {
            setDocs((s) => ({ ...s, certification: result.assets[0].uri }));
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const submit = async () => {
    if (!docs.dniFront || !docs.dniBack || !docs.certification) {
      Alert.alert(VERIFICATION_LABELS.missingDocs);
      return;
    }
    setSubmitting(true);
    try {
      await submitVerificationApi(docs);
      await refreshUser();
      await load();
      setDocs(EMPTY);
      Alert.alert(VERIFICATION_LABELS.submittedTitle, VERIFICATION_LABELS.submittedBody);
    } catch (err) {
      Alert.alert('No se pudo enviar', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const badge = statusBadge(status);
  const canSubmit = status === 'unverified' || status === 'rejected';

  return (
    <Screen scroll loading={loading} loadingMessage="Cargando…" header={<Header title={VERIFICATION_LABELS.screenTitle} showBack />}>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.text }]}>{VERIFICATION_LABELS.screenIntro}</Text>
        {badge ? <Badge label={badge.label} variant={badge.variant} /> : null}
        {status === 'pending' ? (
          <Text style={[styles.hint, { color: colors.textMuted }]}>{VERIFICATION_LABELS.pendingBody}</Text>
        ) : null}
        {status === 'rejected' && rejectionReason ? (
          <Text style={[styles.reason, { color: colors.textSecondary }]}>
            {VERIFICATION_LABELS.lastReason}: {rejectionReason}
          </Text>
        ) : null}
      </View>

      {canSubmit ? (
        <>
          <DocSlot
            label={VERIFICATION_LABELS.dniFront}
            uri={docs.dniFront}
            onPick={() => void pickImage('dniFront')}
            colors={colors}
          />
          <DocSlot
            label={VERIFICATION_LABELS.dniBack}
            uri={docs.dniBack}
            onPick={() => void pickImage('dniBack')}
            colors={colors}
          />
          <DocSlot
            label={VERIFICATION_LABELS.certification}
            uri={docs.certification}
            onPick={() => void pickCertification()}
            colors={colors}
          />
          <Button
            title={VERIFICATION_LABELS.submit}
            onPress={() => void submit()}
            disabled={submitting}
            style={{ marginTop: Spacing.md }}
          />
        </>
      ) : null}
    </Screen>
  );
}

function DocSlot({
  label,
  uri,
  onPick,
  colors,
}: {
  label: string;
  uri: string | null;
  onPick: () => void;
  colors: { surface: string; border: string; text: string; primary: string; textMuted: string };
}) {
  const isPdf = uri?.toLowerCase().includes('.pdf');
  return (
    <View style={[styles.docSlot, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Text style={[styles.docLabel, { color: colors.text }]}>{label}</Text>
      {uri && !isPdf ? <Image source={{ uri }} style={styles.preview} /> : null}
      {uri && isPdf ? (
        <Text style={{ color: colors.textMuted, marginBottom: Spacing.sm }}>PDF seleccionado</Text>
      ) : null}
      <Pressable onPress={onPick}>
        <Text style={{ color: colors.primary, fontWeight: '600' }}>
          {uri ? VERIFICATION_LABELS.changeDoc : VERIFICATION_LABELS.uploadDoc}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  heading: { fontSize: 15, lineHeight: 22 },
  hint: { fontSize: 13, lineHeight: 20 },
  reason: { fontSize: 13, lineHeight: 20, marginTop: Spacing.xs },
  docSlot: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  docLabel: { fontSize: 14, fontWeight: '700', marginBottom: Spacing.sm },
  preview: { width: '100%', height: 140, borderRadius: Radius.sm, marginBottom: Spacing.sm },
});

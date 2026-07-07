import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/fitnexia';
import { BADGE_LABELS, VERIFICATION_LABELS } from '@/constants/labels';
import { getErrorMessage, useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import {
  fetchVerificationStatusApi,
  submitVerificationApi,
  type ProfileVerificationStatus,
} from '@/services/api/verification.api';
import { subscribeAppRefresh } from '@/services/app-refresh';

type DocKey = 'dniFront' | 'dniBack' | 'certification';

type DocState = Record<DocKey, string | null>;

const EMPTY: DocState = { dniFront: null, dniBack: null, certification: null };

const ID_DOC_STEPS: {
  key: Extract<DocKey, 'dniFront' | 'dniBack'>;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'dniFront', label: 'Frente', icon: 'card-outline' },
  { key: 'dniBack', label: 'Dorso', icon: 'card-outline' },
];

const CERT_STEP = {
  key: 'certification' as const,
  label: VERIFICATION_LABELS.certification,
  hint: 'Imagen o PDF de tu título o certificación',
  icon: 'ribbon-outline' as const,
};

const DOC_STEPS = [...ID_DOC_STEPS, CERT_STEP];

function statusBadge(status: ProfileVerificationStatus) {
  if (status === 'verified') return { label: BADGE_LABELS.verified, variant: 'verified' as const };
  if (status === 'pending') return { label: VERIFICATION_LABELS.pendingBadge, variant: 'warning' as const };
  if (status === 'rejected') return { label: VERIFICATION_LABELS.rejectedBadge, variant: 'default' as const };
  return null;
}

function statusIcon(status: ProfileVerificationStatus): keyof typeof Ionicons.glyphMap {
  if (status === 'verified') return 'shield-checkmark';
  if (status === 'pending') return 'time';
  if (status === 'rejected') return 'close-circle';
  return 'shield-outline';
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

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const res = await fetchVerificationStatusApi();
      setStatus(res.verificationStatus);
      setRejectionReason(res.latestRequest?.rejectionReason);
    } catch {
      setStatus(profileStatus ?? 'unverified');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [profileStatus]);

  useEffect(() => {
    if (profileStatus) {
      setStatus(profileStatus);
    }
  }, [profileStatus]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  useEffect(() => subscribeAppRefresh(() => load(true)), [load]);

  const uploadedCount = useMemo(
    () => DOC_STEPS.filter((step) => docs[step.key]).length,
    [docs],
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

  const pickDoc = (key: DocKey) => {
    if (key === 'certification') {
      void pickCertification();
      return;
    }
    void pickImage(key);
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
  const allDocsReady = uploadedCount === DOC_STEPS.length;
  const progressPct = (uploadedCount / DOC_STEPS.length) * 100;

  return (
    <Screen
      scroll
      loading={loading}
      loadingMessage="Cargando…"
      header={<Header title={VERIFICATION_LABELS.screenTitle} showBack />}>
      <View style={[styles.hero, { backgroundColor: colors.primaryMuted }]}>
        <View style={[styles.heroIconWrap, { backgroundColor: colors.surface }]}>
          <Ionicons name={statusIcon(status)} size={28} color={colors.primary} />
        </View>
        <View style={styles.heroText}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Insignia Fitnexia</Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
            {VERIFICATION_LABELS.screenIntro}
          </Text>
        </View>
        {badge ? <Badge label={badge.label} variant={badge.variant} /> : null}
      </View>

      {status === 'pending' ? (
        <View style={[styles.statusCard, { backgroundColor: colors.warningMuted, borderColor: colors.warning }]}>
          <Ionicons name="time-outline" size={22} color={colors.warning} />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {VERIFICATION_LABELS.pendingBody}
          </Text>
        </View>
      ) : null}

      {status === 'rejected' && rejectionReason ? (
        <View style={[styles.statusCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
          <Ionicons name="alert-circle-outline" size={22} color={colors.error} />
          <View style={styles.statusBody}>
            <Text style={[styles.statusTitle, { color: colors.text }]}>{VERIFICATION_LABELS.lastReason}</Text>
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>{rejectionReason}</Text>
          </View>
        </View>
      ) : null}

      {canSubmit ? (
        <>
          <View style={styles.progressHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Documentos requeridos</Text>
            <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
              {uploadedCount} de {DOC_STEPS.length} listos
            </Text>
          </View>

          <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPct}%`, backgroundColor: allDocsReady ? colors.success : colors.primary },
              ]}
            />
          </View>

          <Text style={[styles.idSectionTitle, { color: colors.text }]}>Documento de identidad</Text>
          <View style={styles.idRow}>
            {ID_DOC_STEPS.map((step, index) => (
              <DocSlot
                key={step.key}
                compact
                step={index + 1}
                label={step.label}
                icon={step.icon}
                uri={docs[step.key]}
                onPick={() => pickDoc(step.key)}
                colors={colors}
              />
            ))}
          </View>

          <DocSlot
            step={3}
            label={CERT_STEP.label}
            hint={CERT_STEP.hint}
            icon={CERT_STEP.icon}
            uri={docs.certification}
            onPick={() => pickDoc('certification')}
            colors={colors}
          />

          <View style={[styles.privacyRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.privacyText, { color: colors.textMuted }]}>
              Tus documentos son privados y solo los revisa el equipo Fitnexia.
            </Text>
          </View>

          <Button
            title={VERIFICATION_LABELS.submit}
            onPress={() => void submit()}
            disabled={submitting || !allDocsReady}
            style={styles.submitBtn}
          />
          {!allDocsReady ? (
            <Text style={[styles.submitHint, { color: colors.textMuted }]}>
              Subí los tres documentos para habilitar el envío.
            </Text>
          ) : null}
        </>
      ) : null}

      <LoadingOverlay visible={submitting} message={VERIFICATION_LABELS.submittingOverlay} />
    </Screen>
  );
}

function DocSlot({
  step,
  label,
  hint,
  icon,
  uri,
  onPick,
  colors,
  compact = false,
}: {
  step: number;
  label: string;
  hint?: string;
  icon: keyof typeof Ionicons.glyphMap;
  uri: string | null;
  onPick: () => void;
  compact?: boolean;
  colors: {
    surface: string;
    surfaceMuted: string;
    border: string;
    text: string;
    primary: string;
    primaryMuted: string;
    textMuted: string;
    success: string;
    successMuted: string;
    shadow: string;
  };
}) {
  const isPdf = uri?.toLowerCase().includes('.pdf');
  const isComplete = Boolean(uri);

  return (
    <View
      style={[
        styles.docCard,
        compact && styles.docCardCompact,
        cardShadow(colors.shadow),
        {
          backgroundColor: colors.surface,
          borderColor: isComplete ? colors.success : colors.border,
        },
      ]}>
      <View style={[styles.docHeader, compact && styles.docHeaderCompact]}>
        <View
          style={[
            styles.stepBadge,
            compact && styles.stepBadgeCompact,
            {
              backgroundColor: isComplete ? colors.successMuted : colors.primaryMuted,
            },
          ]}>
          {isComplete ? (
            <Ionicons name="checkmark" size={compact ? 14 : 16} color={colors.success} />
          ) : (
            <Text style={[styles.stepNum, { color: colors.primary }]}>{step}</Text>
          )}
        </View>
        <View style={styles.docHeaderText}>
          <Text
            style={[styles.docLabel, compact && styles.docLabelCompact, { color: colors.text }]}
            numberOfLines={compact ? 1 : 2}>
            {label}
          </Text>
          {!compact && hint ? (
            <Text style={[styles.docHint, { color: colors.textMuted }]}>{hint}</Text>
          ) : null}
        </View>
        {!compact ? <Ionicons name={icon} size={22} color={colors.textMuted} /> : null}
      </View>

      <Pressable
        onPress={onPick}
        style={({ pressed }) => [
          styles.uploadZone,
          compact && styles.uploadZoneCompact,
          {
            borderColor: isComplete ? colors.success : colors.border,
            backgroundColor: isComplete ? colors.successMuted : colors.surfaceMuted,
          },
          pressed && styles.uploadPressed,
        ]}>
        {uri && !isPdf ? (
          <View style={[styles.previewWrap, compact && styles.previewWrapCompact]}>
            <Image source={{ uri }} style={styles.preview} contentFit="cover" />
            <View style={[styles.previewOverlay, { backgroundColor: 'rgba(15, 23, 42, 0.35)' }]}>
              <Ionicons name="camera-outline" size={compact ? 18 : 22} color="#FFFFFF" />
              {!compact ? (
                <Text style={styles.previewAction}>{VERIFICATION_LABELS.changeDoc}</Text>
              ) : null}
            </View>
          </View>
        ) : uri && isPdf ? (
          <View style={[styles.pdfWrap, compact && styles.pdfWrapCompact]}>
            <View style={[styles.pdfIcon, compact && styles.pdfIconCompact, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name="document-text-outline" size={compact ? 22 : 28} color={colors.primary} />
            </View>
            {!compact ? (
              <>
                <Text style={[styles.pdfLabel, { color: colors.text }]}>PDF seleccionado</Text>
                <Text style={[styles.uploadLink, { color: colors.primary }]}>{VERIFICATION_LABELS.changeDoc}</Text>
              </>
            ) : (
              <Text style={[styles.uploadLink, { color: colors.primary }]}>PDF</Text>
            )}
          </View>
        ) : (
          <View style={[styles.emptyUpload, compact && styles.emptyUploadCompact]}>
            <View style={[styles.uploadIconCircle, compact && styles.uploadIconCircleCompact, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name="cloud-upload-outline" size={compact ? 20 : 26} color={colors.primary} />
            </View>
            <Text style={[styles.uploadTitle, compact && styles.uploadTitleCompact, { color: colors.text }]}>
              {VERIFICATION_LABELS.uploadDoc}
            </Text>
            {!compact ? (
              <Text style={[styles.uploadSub, { color: colors.textMuted }]}>Tocá para elegir desde tu dispositivo</Text>
            ) : null}
          </View>
        )}
      </Pressable>
    </View>
  );
}

function cardShadow(shadowColor: string) {
  return Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {},
  });
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { gap: Spacing.xs },
  heroTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  heroSub: { fontSize: 14, lineHeight: 21 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statusBody: { flex: 1, gap: 2 },
  statusTitle: { fontSize: 14, fontWeight: '700' },
  statusText: { flex: 1, fontSize: 13, lineHeight: 20 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  progressLabel: { fontSize: 13, fontWeight: '600' },
  progressTrack: {
    height: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  idSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  idRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  docCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  docCardCompact: {
    flex: 1,
    marginBottom: 0,
    padding: Spacing.sm,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  docHeaderCompact: {
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeCompact: {
    width: 24,
    height: 24,
  },
  stepNum: { fontSize: 13, fontWeight: '800' },
  docHeaderText: { flex: 1, gap: 2 },
  docLabel: { fontSize: 15, fontWeight: '700' },
  docLabelCompact: { fontSize: 13 },
  docHint: { fontSize: 12, lineHeight: 17 },
  uploadZone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    overflow: 'hidden',
    minHeight: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadZoneCompact: {
    minHeight: 108,
  },
  uploadPressed: { opacity: 0.92 },
  emptyUpload: {
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  emptyUploadCompact: {
    padding: Spacing.sm,
  },
  uploadIconCircle: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  uploadIconCircleCompact: {
    width: 40,
    height: 40,
    marginBottom: 0,
  },
  uploadTitle: { fontSize: 15, fontWeight: '700' },
  uploadTitleCompact: { fontSize: 12, textAlign: 'center' },
  uploadSub: { fontSize: 13, textAlign: 'center' },
  previewWrap: { width: '100%', height: 160, position: 'relative' },
  previewWrapCompact: { height: 108 },
  preview: { width: '100%', height: '100%' },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  previewAction: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  pdfWrap: {
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  pdfWrapCompact: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  pdfIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfIconCompact: {
    width: 40,
    height: 40,
  },
  pdfLabel: { fontSize: 15, fontWeight: '600' },
  uploadLink: { fontSize: 14, fontWeight: '700' },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  privacyText: { flex: 1, fontSize: 13, lineHeight: 19 },
  submitBtn: { marginTop: Spacing.xs },
  submitHint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
});

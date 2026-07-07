import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAuth, getErrorMessage } from '@/contexts/auth-context';
import { useReviews } from '@/contexts/reviews-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import { fetchStaffReviewEligibility } from '@/services/api/institutions.api';
import { fetchInstructorById } from '@/services/api/instructors.api';
import type { Instructor } from '@/types/api';
import { resolveInstitutionId } from '@/utils/gym-classes';
import { APP_LOCALE } from '@/utils/locale';

export default function GymReviewInstructorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const { addStaffReview } = useReviews();
  const institutionId = resolveInstitutionId(user);
  const profile = user?.institutionProfile;

  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eligibility, setEligibility] = useState<Awaited<
    ReturnType<typeof fetchStaffReviewEligibility>
  > | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchInstructorById(id), fetchStaffReviewEligibility(id)])
      .then(([instructorData, eligibilityData]) => {
        setInstructor(instructorData);
        setEligibility(eligibilityData);
      })
      .catch(() => {
        setInstructor(null);
        setEligibility(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (!instructor || !eligibility) {
    return (
      <Screen loading={loading} loadingMessage={LOADING_LABELS.instructor}>
        <Header title="Reseñar instructor" showBack />
        {!loading ? (
          <Text style={{ color: colors.text }}>Instructor no encontrado</Text>
        ) : null}
      </Screen>
    );
  }

  if (!eligibility.linked) {
    return (
      <Screen>
        <Header title="Reseñar instructor" showBack />
        <Text style={[styles.message, { color: colors.textMuted }]}>
          Solo podés reseñar instructores vinculados al equipo de tu gimnasio.
        </Text>
        <Button
          title="Ir a Equipo"
          variant="outline"
          onPress={() => router.push('/(gym)/(tabs)/instructors')}
          style={{ marginTop: Spacing.md }}
        />
      </Screen>
    );
  }

  if (eligibility.existingReview) {
    const existing = eligibility.existingReview;
    return (
      <Screen scroll header={<Header title="Tu reseña" showBack />}>
        <View style={styles.hero}>
          <UserAvatar size={72} kind="instructor" uri={instructor.photoUrl} />
          <Text style={[styles.name, { color: colors.text }]}>{instructor.displayName}</Text>
          <Badge label="Reseña verificada del gimnasio" variant="verified" />
        </View>
        <View style={[styles.existingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Ionicons
                key={n}
                name={n <= existing.rating ? 'star' : 'star-outline'}
                size={28}
                color={colors.warning}
              />
            ))}
          </View>
          {existing.comment ? (
            <Text style={[styles.existingComment, { color: colors.textSecondary }]}>
              {existing.comment}
            </Text>
          ) : null}
          <Text style={[styles.existingMeta, { color: colors.textMuted }]}>
            Publicada {new Date(existing.createdAt).toLocaleDateString(APP_LOCALE)} · No se puede editar
          </Text>
        </View>
      </Screen>
    );
  }

  if (!eligibility.hasCompletedClass) {
    return (
      <Screen>
        <Header title="Reseñar instructor" showBack />
        <View style={styles.hero}>
          <UserAvatar size={72} kind="instructor" uri={instructor.photoUrl} />
          <Text style={[styles.name, { color: colors.text }]}>{instructor.displayName}</Text>
        </View>
        <Text style={[styles.message, { color: colors.textMuted }]}>
          Podés dejar una reseña después de que el instructor haya dictado al menos una clase en tu
          gimnasio.
        </Text>
        <Button
          title="Volver a Equipo"
          variant="outline"
          onPress={() => router.back()}
          style={{ marginTop: Spacing.md }}
        />
      </Screen>
    );
  }

  const submit = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Calificación requerida', 'Seleccioná una calificación de 1 a 5 estrellas.');
      return;
    }

    setSubmitting(true);
    try {
      await addStaffReview({
        instructorId: instructor.id,
        institutionId,
        institutionName: profile?.name ?? 'Gimnasio',
        rating,
        comment: comment.trim() || undefined,
      });
      Alert.alert(
        'Reseña publicada',
        `Tu reseña verificada de ${instructor.displayName} ya es visible en su perfil.`,
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (err) {
      Alert.alert('No se pudo publicar', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll header={<Header title="Reseñar instructor" showBack />}>

      <View style={styles.hero}>
        <UserAvatar size={72} kind="instructor" uri={instructor.photoUrl} />
        <Text style={[styles.name, { color: colors.text }]}>{instructor.displayName}</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Reseña verificada de {profile?.name ?? 'tu gimnasio'}. Una reseña por instructor; no se
          puede editar después de publicar.
        </Text>
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Calificación</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setRating(n)}>
            <Ionicons
              name={n <= rating ? 'star' : 'star-outline'}
              size={40}
              color={colors.warning}
            />
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Comentario (opcional)</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.input,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        multiline
        placeholder="Profesionalismo, confiabilidad, feedback de atletas..."
        placeholderTextColor={colors.textMuted}
        value={comment}
        onChangeText={setComment}
      />

      <Button title="Enviar reseña verificada" onPress={submit} disabled={submitting || rating < 1} />

      <LoadingOverlay visible={submitting} message="Enviando reseña…" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: Spacing.lg },
  name: { fontSize: 22, fontWeight: '800', marginTop: Spacing.md, marginBottom: Spacing.sm },
  hint: { fontSize: 14, lineHeight: 20, textAlign: 'center', paddingHorizontal: Spacing.md },
  message: { fontSize: 15, lineHeight: 22 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: Spacing.sm },
  stars: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  input: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  existingCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  existingComment: { fontSize: 15, lineHeight: 22, marginTop: Spacing.md },
  existingMeta: { fontSize: 12, marginTop: Spacing.md },
});

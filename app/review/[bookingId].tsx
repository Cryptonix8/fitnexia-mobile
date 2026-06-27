import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import { fetchClassById } from '@/services/api/classes.api';
import {
  fetchBookingById,
  fetchReviewEligibilityApi,
  submitReviewApi,
} from '@/services/api/bookings.api';
import { getErrorMessage } from '@/services/api/errors';
import type { Booking, ClassListItem } from '@/types/api';

export default function ReviewScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [cls, setCls] = useState<ClassListItem | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    let cancelled = false;

    (async () => {
      setChecking(true);
      setLoadError(null);
      try {
        const [bookingResult, eligibilityResult] = await Promise.all([
          fetchBookingById(bookingId),
          fetchReviewEligibilityApi(bookingId),
        ]);
        if (cancelled) return;

        setBooking(bookingResult);
        setEligible(eligibilityResult.eligible);
        setAlreadyReviewed(eligibilityResult.alreadyReviewed);

        if (bookingResult.class) {
          setCls(bookingResult.class);
        } else {
          const classResult = await fetchClassById(bookingResult.classId);
          if (!cancelled) setCls(classResult);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  if (checking) {
    return (
      <Screen loading loadingMessage={LOADING_LABELS.review}>
        <Header title="Dejar una reseña" showBack />
      </Screen>
    );
  }

  if (loadError || !booking || !cls) {
    return (
      <Screen>
        <Header title="Reseña" showBack />
        <Text>{loadError || 'Reserva no encontrada'}</Text>
      </Screen>
    );
  }

  if (alreadyReviewed) {
    return (
      <Screen>
        <Header title="Dejar una reseña" showBack />
        <Text style={styles.className}>{cls.title}</Text>
        <Text style={styles.hint}>Ya publicaste una reseña para esta clase. Las reseñas no se pueden editar.</Text>
      </Screen>
    );
  }

  if (!eligible) {
    return (
      <Screen>
        <Header title="Dejar una reseña" showBack />
        <Text style={styles.className}>{cls.title}</Text>
        <Text style={styles.hint}>
          Solo podés reseñar clases completadas. Esta reserva todavía no es elegible.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen scroll header={<Header title="Dejar una reseña" showBack />}>
      <Text style={styles.className}>{cls.title}</Text>
      <Text style={styles.hint}>Solo los asistentes verificados pueden reseñar. Las reseñas no se pueden editar.</Text>

      <Text style={styles.label}>Calificación</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setRating(n)}>
            <Ionicons
              name={n <= rating ? 'star' : 'star-outline'}
              size={40}
              color={FitnexiaColors.warning}
            />
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Comentario (opcional)</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Contanos tu experiencia..."
        placeholderTextColor={FitnexiaColors.gray400}
        value={comment}
        onChangeText={setComment}
      />

      <Button
        title="Enviar reseña"
        disabled={loading}
        onPress={async () => {
          setLoading(true);
          try {
            await submitReviewApi(booking.id, rating, comment.trim() || undefined);
            Alert.alert('¡Gracias!', 'Tu reseña fue publicada.', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          } catch (err) {
            Alert.alert('Error al enviar reseña', getErrorMessage(err));
          } finally {
            setLoading(false);
          }
        }}
      />

      <LoadingOverlay visible={loading} message="Enviando reseña…" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  className: { fontSize: 20, fontWeight: '700', color: FitnexiaColors.gray900 },
  hint: { fontSize: 13, color: FitnexiaColors.gray500, marginVertical: Spacing.md },
  label: { fontSize: 16, fontWeight: '600', marginBottom: Spacing.sm },
  stars: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  input: {
    backgroundColor: FitnexiaColors.white,
    borderRadius: 12,
    padding: Spacing.md,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: FitnexiaColors.gray200,
  },
});

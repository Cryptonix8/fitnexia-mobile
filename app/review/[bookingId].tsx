import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useBookings } from '@/contexts/bookings-context';
import { useClasses } from '@/contexts/classes-context';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';
import { fetchReviewEligibilityApi, submitReviewApi } from '@/services/api/bookings.api';
import { getErrorMessage } from '@/services/api/errors';

export default function ReviewScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { getClassById } = useClasses();
  const { bookings } = useBookings();
  const booking = useMemo(
    () => bookings.find((b) => b.id === bookingId),
    [bookings, bookingId],
  );
  const cls = booking ? getClassById(booking.classId) : undefined;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    let cancelled = false;
    (async () => {
      setChecking(true);
      try {
        const result = await fetchReviewEligibilityApi(bookingId);
        if (!cancelled) {
          setEligible(result.eligible);
          setAlreadyReviewed(result.alreadyReviewed);
        }
      } catch (err) {
        if (!cancelled) {
          Alert.alert('No se pudo verificar la reseña', getErrorMessage(err));
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  if (!booking || !cls) {
    return (
      <Screen>
        <Header title="Reseña" showBack />
        <Text>Reserva no encontrada</Text>
      </Screen>
    );
  }

  if (checking) {
    return (
      <Screen>
        <Header title="Dejar una reseña" showBack />
        <LoadingOverlay visible message="Verificando elegibilidad…" />
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
    <Screen scroll>
      <Header title="Dejar una reseña" showBack />
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

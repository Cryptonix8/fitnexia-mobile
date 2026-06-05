import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useBookings } from '@/contexts/bookings-context';
import { useClasses } from '@/contexts/classes-context';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';
import { submitReviewApi } from '@/services/api/bookings.api';
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

  if (!booking || !cls) {
    return (
      <Screen>
        <Header title="Review" showBack />
        <Text>Booking not found</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header title="Leave a review" showBack />
      <Text style={styles.className}>{cls.title}</Text>
      <Text style={styles.hint}>Only verified attendees can review. Reviews cannot be edited.</Text>

      <Text style={styles.label}>Rating</Text>
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

      <Text style={styles.label}>Comment (optional)</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Share your experience..."
        placeholderTextColor={FitnexiaColors.gray400}
        value={comment}
        onChangeText={setComment}
      />

      <Button
        title="Submit review"
        loading={loading}
        onPress={async () => {
          setLoading(true);
          try {
            await submitReviewApi(booking.id, rating, comment.trim() || undefined);
            Alert.alert('Thank you!', 'Your review has been published.', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          } catch (err) {
            Alert.alert('Review failed', getErrorMessage(err));
          } finally {
            setLoading(false);
          }
        }}
      />
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

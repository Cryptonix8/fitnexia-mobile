import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useReviews } from '@/contexts/reviews-context';
import { useAppTheme } from '@/contexts/theme-context';
import { getInstructorById } from '@/data/mock';
import { Radius, Spacing } from '@/constants/fitnexia';
import { resolveInstitutionId } from '@/utils/gym-classes';

export default function GymReviewInstructorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const { canGymReviewInstructor, getGymReviewForInstructor, addStaffReview } = useReviews();
  const instructor = getInstructorById(id ?? '');
  const profile = user?.institutionProfile;
  const institutionId = resolveInstitutionId(user);
  const linkedIds = profile?.instructorIds ?? [];

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const existing = getGymReviewForInstructor(institutionId, id ?? '');
  const canReview =
    instructor &&
    canGymReviewInstructor(institutionId, instructor.id, linkedIds);

  if (!instructor) {
    return (
      <Screen>
        <Header title="Review instructor" showBack />
        <Text style={{ color: colors.text }}>Instructor not found</Text>
      </Screen>
    );
  }

  if (!linkedIds.includes(instructor.id)) {
    return (
      <Screen>
        <Header title="Review instructor" showBack />
        <Text style={[styles.message, { color: colors.textMuted }]}>
          You can only review instructors linked to your gym staff.
        </Text>
        <Button
          title="Manage staff"
          variant="outline"
          onPress={() => router.push('/(gym)/profile/instructors')}
          style={{ marginTop: Spacing.md }}
        />
      </Screen>
    );
  }

  if (existing) {
    return (
      <Screen scroll>
        <Header title="Your review" showBack />
        <View style={styles.hero}>
          <UserAvatar size={72} kind="instructor" />
          <Text style={[styles.name, { color: colors.text }]}>{instructor.displayName}</Text>
          <Badge label="Verified gym review" variant="verified" />
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
            Published {new Date(existing.createdAt).toLocaleDateString()} · Cannot be edited
          </Text>
        </View>
      </Screen>
    );
  }

  if (!canReview) {
    return (
      <Screen>
        <Header title="Review instructor" showBack />
        <Text style={{ color: colors.text }}>Unable to submit a review.</Text>
      </Screen>
    );
  }

  const submit = () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Rating required', 'Select a star rating from 1 to 5.');
      return;
    }

    addStaffReview({
      instructorId: instructor.id,
      institutionId,
      institutionName: profile?.name ?? 'Gym',
      rating,
      comment: comment.trim() || undefined,
    });

    Alert.alert(
      'Review published',
      `Your verified review of ${instructor.displayName} is now visible on their profile.`,
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  return (
    <Screen scroll>
      <Header title="Review instructor" showBack />

      <View style={styles.hero}>
        <UserAvatar size={72} kind="instructor" />
        <Text style={[styles.name, { color: colors.text }]}>{instructor.displayName}</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Verified review from {profile?.name ?? 'your gym'}. One review per instructor; cannot
          be edited after publishing.
        </Text>
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Rating</Text>
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

      <Text style={[styles.label, { color: colors.text }]}>Comment (optional)</Text>
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
        placeholder="Professionalism, reliability, athlete feedback..."
        placeholderTextColor={colors.textMuted}
        value={comment}
        onChangeText={setComment}
      />

      <Button title="Submit verified review" onPress={submit} />
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

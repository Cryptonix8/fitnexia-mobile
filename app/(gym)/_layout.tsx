import { Stack } from 'expo-router';

export default function GymLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="profile/gallery" />
      <Stack.Screen name="profile/instructors" />
      <Stack.Screen name="profile/notifications" />
      <Stack.Screen name="profile/payment-methods" />
      <Stack.Screen name="profile/support" />
      <Stack.Screen name="profile/plan" />
      <Stack.Screen name="review-instructor/[id]" />
      <Stack.Screen name="membership/plans" />
      <Stack.Screen name="membership/invites" />
    </Stack>
  );
}

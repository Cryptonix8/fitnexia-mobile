import { Stack } from 'expo-router';

export default function InstructorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="profile/notifications" />
      <Stack.Screen name="profile/payment-methods" />
      <Stack.Screen name="profile/support" />
      <Stack.Screen name="profile/plan" />
    </Stack>
  );
}

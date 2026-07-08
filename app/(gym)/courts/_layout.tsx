import { Stack } from 'expo-router';

export default function GymCourtsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="edit/[id]" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="pricing" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="reservations" />
    </Stack>
  );
}

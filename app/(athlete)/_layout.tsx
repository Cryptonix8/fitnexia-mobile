import { Stack } from 'expo-router';

export default function AthleteLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="profile/favorite-sports" />
      <Stack.Screen name="profile/notifications" />
      <Stack.Screen name="profile/payment-methods" />
      <Stack.Screen name="profile/support" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="courts/reservations" />
      <Stack.Screen name="courts/recurring-shifts" />
    </Stack>
  );
}

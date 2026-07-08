import { Stack } from 'expo-router';

export default function CourtsBookingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[institutionId]" />
    </Stack>
  );
}

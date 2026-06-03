import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FitnexiaColors } from '@/constants/fitnexia';

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: FitnexiaColors.primary,
    background: FitnexiaColors.gray50,
    card: FitnexiaColors.white,
    text: FitnexiaColors.gray900,
    border: FitnexiaColors.gray200,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : LightTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(athlete)" />
            <Stack.Screen name="(instructor)" />
            <Stack.Screen name="(gym)" />
            <Stack.Screen name="class/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="instructor/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="book/[classId]" options={{ headerShown: false }} />
            <Stack.Screen name="review/[bookingId]" options={{ headerShown: false }} />
            <Stack.Screen name="create-class" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
          <StatusBar style="dark" />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

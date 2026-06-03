import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider, useAppTheme } from '@/contexts/theme-context';

function RootNavigator() {
  const { isDark, colors } = useAppTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavThemeProvider value={navTheme}>
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
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}


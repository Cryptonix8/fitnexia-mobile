import '@/services/native-bootstrap';
import '@/services/api/setup-network-guard';

import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { InteractionManager, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { usePushNotificationRouting } from '@/hooks/use-push-notification-routing';
import { useFirebaseInAppMessaging } from '@/hooks/use-firebase-in-app-messaging';
import { AppLiveSync } from '@/components/app-live-sync';
import { AppSplash } from '@/components/app-splash';
import { AuthRootGate } from '@/components/auth-root-gate';
import { AuthProvider } from '@/contexts/auth-context';
import { BookingsProvider } from '@/contexts/bookings-context';
import { ClassesProvider } from '@/contexts/classes-context';
import { ReviewsProvider } from '@/contexts/reviews-context';
import { ThemeProvider, useAppTheme } from '@/contexts/theme-context';

SplashScreen.preventAutoHideAsync();

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
      <AuthRootGate />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(athlete)" />
        <Stack.Screen name="(instructor)" />
        <Stack.Screen name="(gym)" />
        <Stack.Screen name="class/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="instructor/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="institution/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="book/[classId]" options={{ headerShown: false }} />
        <Stack.Screen name="booking/complete" options={{ headerShown: false }} />
        <Stack.Screen name="review/[bookingId]" options={{ headerShown: false }} />
        <Stack.Screen name="membership/index" options={{ headerShown: false }} />
        <Stack.Screen name="membership/join" options={{ headerShown: false }} />
        <Stack.Screen name="membership/[memberId]" options={{ headerShown: false }} />
        <Stack.Screen name="membership/complete" options={{ headerShown: false }} />
        <Stack.Screen name="create-class" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="edit-class/[id]" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

/** Keeps splash visible until the router and first screen are ready to paint. */
function AppBootstrap() {
  const { colors } = useAppTheme();
  const navigationState = useRootNavigationState();
  const [showSplash, setShowSplash] = useState(true);
  usePushNotificationRouting();
  useFirebaseInAppMessaging(!showSplash && Boolean(navigationState?.key));

  useEffect(() => {
    if (!showSplash || !navigationState?.key) return;

    let cancelled = false;
    const interaction = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(async () => {
          if (cancelled) return;
          await SplashScreen.hideAsync();
          setShowSplash(false);
        });
      });
    });

    return () => {
      cancelled = true;
      interaction.cancel();
    };
  }, [navigationState?.key, showSplash]);

  useEffect(() => {
    return () => {
      SplashScreen.hideAsync().catch(() => undefined);
    };
  }, []);

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: showSplash ? '#ffffff' : colors.background },
      ]}>
      <RootNavigator />
      {showSplash ? <AppSplash /> : null}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <BookingsProvider>
            <ClassesProvider>
              <ReviewsProvider>
                <AppLiveSync />
                <AppBootstrap />
              </ReviewsProvider>
            </ClassesProvider>
          </BookingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

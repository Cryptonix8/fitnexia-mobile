import { useAppTheme } from '@/contexts/theme-context';

export function useTabBarOptions() {
  const { colors } = useAppTheme();

  return {
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarStyle: {
      backgroundColor: colors.tabBar,
      borderTopColor: colors.tabBarBorder,
    },
  };
}

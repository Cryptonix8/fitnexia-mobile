import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { TAB_LABELS } from '@/constants/labels';
import { useTabBadges } from '@/hooks/use-tab-badges';
import { useTabBarOptions } from '@/hooks/use-tab-bar-options';
import { markTabNotificationsReadApi } from '@/services/api/v2-features.api';
import { requestAppRefresh } from '@/services/app-refresh';

function tabFocusListener(tab: string) {
  return {
    focus: () => {
      void markTabNotificationsReadApi(tab)
        .then(() => requestAppRefresh())
        .catch(() => undefined);
    },
  };
}

export default function AthleteTabs() {
  const tabBarOptions = useTabBarOptions();
  const { badgeFor } = useTabBadges('athlete');

  return (
    <Tabs
      screenOptions={{
        ...tabBarOptions,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: TAB_LABELS.athlete.home,
          tabBarBadge: badgeFor('home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
        listeners={tabFocusListener('home')}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: TAB_LABELS.athlete.search,
          tabBarBadge: badgeFor('search'),
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
        listeners={tabFocusListener('search')}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: TAB_LABELS.athlete.bookings,
          tabBarBadge: badgeFor('bookings'),
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
        listeners={tabFocusListener('bookings')}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: TAB_LABELS.athlete.profile,
          tabBarBadge: badgeFor('profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
        listeners={tabFocusListener('profile')}
      />
    </Tabs>
  );
}

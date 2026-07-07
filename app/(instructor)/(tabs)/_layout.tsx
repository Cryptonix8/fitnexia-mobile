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

export default function InstructorTabs() {
  const tabBarOptions = useTabBarOptions();
  const { badgeFor } = useTabBadges('instructor');

  return (
    <Tabs
      screenOptions={{
        ...tabBarOptions,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: TAB_LABELS.instructor.dashboard,
          tabBarBadge: badgeFor('dashboard'),
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
        }}
        listeners={tabFocusListener('dashboard')}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: TAB_LABELS.instructor.classes,
          tabBarBadge: badgeFor('classes'),
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />,
        }}
        listeners={tabFocusListener('classes')}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: TAB_LABELS.instructor.calendar,
          tabBarBadge: badgeFor('calendar'),
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
        listeners={tabFocusListener('calendar')}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: TAB_LABELS.instructor.earnings,
          tabBarBadge: badgeFor('earnings'),
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet" size={size} color={color} />,
        }}
        listeners={tabFocusListener('earnings')}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: TAB_LABELS.instructor.profile,
          tabBarBadge: badgeFor('profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
        listeners={tabFocusListener('profile')}
      />
    </Tabs>
  );
}

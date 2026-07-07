import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { TAB_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
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

export default function GymTabs() {
  const tabBarOptions = useTabBarOptions();
  const showMetrics = useFeature('analyticsMetrics');
  const showMembers = useFeature('clubMemberships');
  const { badgeFor } = useTabBadges('institution');

  return (
    <Tabs
      screenOptions={{
        ...tabBarOptions,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: TAB_LABELS.gym.dashboard,
          tabBarBadge: badgeFor('dashboard'),
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
        }}
        listeners={tabFocusListener('dashboard')}
      />
      <Tabs.Screen
        name="instructors"
        options={{
          title: TAB_LABELS.gym.staff,
          tabBarBadge: badgeFor('instructors'),
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
        listeners={tabFocusListener('instructors')}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: TAB_LABELS.gym.classes,
          tabBarBadge: badgeFor('classes'),
          tabBarIcon: ({ color, size }) => <Ionicons name="barbell" size={size} color={color} />,
        }}
        listeners={tabFocusListener('classes')}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: TAB_LABELS.gym.members,
          href: showMembers ? undefined : null,
          tabBarBadge: showMembers ? badgeFor('members') : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="id-card" size={size} color={color} />,
        }}
        listeners={tabFocusListener('members')}
      />
      <Tabs.Screen
        name="metrics"
        options={{
          title: TAB_LABELS.gym.metrics,
          href: showMetrics ? undefined : null,
          tabBarBadge: showMetrics ? badgeFor('metrics') : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="analytics" size={size} color={color} />,
        }}
        listeners={tabFocusListener('metrics')}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: TAB_LABELS.gym.profile,
          tabBarBadge: badgeFor('profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="business" size={size} color={color} />,
        }}
        listeners={tabFocusListener('profile')}
      />
    </Tabs>
  );
}

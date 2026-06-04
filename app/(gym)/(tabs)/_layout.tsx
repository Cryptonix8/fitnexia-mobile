import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { TAB_LABELS } from '@/constants/labels';
import { useTabBarOptions } from '@/hooks/use-tab-bar-options';
import { useFeature } from '@/hooks/use-feature';

export default function GymTabs() {
  const tabBarOptions = useTabBarOptions();
  const showMetrics = useFeature('analyticsMetrics');

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
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="instructors"
        options={{
          title: TAB_LABELS.gym.staff,
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: TAB_LABELS.gym.classes,
          tabBarIcon: ({ color, size }) => <Ionicons name="barbell" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="metrics"
        options={{
          title: TAB_LABELS.gym.metrics,
          href: showMetrics ? undefined : null,
          tabBarIcon: ({ color, size }) => <Ionicons name="analytics" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: TAB_LABELS.gym.profile,
          tabBarIcon: ({ color, size }) => <Ionicons name="business" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

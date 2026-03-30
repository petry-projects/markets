import { Tabs } from 'expo-router';
import { LayoutDashboard, Store, User } from 'lucide-react-native';

export default function ManagerLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
          tabBarAccessibilityLabel: 'Manager dashboard',
        }}
      />
      <Tabs.Screen
        name="vendors"
        options={{
          title: 'Vendors',
          tabBarIcon: ({ color, size }) => <Store color={color} size={size} />,
          tabBarAccessibilityLabel: 'Manage vendors',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          tabBarAccessibilityLabel: 'Your manager profile',
        }}
      />
      {/* Hide nested screens from tab bar */}
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="markets" options={{ href: null }} />
      <Tabs.Screen name="settings/activity-log" options={{ href: null, title: 'Activity Log' }} />
    </Tabs>
  );
}

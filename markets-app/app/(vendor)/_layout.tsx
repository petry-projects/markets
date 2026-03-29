import { Tabs } from 'expo-router';
import { MapPin, Activity, User } from 'lucide-react-native';

export default function VendorLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="markets"
        options={{
          title: 'Markets',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
          tabBarAccessibilityLabel: 'Your markets',
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: 'Status',
          tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />,
          tabBarAccessibilityLabel: 'Your vendor status',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          tabBarAccessibilityLabel: 'Your vendor profile',
        }}
      />
    </Tabs>
  );
}

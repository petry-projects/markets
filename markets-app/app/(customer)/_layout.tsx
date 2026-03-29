import { Tabs } from 'expo-router';
import { Search, Heart, User } from 'lucide-react-native';

export default function CustomerLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
          tabBarAccessibilityLabel: 'Discover markets and vendors',
        }}
      />
      <Tabs.Screen
        name="following"
        options={{
          title: 'Following',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
          tabBarAccessibilityLabel: 'Vendors and markets you follow',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          tabBarAccessibilityLabel: 'Your profile',
        }}
      />
    </Tabs>
  );
}

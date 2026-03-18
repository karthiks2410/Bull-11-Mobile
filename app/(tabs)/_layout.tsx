/**
 * Tab Layout - Unified for All Users
 * Admin users get an extra "Admin" tab
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';
import { useAuth } from '@/src/presentation/hooks/useAuth';

export default function TabLayout() {
  const { isAdmin } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      {/* Hide index tab - it's just a redirect */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: 'Games',
          tabBarIcon: ({ color }) => <TabBarIcon name="game-controller" color={color} />,
        }}
      />
      <Tabs.Screen
        name="new-game"
        options={{
          title: 'New Game',
          tabBarIcon: ({ color }) => <TabBarIcon name="add-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <TabBarIcon name="time" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
      {/* Admin-only tab - hide from non-admin users */}
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color }) => <TabBarIcon name="admin" color={color} />,
          href: isAdmin ? '/(tabs)/admin' : null,
        }}
      />
    </Tabs>
  );
}

// Simple icon component using emoji
function TabBarIcon(props: { name: string; color: string }) {
  const icons: Record<string, string> = {
    'game-controller': '🎮',
    'add-circle': '➕',
    'time': '📊',
    'person': '👤',
    'admin': '⚙️',
  };

  return <Text style={{ fontSize: 24 }}>{icons[props.name] || '•'}</Text>;
}

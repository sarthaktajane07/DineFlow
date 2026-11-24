import React from 'react';
import { Tabs } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { LayoutDashboard, Utensils, Users, BarChart3, Settings } from 'lucide-react-native';

export default function TabLayout() {
  const { role } = useAuth();
  const isManager = role === 'manager';

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#09090b' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarStyle: {
          backgroundColor: '#09090b',
          borderTopColor: '#27272a',
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#71717a',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tables"
        options={{
          title: 'Tables',
          tabBarLabel: 'Tables',
          tabBarIcon: ({ color, size }) => <Utensils size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="waitlist"
        options={{
          title: 'Waitlist',
          tabBarLabel: 'Waitlist',
          tabBarIcon: ({ color, size }) => <Users size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarLabel: 'Analytics',
          href: isManager ? '/analytics' : null,
          tabBarIcon: ({ color, size }) => <BarChart3 size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size || 22} color={color} />,
        }}
      />
    </Tabs>
  );
}

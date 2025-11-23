import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// 1. Import Safe Area Context
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DARK_BG = '#121212';
const ACTIVE_COLOR = '#BB86FC'; 
const INACTIVE_COLOR = '#888';

export default function TabLayout() {
  // 2. Get the safe area insets (padding for notch and home bar)
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: DARK_BG,
          borderTopWidth: 0,
          elevation: 0,
          // 3. Dynamic Height: Standard Height + The Unsafe Area at bottom
          height: 60 + insets.bottom, 
          // 4. Dynamic Padding: Push icons up by the unsafe amount
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10, 
          paddingTop: 10,
        },
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Remover',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="cut" color={color} />,
        }}
      />
      <Tabs.Screen
        name="restore"
        options={{
          title: 'Upscaler',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Ionicons size={26} name="person-circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
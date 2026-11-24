import React from 'react';
import { View, Text, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950 p-6">
      <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
        <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-4">
          <Text className="text-primary text-2xl font-bold">
            {user?.fullName?.charAt(0) || 'U'}
          </Text>
        </View>

        <Text className="text-white text-xl font-bold">{user?.fullName || 'User'}</Text>
        <Text className="text-zinc-400 text-sm mt-0.5">{user?.email}</Text>

        <View className="self-start mt-3 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
          <Text className="text-primary text-xs font-bold uppercase">{user?.role || 'Staff'}</Text>
        </View>
      </View>

      <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 mb-6">
        <View className="py-3 border-b border-zinc-800 flex-row justify-between">
          <Text className="text-zinc-400 text-sm">App Version</Text>
          <Text className="text-white text-sm font-semibold">1.0.0 (Expo 51)</Text>
        </View>
        <View className="py-3 border-b border-zinc-800 flex-row justify-between">
          <Text className="text-zinc-400 text-sm">Backend Engine</Text>
          <Text className="text-emerald-400 text-sm font-semibold">Spring Boot 3 + Java 21</Text>
        </View>
        <View className="py-3 flex-row justify-between">
          <Text className="text-zinc-400 text-sm">WebSocket Realtime</Text>
          <Text className="text-primary text-sm font-semibold">STOMP Protocol</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleLogout}
        className="bg-rose-950/60 border border-rose-600/50 rounded-2xl py-4 items-center"
      >
        <Text className="text-rose-400 font-bold text-base">Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

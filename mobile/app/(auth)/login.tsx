import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('admin@dineflow.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-3xl bg-primary items-center justify-center mb-3 shadow-lg">
            <Text className="text-3xl">🍽️</Text>
          </View>
          <Text className="text-white text-3xl font-extrabold tracking-tight">DineFlow Pro</Text>
          <Text className="text-zinc-400 text-sm mt-1">Restaurant Floor & Waitlist Manager</Text>
        </View>

        <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
          <Text className="text-white text-lg font-bold mb-4">Sign In</Text>

          <View className="mb-4">
            <Text className="text-zinc-400 text-xs font-medium mb-1.5 uppercase">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@restaurant.com"
              placeholderTextColor="#71717a"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm"
            />
          </View>

          <View className="mb-6">
            <Text className="text-zinc-400 text-xs font-medium mb-1.5 uppercase">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#71717a"
              secureTextEntry
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm"
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
            className="bg-primary rounded-xl py-3.5 items-center justify-center shadow-md"
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-base">Sign In</Text>
            )}
          </TouchableOpacity>

          <View className="mt-6 pt-4 border-t border-zinc-800/80">
            <Text className="text-zinc-500 text-xs text-center">
              Demo logins: admin@dineflow.com (Manager), host@dineflow.com (Host), staff@dineflow.com (Staff)
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

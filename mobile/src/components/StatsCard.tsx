import React from 'react';
import { View, Text } from 'react-native';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, color = '#f97316' }) => {
  return (
    <View className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 m-1 shadow-sm">
      <Text className="text-zinc-400 text-xs font-medium mb-1">{title}</Text>
      <Text className="text-white text-2xl font-bold mb-1" style={{ color }}>
        {value}
      </Text>
      {description && <Text className="text-zinc-500 text-xs">{description}</Text>}
    </View>
  );
};

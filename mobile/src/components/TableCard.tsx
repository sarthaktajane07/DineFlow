import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Table, TableStatus } from '../types';

interface TableCardProps {
  table: Table;
  onPress: (table: Table) => void;
}

const statusColors: Record<TableStatus, { bg: string; border: string; text: string }> = {
  free: { bg: 'bg-emerald-950/40', border: 'border-emerald-600', text: 'text-emerald-400' },
  occupied: { bg: 'bg-rose-950/40', border: 'border-rose-600', text: 'text-rose-400' },
  reserved: { bg: 'bg-amber-950/40', border: 'border-amber-600', text: 'text-amber-400' },
  cleaning: { bg: 'bg-orange-950/40', border: 'border-orange-600', text: 'text-orange-400' },
};

export const TableCard: React.FC<TableCardProps> = ({ table, onPress }) => {
  const color = statusColors[table.status] || statusColors.free;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(table)}
      className={`rounded-2xl border ${color.border} ${color.bg} p-4 m-1.5 flex-1 min-w-[100px] min-h-[110px] justify-between shadow-sm`}
    >
      <View className="flex-row justify-between items-center">
        <Text className="text-white text-lg font-bold">#{table.tableNumber}</Text>
        <Text className="text-zinc-400 text-xs">{table.seats} seats</Text>
      </View>

      <View className="my-1">
        {table.status === 'occupied' && table.currentGuest ? (
          <Text className="text-zinc-200 text-xs font-semibold" numberOfLines={1}>
            {table.currentGuest.guestName}
          </Text>
        ) : (
          <Text className="text-zinc-500 text-xs capitalize">{table.zone || 'Main'}</Text>
        )}
      </View>

      <View className="flex-row justify-between items-center">
        <Text className={`text-xs font-bold uppercase tracking-wider ${color.text}`}>
          {table.status}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

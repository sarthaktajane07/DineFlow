import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { WaitlistEntry } from '../types';

interface WaitlistItemProps {
  entry: WaitlistEntry;
  onNotify: (entry: WaitlistEntry) => void;
  onSeat: (entry: WaitlistEntry) => void;
  onRemove: (entry: WaitlistEntry) => void;
  canManage: boolean;
}

export const WaitlistItem: React.FC<WaitlistItemProps> = ({
  entry,
  onNotify,
  onSeat,
  onRemove,
  canManage,
}) => {
  const isNotified = entry.status === 'notified';

  return (
    <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center space-x-2">
          {entry.queuePosition ? (
            <View className="w-7 h-7 rounded-full bg-primary/20 items-center justify-center mr-2">
              <Text className="text-primary font-bold text-xs">#{entry.queuePosition}</Text>
            </View>
          ) : null}
          <Text className="text-white font-bold text-base">{entry.guestName}</Text>
        </View>

        <View
          className={`px-2.5 py-1 rounded-full ${
            isNotified ? 'bg-amber-500/20' : 'bg-emerald-500/20'
          }`}
        >
          <Text
            className={`text-xs font-semibold uppercase ${
              isNotified ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {entry.status}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center space-x-4 mb-3">
        <Text className="text-zinc-400 text-xs">Party: {entry.partySize} guests</Text>
        <Text className="text-zinc-500 text-xs">•</Text>
        <Text className="text-zinc-400 text-xs">{entry.phoneNumber}</Text>
        {entry.estimatedWaitTime ? (
          <>
            <Text className="text-zinc-500 text-xs">•</Text>
            <Text className="text-primary text-xs">~{entry.estimatedWaitTime} min</Text>
          </>
        ) : null}
      </View>

      {entry.notes ? (
        <Text className="text-zinc-500 text-xs italic mb-3">"{entry.notes}"</Text>
      ) : null}

      {canManage && (
        <View className="flex-row space-x-2 pt-2 border-t border-zinc-800/80 justify-end">
          <TouchableOpacity
            onPress={() => onRemove(entry)}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 mr-2"
          >
            <Text className="text-zinc-300 text-xs font-medium">Remove</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onNotify(entry)}
            className={`px-3 py-1.5 rounded-xl mr-2 ${
              isNotified ? 'bg-zinc-800' : 'bg-amber-600/30 border border-amber-500/40'
            }`}
          >
            <Text className={`text-xs font-medium ${isNotified ? 'text-zinc-400' : 'text-amber-300'}`}>
              {isNotified ? 'Notified' : 'Notify'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onSeat(entry)}
            className="px-4 py-1.5 rounded-xl bg-primary"
          >
            <Text className="text-white text-xs font-bold">Seat</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

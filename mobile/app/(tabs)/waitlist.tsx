import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../src/lib/api';
import { WaitlistItem } from '../../src/components/WaitlistItem';
import { useRealtime } from '../../src/hooks/useRealtime';
import { useAuth } from '../../src/hooks/useAuth';
import { WaitlistEntry, Table } from '../../src/types';

export default function WaitlistScreen() {
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const canManage = role === 'host' || role === 'manager';

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [seatModalVisible, setSeatModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);

  // Form states
  const [guestName, setGuestName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [notes, setNotes] = useState('');

  const { data: waitlist = [], isLoading, refetch } = useQuery<WaitlistEntry[]>({
    queryKey: ['waitlist'],
    queryFn: async () => {
      const { data } = await api.get('/waitlist');
      return data.data.waitlist;
    },
  });

  const { data: tables = [] } = useQuery<Table[]>({
    queryKey: ['tables'],
    queryFn: async () => {
      const { data } = await api.get('/tables');
      return data.data.tables;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/waitlist', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['waitlistStats'] });
      setAddModalVisible(false);
      setGuestName('');
      setPhoneNumber('');
      setPartySize('2');
      setNotes('');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add guest');
    },
  });

  const notifyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/waitlist/${id}/notify`, { preference: 'sms' });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      Alert.alert('Success', 'Guest notified via SMS/WhatsApp');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to notify guest');
    },
  });

  const seatMutation = useMutation({
    mutationFn: async ({ waitlistId, tableId }: { waitlistId: string; tableId: string }) => {
      const { data } = await api.post(`/waitlist/${waitlistId}/seat`, { tableId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['tableStats'] });
      queryClient.invalidateQueries({ queryKey: ['waitlistStats'] });
      setSeatModalVisible(false);
      setSelectedEntry(null);
      Alert.alert('Success', 'Guest seated at table');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to seat guest');
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/waitlist/${id}`, { data: { reason: 'cancelled' } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['waitlistStats'] });
    },
  });

  useRealtime(
    useCallback(
      (event: string) => {
        if (event.startsWith('waitlist:')) {
          queryClient.invalidateQueries({ queryKey: ['waitlist'] });
        }
      },
      [queryClient]
    )
  );

  const handleAddSubmit = () => {
    if (!guestName || !phoneNumber) {
      Alert.alert('Error', 'Please enter guest name and phone number');
      return;
    }
    addMutation.mutate({
      guestName,
      phoneNumber,
      partySize: parseInt(partySize) || 2,
      notes,
      notificationPreference: 'sms',
      estimatedWaitTime: 15,
    });
  };

  const handleSeatPress = (entry: WaitlistEntry) => {
    setSelectedEntry(entry);
    setSeatModalVisible(true);
  };

  const handleRemovePress = (entry: WaitlistEntry) => {
    Alert.alert('Remove Guest', `Remove ${entry.guestName} from waitlist?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeMutation.mutate(entry._id || entry.id!),
      },
    ]);
  };

  const availableTables = tables.filter((t) => t.status === 'free');

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-zinc-800">
        <Text className="text-white text-lg font-bold">Queue ({waitlist.length})</Text>
        {canManage && (
          <TouchableOpacity
            onPress={() => setAddModalVisible(true)}
            className="bg-primary px-4 py-2 rounded-xl"
          >
            <Text className="text-white text-xs font-bold">+ Add Guest</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <FlatList
          data={waitlist}
          keyExtractor={(item) => item._id || item.id!}
          contentContainerStyle={{ padding: 16 }}
          onRefresh={refetch}
          refreshing={false}
          renderItem={({ item }) => (
            <WaitlistItem
              entry={item}
              canManage={canManage}
              onNotify={() => notifyMutation.mutate(item._id || item.id!)}
              onSeat={() => handleSeatPress(item)}
              onRemove={() => handleRemovePress(item)}
            />
          )}
          ListEmptyComponent={
            <Text className="text-zinc-500 text-center py-16">No guests currently waiting.</Text>
          }
        />
      )}

      {/* Add Guest Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-bold">Add to Waitlist</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Text className="text-zinc-400 text-sm">Cancel</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-3 mb-6">
              <View>
                <Text className="text-zinc-400 text-xs mb-1">Guest Name *</Text>
                <TextInput
                  value={guestName}
                  onChangeText={setGuestName}
                  placeholder="e.g. John Smith"
                  placeholderTextColor="#71717a"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                />
              </View>

              <View>
                <Text className="text-zinc-400 text-xs mb-1">Phone Number *</Text>
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor="#71717a"
                  keyboardType="phone-pad"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                />
              </View>

              <View>
                <Text className="text-zinc-400 text-xs mb-1">Party Size</Text>
                <TextInput
                  value={partySize}
                  onChangeText={setPartySize}
                  placeholder="2"
                  placeholderTextColor="#71717a"
                  keyboardType="numeric"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                />
              </View>

              <View>
                <Text className="text-zinc-400 text-xs mb-1">Special Notes</Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Booth preferred, highchair needed"
                  placeholderTextColor="#71717a"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleAddSubmit}
              disabled={addMutation.isPending}
              className="bg-primary py-3.5 rounded-xl items-center"
            >
              {addMutation.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-sm">Add to Queue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Seat Guest Modal (Table Picker) */}
      <Modal visible={seatModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">
                Seat {selectedEntry?.guestName} (Party of {selectedEntry?.partySize})
              </Text>
              <TouchableOpacity onPress={() => setSeatModalVisible(false)}>
                <Text className="text-zinc-400 text-sm">Cancel</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-zinc-400 text-xs mb-3">Select an available table:</Text>

            {availableTables.length === 0 ? (
              <Text className="text-zinc-500 py-6 text-center">No free tables available right now.</Text>
            ) : (
              <FlatList
                data={availableTables}
                keyExtractor={(item) => item._id || item.id!}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() =>
                      seatMutation.mutate({
                        waitlistId: selectedEntry!._id || selectedEntry!.id!,
                        tableId: item._id || item.id!,
                      })
                    }
                    className="flex-row justify-between items-center bg-zinc-950 border border-zinc-800 p-4 rounded-xl mb-2"
                  >
                    <View>
                      <Text className="text-white font-bold text-base">Table #{item.tableNumber}</Text>
                      <Text className="text-zinc-400 text-xs">
                        {item.zone} • {item.seats} seats
                      </Text>
                    </View>
                    <Text className="text-primary font-bold text-xs uppercase">Select</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

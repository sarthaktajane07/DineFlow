import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../src/lib/api';
import { TableCard } from '../../src/components/TableCard';
import { useRealtime } from '../../src/hooks/useRealtime';
import { Table, TableStatus } from '../../src/types';

const zones = ['All', 'indoor', 'outdoor', 'bar', 'vip'];

export default function TablesScreen() {
  const queryClient = useQueryClient();
  const [selectedZone, setSelectedZone] = useState('All');
  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: tables = [], isLoading, refetch } = useQuery<Table[]>({
    queryKey: ['tables'],
    queryFn: async () => {
      const { data } = await api.get('/tables');
      return data.data.tables;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TableStatus }) => {
      const { data } = await api.put(`/tables/${id}`, { status });
      return data.data.table;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['tableStats'] });
      setModalVisible(false);
      setActiveTable(null);
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update table');
    },
  });

  useRealtime(
    useCallback(
      (event: string) => {
        if (event.startsWith('table:')) {
          queryClient.invalidateQueries({ queryKey: ['tables'] });
        }
      },
      [queryClient]
    )
  );

  const filteredTables = tables.filter((t) => {
    if (selectedZone === 'All') return true;
    return t.zone?.toLowerCase() === selectedZone.toLowerCase();
  });

  const handleTablePress = (table: Table) => {
    setActiveTable(table);
    setModalVisible(true);
  };

  const handleStatusChange = (status: TableStatus) => {
    if (activeTable) {
      updateStatusMutation.mutate({ id: activeTable._id || activeTable.id!, status });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      {/* Zone Selector */}
      <View className="py-2 px-3 border-b border-zinc-800">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={zones}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedZone(item)}
              className={`px-4 py-2 rounded-xl mr-2 ${
                selectedZone === item ? 'bg-primary' : 'bg-zinc-900 border border-zinc-800'
              }`}
            >
              <Text
                className={`text-xs font-bold capitalize ${
                  selectedZone === item ? 'text-white' : 'text-zinc-400'
                }`}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Tables Grid */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <FlatList
          data={filteredTables}
          keyExtractor={(item) => item._id || item.id!}
          numColumns={2}
          contentContainerStyle={{ padding: 10 }}
          onRefresh={refetch}
          refreshing={false}
          renderItem={({ item }) => <TableCard table={item} onPress={handleTablePress} />}
          ListEmptyComponent={
            <Text className="text-zinc-500 text-center py-12">No tables found for this zone.</Text>
          }
        />
      )}

      {/* Status Update Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-bold">Table #{activeTable?.tableNumber}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-zinc-400 text-sm font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-zinc-400 text-xs mb-4">
              {activeTable?.seats} seats • {activeTable?.zone} zone • Current:{' '}
              <Text className="text-white font-bold uppercase">{activeTable?.status}</Text>
            </Text>

            <Text className="text-zinc-300 font-semibold mb-2">Change Status:</Text>
            <View className="space-y-2">
              <TouchableOpacity
                onPress={() => handleStatusChange('free')}
                className="bg-emerald-950/60 border border-emerald-600/50 py-3 rounded-2xl items-center mb-2"
              >
                <Text className="text-emerald-400 font-bold">Set Available (Free)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleStatusChange('occupied')}
                className="bg-rose-950/60 border border-rose-600/50 py-3 rounded-2xl items-center mb-2"
              >
                <Text className="text-rose-400 font-bold">Set Occupied</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleStatusChange('reserved')}
                className="bg-amber-950/60 border border-amber-600/50 py-3 rounded-2xl items-center mb-2"
              >
                <Text className="text-amber-400 font-bold">Set Reserved</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleStatusChange('cleaning')}
                className="bg-orange-950/60 border border-orange-600/50 py-3 rounded-2xl items-center"
              >
                <Text className="text-orange-400 font-bold">Needs Cleaning</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

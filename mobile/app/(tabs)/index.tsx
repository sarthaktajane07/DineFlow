import React, { useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, SafeAreaView, ActivityIndicator } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../src/lib/api';
import { StatsCard } from '../../src/components/StatsCard';
import { useRealtime } from '../../src/hooks/useRealtime';
import { TableStats, WaitlistStats, ActivityLog } from '../../src/types';

export default function DashboardScreen() {
  const queryClient = useQueryClient();

  const { data: tableStats, isLoading: loadingTableStats, refetch: refetchTables } = useQuery<TableStats>({
    queryKey: ['tableStats'],
    queryFn: async () => {
      const { data } = await api.get('/tables/stats/overview');
      return data.data.stats;
    },
  });

  const { data: waitlistStats, isLoading: loadingWaitlistStats, refetch: refetchWaitlist } = useQuery<WaitlistStats>({
    queryKey: ['waitlistStats'],
    queryFn: async () => {
      const { data } = await api.get('/waitlist/stats/overview');
      return data.data.stats;
    },
  });

  const { data: activities, isLoading: loadingActivities, refetch: refetchActivities } = useQuery<ActivityLog[]>({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data } = await api.get('/activities?limit=10');
      return data.data.activities;
    },
  });

  const onRefresh = useCallback(() => {
    refetchTables();
    refetchWaitlist();
    refetchActivities();
  }, [refetchTables, refetchWaitlist, refetchActivities]);

  // Real-time invalidation
  useRealtime(
    useCallback(
      (event: string) => {
        if (event.startsWith('table:')) queryClient.invalidateQueries({ queryKey: ['tableStats'] });
        if (event.startsWith('waitlist:')) queryClient.invalidateQueries({ queryKey: ['waitlistStats'] });
        if (event.startsWith('activity:')) queryClient.invalidateQueries({ queryKey: ['activities'] });
      },
      [queryClient]
    )
  );

  const isLoading = loadingTableStats || loadingWaitlistStats;

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView
        className="flex-1 px-4 pt-2"
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor="#f97316" />}
      >
        <Text className="text-white text-xl font-bold mb-3 mt-2">Live Floor Overview</Text>

        {isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator color="#f97316" />
          </View>
        ) : (
          <>
            <View className="flex-row mb-2">
              <StatsCard title="Total Tables" value={tableStats?.total || 0} color="#38bdf8" />
              <StatsCard
                title="Available"
                value={tableStats?.free || 0}
                color="#22c55e"
                description={`${tableStats?.occupancyRate || 0}% occupied`}
              />
            </View>

            <View className="flex-row mb-4">
              <StatsCard title="Occupied" value={tableStats?.occupied || 0} color="#ef4444" />
              <StatsCard
                title="Waiting Guests"
                value={waitlistStats?.waiting || 0}
                color="#f97316"
                description={`Avg ${waitlistStats?.averageWaitTime || 0} min`}
              />
            </View>
          </>
        )}

        <Text className="text-white text-lg font-bold mb-3 mt-2">Recent Activities</Text>
        {loadingActivities ? (
          <ActivityIndicator color="#f97316" />
        ) : (
          <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 mb-6">
            {activities && activities.length > 0 ? (
              activities.map((act) => (
                <View key={act._id || act.id} className="py-2.5 border-b border-zinc-800/80 last:border-b-0">
                  <Text className="text-white text-sm font-semibold">{act.description}</Text>
                  <Text className="text-zinc-500 text-xs mt-0.5">
                    {act.performedBy?.fullName ? `By ${act.performedBy.fullName} • ` : ''}
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-zinc-500 text-sm text-center py-4">No recent activity</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

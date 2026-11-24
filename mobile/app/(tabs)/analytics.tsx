import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../src/lib/api';
import { StatsCard } from '../../src/components/StatsCard';

export default function AnalyticsScreen() {
  const { data: overview, isLoading, refetch } = useQuery({
    queryKey: ['analyticsOverview'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/overview');
      return data.data;
    },
  });

  const { data: waitersData, isLoading: loadingWaiters } = useQuery({
    queryKey: ['waiterPerformance'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/waiter-performance');
      return data.data.waiters;
    },
  });

  const { data: revenueData } = useQuery({
    queryKey: ['revenueStats'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/revenue');
      return data.data;
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView
        className="flex-1 px-4 pt-2"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#f97316" />}
      >
        <Text className="text-white text-xl font-bold mb-3 mt-2">Executive Performance</Text>

        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator color="#f97316" size="large" />
          </View>
        ) : (
          <>
            <View className="flex-row mb-2">
              <StatsCard
                title="Revenue (30d)"
                value={`$${overview?.totalRevenue?.toLocaleString() || 0}`}
                color="#22c55e"
              />
              <StatsCard
                title="Guests Served"
                value={overview?.totalGuestsSeated || 0}
                color="#38bdf8"
              />
            </View>

            <View className="flex-row mb-4">
              <StatsCard
                title="Avg Table Turn"
                value={`${overview?.avgServiceDuration || 45}m`}
                color="#f97316"
              />
              <StatsCard
                title="Avg Wait Time"
                value={`${overview?.avgWaitTime || 15}m`}
                color="#eab308"
              />
            </View>

            {/* Waiter Performance */}
            <Text className="text-white text-lg font-bold mb-3 mt-2">Staff & Waiter Stats</Text>
            <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
              {loadingWaiters ? (
                <ActivityIndicator color="#f97316" />
              ) : waitersData && waitersData.length > 0 ? (
                waitersData.map((w: any) => (
                  <View
                    key={w.waiterId}
                    className="flex-row justify-between items-center py-3 border-b border-zinc-800/80 last:border-b-0"
                  >
                    <View>
                      <Text className="text-white font-bold text-sm">{w.name}</Text>
                      <Text className="text-zinc-500 text-xs">
                        {w.tablesServed} tables • Rating: ⭐ {w.avgRating}
                      </Text>
                    </View>
                    <Text className="text-emerald-400 font-bold text-sm">
                      ${w.revenue?.toLocaleString() || 0}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-zinc-500 text-sm text-center py-4">No staff metrics recorded yet</Text>
              )}
            </View>

            {/* Shift Breakdown */}
            <Text className="text-white text-lg font-bold mb-3 mt-2">Revenue by Shift</Text>
            <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-8">
              {revenueData?.shiftRevenue?.map((s: any) => (
                <View
                  key={s.shift}
                  className="flex-row justify-between items-center py-2.5 border-b border-zinc-800/80 last:border-b-0"
                >
                  <Text className="text-zinc-300 capitalize text-sm font-medium">{s.shift}</Text>
                  <Text className="text-white font-bold text-sm">${s.revenue?.toLocaleString() || 0}</Text>
                </View>
              )) || <Text className="text-zinc-500 text-sm text-center py-2">No shift data</Text>}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

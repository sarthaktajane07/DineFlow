import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { useRealtime } from './useRealtime';

const mapTable = (t) => ({
  id: t._id || t.id,
  table_number: typeof t.tableNumber === 'number' ? t.tableNumber : parseInt(t.tableNumber) || 0,
  seats: t.seats,
  status: t.status,
  zone: t.zone || null,
  position_x: t.position?.x || 0,
  position_y: t.position?.y || 0,
  party_name: t.currentGuest?.guestName || null,
  party_size: t.currentGuest?.partySize || null,
  seated_at: t.occupiedAt || null,
  created_at: t.createdAt,
  updated_at: t.updatedAt
});

const mapWaitlistEntry = (w) => ({
  id: w._id || w.id,
  guest_name: w.guestName,
  party_size: w.partySize,
  phone: w.phoneNumber || null,
  notes: w.notes || null,
  status: w.status,
  estimated_wait_minutes: w.estimatedWaitTime || null,
  queue_position: w.queuePosition || null,
  created_at: w.createdAt,
  notified_at: w.notifiedAt || null,
  seated_at: w.seatedAt || null,
  notification_preference: w.notificationPreference || 'sms'
});

export function useRestaurantData() {
  const { user } = useAuth();
  const [tables, setTables] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const updateTableInState = useCallback((updatedTable) => {
    setTables(prev => {
      const targetId = updatedTable._id || updatedTable.id;
      const idx = prev.findIndex(t => t.id === targetId);
      const mapped = mapTable(updatedTable);
      if (idx >= 0) {
        const newTables = [...prev];
        newTables[idx] = mapped;
        return newTables;
      } else {
        return [...prev, mapped].sort((a, b) => a.table_number - b.table_number);
      }
    });
  }, []);

  const fetchTables = useCallback(async () => {
    try {
      const { data } = await api.get('/tables');
      if (data.success && data.data?.tables) {
        setTables(data.data.tables.map(mapTable));
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  }, []);

  const fetchWaitlist = useCallback(async () => {
    try {
      const { data } = await api.get('/waitlist');
      if (data.success && data.data?.waitlist) {
        setWaitlist(data.data.waitlist.map(mapWaitlistEntry));
      }
    } catch (error) {
      console.error('Error fetching waitlist:', error);
    }
  }, []);

  const fetchActivityLogs = useCallback(async () => {
    try {
      const { data } = await api.get('/activities');
      if (data.success && data.data?.activities) {
        setActivityLogs(data.data.activities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  }, []);

  const handleRealtimeEvent = useCallback((event, payload) => {
    switch (event) {
      case 'table:created':
      case 'table:updated':
        if (payload?.table) {
          updateTableInState(payload.table);
        }
        break;
      case 'table:deleted':
        if (payload?.tableId) {
          setTables(prev => prev.filter(t => t.id !== payload.tableId));
        }
        break;
      case 'waitlist:added':
        if (payload?.entry) {
          setWaitlist(prev => [...prev, mapWaitlistEntry(payload.entry)].sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateA - dateB;
          }));
        }
        break;
      case 'waitlist:updated':
        if (payload?.entry) {
          const entry = payload.entry;
          const entryId = entry._id || entry.id;
          setWaitlist(prev => {
            const idx = prev.findIndex(w => w.id === entryId);
            if (idx >= 0) {
              const newW = [...prev];
              newW[idx] = mapWaitlistEntry(entry);
              if (entry.status !== 'waiting' && entry.status !== 'notified') {
                return newW.filter(w => w.id !== entryId);
              }
              return newW;
            }
            return prev;
          });
        }
        break;
      case 'waitlist:removed':
        if (payload?.entryId) {
          setWaitlist(prev => prev.filter(w => w.id !== payload.entryId));
        }
        break;
      case 'activity:new':
        if (payload?.activity) {
          setActivityLogs(prev => [payload.activity, ...prev].slice(0, 50));
        }
        break;
      case 'guest:seated':
        if (payload?.table) updateTableInState(payload.table);
        break;
      default:
        break;
    }
  }, [updateTableInState]);

  useRealtime(handleRealtimeEvent);

  const updateTableStatus = useCallback(async (tableId, status, partyName, partySize) => {
    try {
      const { data } = await api.put(`/tables/${tableId}`, { status });
      if (data.success && data.data?.table) {
        updateTableInState(data.data.table);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update table error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update table status',
        variant: 'destructive',
      });
      return false;
    }
  }, [updateTableInState]);

  const addToWaitlist = useCallback(async (guestName, partySize, phone, notes, notificationPreference = 'sms') => {
    try {
      const { data } = await api.post('/waitlist', {
        guestName,
        partySize,
        phoneNumber: phone || '',
        notes,
        notificationPreference,
        estimatedWaitTime: Math.max(10, tables.filter(t => t.status !== 'free').length * 5),
      });
      if (data.success) {
        toast({
          title: 'Guest Added',
          description: `${guestName} (party of ${partySize}) added to waitlist`,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Add waitlist error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add to waitlist',
        variant: 'destructive',
      });
      return false;
    }
  }, [tables]);

  const seatGuest = useCallback(async (waitlistId, tableId) => {
    try {
      const { data } = await api.post(`/waitlist/${waitlistId}/seat`, { tableId });
      if (data.success) {
        toast({
          title: 'Guest Seated',
          description: 'Guest has been seated successfully',
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Seat guest error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to seat guest',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  const notifyGuest = useCallback(async (waitlistId, preference = 'sms', tableNumber = null) => {
    try {
      const { data } = await api.post(`/waitlist/${waitlistId}/notify`, {
        preference,
        tableNumber
      });
      if (data.success) {
        const entry = waitlist.find(w => w.id === waitlistId);
        toast({
          title: 'Notification Sent',
          description: `${entry?.guest_name || 'Guest'} has been notified via ${preference}`,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Notify error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to notify guest',
        variant: 'destructive',
      });
      return false;
    }
  }, [waitlist]);

  const removeFromWaitlist = useCallback(async (waitlistId, reason) => {
    try {
      const { data } = await api.delete(`/waitlist/${waitlistId}`, { data: { reason } });
      if (data.success) {
        setWaitlist(prev => prev.filter(w => w.id !== waitlistId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Remove waitlist error:', error);
      return false;
    }
  }, []);

  const addTable = useCallback(async (tableNumber, seats, zone) => {
    try {
      const { data } = await api.post('/tables', {
        tableNumber: tableNumber.toString(),
        seats,
        zone
      });
      if (data.success) {
        toast({ title: 'Table Added' });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Add table error:', error);
      return false;
    }
  }, []);

  const removeTable = useCallback(async (tableId) => {
    try {
      const { data } = await api.delete(`/tables/${tableId}`);
      if (data.success) return true;
      return false;
    } catch (error) {
      console.error('Remove table error:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTables(), fetchWaitlist(), fetchActivityLogs()]);
      setLoading(false);
    };
    loadData();
  }, [user, fetchTables, fetchWaitlist, fetchActivityLogs]);

  return {
    tables,
    waitlist,
    activityLogs,
    loading,
    updateTableStatus,
    addToWaitlist,
    seatGuest,
    notifyGuest,
    removeFromWaitlist,
    addTable,
    removeTable,
    refetch: () => Promise.all([fetchTables(), fetchWaitlist(), fetchActivityLogs()]),
  };
}

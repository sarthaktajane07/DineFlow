import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { io } from 'socket.io-client';

const mapTable = (t) => ({
    id: t._id,
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
    id: w._id,
    guest_name: w.guestName,
    party_size: w.partySize,
    phone: w.phoneNumber || null,
    notes: w.notes || null,
    status: w.status,
    estimated_wait_minutes: w.estimatedWaitTime || null,
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
    const [socket, setSocket] = useState(null);

    // Helper to find table in current state and update it
    const updateTableInState = (updatedTable) => {
        setTables(prev => {
            const idx = prev.findIndex(t => t.id === updatedTable._id);
            const mapped = mapTable(updatedTable);
            if (idx >= 0) {
                const newTables = [...prev];
                newTables[idx] = mapped;
                return newTables;
            } else {
                return [...prev, mapped].sort((a, b) => a.table_number - b.table_number);
            }
        });
    };

    const fetchTables = useCallback(async () => {
        try {
            const { data } = await api.get('/tables');
            if (data.success) {
                setTables(data.data.tables.map(mapTable));
            }
        } catch (error) {
            console.error('Error fetching tables:', error);
        }
    }, []);

    const fetchWaitlist = useCallback(async () => {
        try {
            const { data } = await api.get('/waitlist');
            if (data.success) {
                setWaitlist(data.data.waitlist.map(mapWaitlistEntry));
            }
        } catch (error) {
            console.error('Error fetching waitlist:', error);
        }
    }, []);

    const fetchActivityLogs = useCallback(async () => {
        try {
            const { data } = await api.get('/activities');
            if (data.success) {
                setActivityLogs(data.data.activities);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    }, []);

    const updateTableStatus = useCallback(async (tableId, status, partyName, partySize) => {
        try {
            const { data } = await api.put(`/tables/${tableId}`, {
                status,
            });
            if (data.success) {
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
    }, []);

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
                description: 'Failed to add to waitlist',
                variant: 'destructive',
            });
            return false;
        }
    }, [tables]);

    const seatGuest = useCallback(async (waitlistId, tableId) => {
        try {
            const { data } = await api.post(`/waitlist/${waitlistId}/seat`, {
                tableId
            });
            if (data.success) {
                toast({
                    title: 'Guest Seated',
                    description: `Guest has been seated`,
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Seat guest error:', error);
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
                // @ts-ignore
                description: error.response?.data?.message || 'Failed to notify guest',
                variant: 'destructive',
            });
            return false;
        }
    }, [waitlist]);

    const removeFromWaitlist = useCallback(async (waitlistId) => {
        try {
            const { data } = await api.delete(`/waitlist/${waitlistId}`);
            if (data.success)
                return true;
            return false;
        } catch (error) {
            console.error(error);
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
            console.error(error);
            return false;
        }
    }, []);

    const removeTable = useCallback(async (tableId) => {
        try {
            const { data } = await api.delete(`/tables/${tableId}`);
            if (data.success)
                return true;
            return false;
        } catch (error) {
            console.error(error);
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

        // Determine Socket URL (remove /api from the end of VITE_API_URL)
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const socketUrl = apiUrl.replace(/\/api$/, '');

        const newSocket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            withCredentials: true
        });

        newSocket.on('connect', () => {
            console.log('Socket connected to:', socketUrl);
            const token = localStorage.getItem('token');
            if (token)
                newSocket.emit('authenticate', token);
        });

        newSocket.on('table:created', ({ table }) => updateTableInState(table));
        newSocket.on('table:updated', ({ table }) => updateTableInState(table));
        newSocket.on('table:deleted', ({ tableId }) => {
            setTables(prev => prev.filter(t => t.id !== tableId));
        });

        newSocket.on('waitlist:added', ({ entry }) => {
            setWaitlist(prev => [...prev, mapWaitlistEntry(entry)].sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateA - dateB;
            }));
        });

        newSocket.on('waitlist:updated', ({ entry }) => {
            setWaitlist(prev => {
                const idx = prev.findIndex(w => w.id === entry._id);
                if (idx >= 0) {
                    const newW = [...prev];
                    newW[idx] = mapWaitlistEntry(entry);
                    if (entry.status !== 'waiting' && entry.status !== 'notified') {
                        return newW.filter(w => w.id !== entry._id);
                    }
                    return newW;
                }
                return prev;
            });
        });

        newSocket.on('waitlist:removed', ({ entryId }) => {
            setWaitlist(prev => prev.filter(w => w.id !== entryId));
        });

        newSocket.on('guest:seated', ({ waitlistId, tableId }) => {
            // Handled by table:updated and waitlist:updated mostly
        });

        newSocket.on('activity:new', ({ activity }) => {
            setActivityLogs(prev => [activity, ...prev].slice(0, 50));
        });

        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        };
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

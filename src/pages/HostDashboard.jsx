import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { TableMap } from '@/components/TableMap';
import { WaitlistPanel } from '@/components/WaitlistPanel';
import { StatsCard } from '@/components/StatsCard';
import { ActivityFeed } from '@/components/ActivityFeed';
import { TableStatusDialog } from '@/components/TableStatusDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import { Navigate } from 'react-router-dom';
import { UtensilsCrossed, Users, Clock, Bell } from 'lucide-react';
export default function HostDashboard() {
    const { user, role, loading: authLoading } = useAuth();
    const { tables, waitlist, activityLogs, loading, updateTableStatus, addToWaitlist, seatGuest, notifyGuest, removeFromWaitlist, } = useRestaurantData();
    const [selectedTable, setSelectedTable] = useState(null);
    if (authLoading) {
        return (<div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
      </div>);
    }
    if (!user) {
        return <Navigate to="/auth" replace/>;
    }
    const stats = {
        freeTables: tables.filter(t => t.status === 'free').length,
        waitingGuests: waitlist.length,
        notifiedGuests: waitlist.filter(w => w.notified_at).length,
        avgWait: waitlist.length > 0
            ? Math.round(waitlist.reduce((acc, w) => acc + (w.estimated_wait_minutes || 0), 0) / waitlist.length)
            : 0,
    };
    const handleStatusChange = async (tableId, status, partyName, partySize) => {
        return await updateTableStatus(tableId, status, partyName, partySize);
    };
    return (<div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Host Station</h1>
          <p className="text-muted-foreground">Manage waitlist and seat guests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Available Tables" value={stats.freeTables} icon={UtensilsCrossed}/>
          <StatsCard title="Waiting Guests" value={stats.waitingGuests} icon={Users}/>
          <StatsCard title="Notified" value={stats.notifiedGuests} icon={Bell}/>
          <StatsCard title="Avg Wait" value={`${stats.avgWait} min`} icon={Clock}/>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Waitlist - Primary for Host */}
          <div className="lg:col-span-1 order-1 lg:order-none">
            <WaitlistPanel waitlist={waitlist} onAddGuest={addToWaitlist} onNotify={notifyGuest} onRemove={removeFromWaitlist}/>
          </div>

          {/* Table Map */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-xl">Floor Plan</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (<div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
                  </div>) : (<TableMap tables={tables} waitlist={waitlist} onTableClick={setSelectedTable} onDropGuest={seatGuest}/>)}
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <ActivityFeed logs={activityLogs.slice(0, 10)}/>
          </div>
        </div>
      </main>

      <TableStatusDialog table={selectedTable} open={!!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)} onStatusChange={handleStatusChange} showSeatOption/>
    </div>);
}

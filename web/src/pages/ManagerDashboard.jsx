import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { TableMap } from '@/components/TableMap';
import { WaitlistPanel } from '@/components/WaitlistPanel';
import { StatsCard } from '@/components/StatsCard';
import { ActivityFeed } from '@/components/ActivityFeed';
import { TableStatusDialog } from '@/components/TableStatusDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import { Navigate, Link } from 'react-router-dom';
import { UtensilsCrossed, Users, Clock, Plus, LayoutDashboard } from 'lucide-react';
export default function ManagerDashboard() {
    const { user, role, loading: authLoading } = useAuth();
    const { tables, waitlist, activityLogs, loading, updateTableStatus, addToWaitlist, seatGuest, notifyGuest, removeFromWaitlist, addTable, removeTable, } = useRestaurantData();
    const [selectedTable, setSelectedTable] = useState(null);
    const [showAddTable, setShowAddTable] = useState(false);
    const [newTableNumber, setNewTableNumber] = useState('');
    const [newTableSeats, setNewTableSeats] = useState('4');
    const [newTableZone, setNewTableZone] = useState('main');
    if (authLoading) {
        return (<div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
      </div>);
    }
    if (!user) {
        return <Navigate to="/auth" replace/>;
    }
    const stats = {
        totalTables: tables.length,
        freeTables: tables.filter(t => t.status === 'free').length,
        occupiedTables: tables.filter(t => t.status === 'occupied').length,
        waitingGuests: waitlist.length,
    };
    const handleAddTable = async () => {
        if (!newTableNumber)
            return;
        const success = await addTable(parseInt(newTableNumber), parseInt(newTableSeats), newTableZone);
        if (success) {
            setShowAddTable(false);
            setNewTableNumber('');
            setNewTableSeats('4');
            setNewTableZone('main');
        }
    };
    const handleStatusChange = async (tableId, status, partyName, partySize) => {
        return await updateTableStatus(tableId, status, partyName, partySize);
    };
    return (<div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Manager Dashboard</h1>
            <p className="text-muted-foreground">Complete overview of your restaurant operations</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard/host">
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="w-4 h-4"/>
                Host View
              </Button>
            </Link>
            <Link to="/dashboard/staff">
              <Button variant="outline" size="sm" className="gap-2">
                <UtensilsCrossed className="w-4 h-4"/>
                Staff View
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Tables" value={stats.totalTables} icon={LayoutDashboard}/>
          <StatsCard title="Available" value={stats.freeTables} description={`${Math.round((stats.freeTables / stats.totalTables) * 100)}% capacity`} icon={UtensilsCrossed}/>
          <StatsCard title="Occupied" value={stats.occupiedTables} icon={Users}/>
          <StatsCard title="Waiting" value={stats.waitingGuests} description="guests in queue" icon={Clock}/>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Table Map */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="font-display text-xl">Floor Plan</CardTitle>
                <Dialog open={showAddTable} onOpenChange={setShowAddTable}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4"/>
                      Add Table
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Table</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="tableNumber">Table Number</Label>
                        <Input id="tableNumber" type="number" value={newTableNumber} onChange={(e) => setNewTableNumber(e.target.value)} placeholder="9"/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="seats">Seats</Label>
                        <Input id="seats" type="number" min="1" max="20" value={newTableSeats} onChange={(e) => setNewTableSeats(e.target.value)}/>
                      </div>
                      <div className="space-y-2">
                        <Label>Zone</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {['main', 'patio', 'vip'].map((zone) => (<button key={zone} onClick={() => setNewTableZone(zone)} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors capitalize ${newTableZone === zone
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border hover:border-primary/50'}`}>
                              {zone}
                            </button>))}
                        </div>
                      </div>
                      <Button onClick={handleAddTable} className="w-full">
                        Add Table
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {loading ? (<div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
                  </div>) : (<TableMap tables={tables} waitlist={waitlist} onTableClick={setSelectedTable} onDropGuest={seatGuest}/>)}
              </CardContent>
            </Card>

            {/* Waitlist */}
            <WaitlistPanel waitlist={waitlist} onAddGuest={addToWaitlist} onNotify={notifyGuest} onRemove={removeFromWaitlist}/>
          </div>

          {/* Activity Feed */}
          <div>
            <ActivityFeed logs={activityLogs}/>
          </div>
        </div>
      </main>

      <TableStatusDialog table={selectedTable} open={!!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)} onStatusChange={handleStatusChange} showSeatOption/>
    </div>);
}

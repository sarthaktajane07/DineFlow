import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { TableCard, TableStatusLegend } from '@/components/TableCard';
import { TableStatusDialog } from '@/components/TableStatusDialog';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import { Navigate } from 'react-router-dom';
import { UtensilsCrossed, CheckCircle, Clock, AlertTriangle, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
export default function StaffDashboard() {
    const { user, role, loading: authLoading } = useAuth();
    const { tables, activityLogs, loading, updateTableStatus, } = useRestaurantData();
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
        occupiedTables: tables.filter(t => t.status === 'occupied').length,
        cleaningTables: tables.filter(t => t.status === 'cleaning').length,
        totalTables: tables.length,
    };
    const handleStatusChange = async (tableId, status) => {
        return await updateTableStatus(tableId, status);
    };
    const cleaningAlerts = tables.filter(t => t.status === 'cleaning');
    const recentLogs = activityLogs.filter(log => log.action.includes('Table status') || log.action.includes('cleaning')).slice(0, 5);
    return (<div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Staff Dashboard</h1>
          <p className="text-muted-foreground">Update table statuses and manage floor</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Available" value={stats.freeTables} icon={CheckCircle}/>
          <StatsCard title="Occupied" value={stats.occupiedTables} icon={UtensilsCrossed}/>
          <StatsCard title="Needs Cleaning" value={stats.cleaningTables} icon={AlertTriangle}/>
          <StatsCard title="Total Tables" value={stats.totalTables} icon={Clock}/>
        </div>

        {/* Cleaning Alerts */}
        {cleaningAlerts.length > 0 && (<Card className="mb-8 border-status-cleaning/50 bg-status-cleaning/5">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2 text-status-cleaning">
                <AlertTriangle className="w-5 h-5"/>
                Tables Need Cleaning ({cleaningAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {cleaningAlerts.map(table => (<div key={table.id} onClick={() => setSelectedTable(table)} className="flex items-center gap-3 px-4 py-3 bg-card rounded-lg border border-border cursor-pointer hover:border-primary/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-status-cleaning flex items-center justify-center text-primary-foreground font-bold">
                      {table.table_number}
                    </div>
                    <div>
                      <p className="font-medium">Table {table.table_number}</p>
                      <p className="text-xs text-muted-foreground">{table.zone} • {table.seats} seats</p>
                    </div>
                  </div>))}
              </div>
            </CardContent>
          </Card>)}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* All Tables */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="font-display text-xl">All Tables</CardTitle>
                <TableStatusLegend />
              </CardHeader>
              <CardContent>
                {loading ? (<div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
                  </div>) : (<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {tables.map(table => (<div key={table.id} className="flex flex-col items-center gap-2">
                        <TableCard table={table} onClick={() => setSelectedTable(table)} size="md"/>
                        <span className="text-xs text-muted-foreground capitalize">{table.zone}</span>
                      </div>))}
                  </div>)}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="font-display text-xl flex items-center gap-2">
                  <Bell className="w-5 h-5"/>
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {recentLogs.length === 0 ? (<p className="text-center text-muted-foreground py-8">No recent activity</p>) : (recentLogs.map((log) => (<div key={log.id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </p>
                        </div>)))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <TableStatusDialog table={selectedTable} open={!!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)} onStatusChange={handleStatusChange} showSeatOption={false}/>
    </div>);
}

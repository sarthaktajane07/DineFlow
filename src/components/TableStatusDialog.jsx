import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, UtensilsCrossed, Calendar } from 'lucide-react';
const statusOptions = [
    { status: 'free', label: 'Available', icon: CheckCircle, color: 'bg-status-free hover:bg-status-free/90' },
    { status: 'occupied', label: 'Occupied', icon: UtensilsCrossed, color: 'bg-status-occupied hover:bg-status-occupied/90' },
    { status: 'cleaning', label: 'Cleaning', icon: Clock, color: 'bg-status-cleaning hover:bg-status-cleaning/90' },
    { status: 'reserved', label: 'Reserved', icon: Calendar, color: 'bg-status-reserved hover:bg-status-reserved/90' },
];
export function TableStatusDialog({ table, open, onOpenChange, onStatusChange, showSeatOption }) {
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [partyName, setPartyName] = useState('');
    const [partySize, setPartySize] = useState('');
    const [loading, setLoading] = useState(false);
    // Reset state when dialog closes
    if (!open && selectedStatus) {
        setSelectedStatus(null);
        setPartyName('');
        setPartySize('');
    }
    const handleStatusClick = async (status) => {
        if (!table)
            return;
        if (status === 'occupied' && showSeatOption) {
            setSelectedStatus(status);
            return;
        }
        setLoading(true);
        const success = await onStatusChange(table.id, status);
        setLoading(false);
        if (success) {
            onOpenChange(false);
        }
    };
    const handleSeatGuest = async () => {
        if (!table || !partyName.trim())
            return;
        setLoading(true);
        const success = await onStatusChange(table.id, 'occupied', partyName, parseInt(partySize) || undefined);
        setLoading(false);
        if (success) {
            setSelectedStatus(null);
            setPartyName('');
            setPartySize('');
            onOpenChange(false);
        }
    };
    if (!table)
        return null;
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Table {table.table_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{table.seats} seats</span>
            <span>•</span>
            <span className="capitalize">{table.zone} section</span>
            {table.party_name && (<>
                <span>•</span>
                <span>{table.party_name}</span>
              </>)}
          </div>

          {selectedStatus === 'occupied' && showSeatOption ? (<div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="partyName">Party Name</Label>
                <Input id="partyName" value={partyName} onChange={(e) => setPartyName(e.target.value)} placeholder="Guest name" autoFocus/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="partySize">Party Size (optional)</Label>
                <Input id="partySize" type="number" min="1" max={table.seats} value={partySize} onChange={(e) => setPartySize(e.target.value)} placeholder={`Max ${table.seats}`}/>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSeatGuest} disabled={loading || !partyName.trim()} className="flex-1">
                  {loading ? 'Seating...' : 'Seat Guest'}
                </Button>
                <Button variant="outline" onClick={() => setSelectedStatus(null)}>
                  Back
                </Button>
              </div>
            </div>) : (<div className="grid grid-cols-2 gap-3">
              {statusOptions.map(({ status, label, icon: Icon, color }) => (<Button key={status} onClick={() => handleStatusClick(status)} disabled={loading || table.status === status} className={cn('h-auto py-4 flex flex-col gap-2', table.status === status ? 'ring-2 ring-offset-2 ring-foreground' : '', color, 'text-primary-foreground')}>
                  <Icon className="w-6 h-6"/>
                  <span>{label}</span>
                </Button>))}
            </div>)}
        </div>
      </DialogContent>
    </Dialog>);
}

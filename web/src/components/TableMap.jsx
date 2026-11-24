import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TableCard, TableStatusLegend } from './TableCard';
export function TableMap({ tables, waitlist, onTableClick, onDropGuest, editable, className }) {
    const [draggedGuest, setDraggedGuest] = useState(null);
    const [hoveredTable, setHoveredTable] = useState(null);
    const zones = [...new Set(tables.map(t => t.zone || 'main'))].sort((a, b) => {
        const order = { 'indoor': 1, 'outdoor': 2, 'bar': 3, 'vip': 4 };
        // @ts-ignore
        return (order[a] || 99) - (order[b] || 99);
    });
    const handleDragStart = (e, guestId) => {
        setDraggedGuest(guestId);
        e.dataTransfer.setData('text/plain', guestId);
    };
    const handleDragOver = (e, tableId, status) => {
        if (status === 'free') {
            e.preventDefault();
            setHoveredTable(tableId);
        }
    };
    const handleDragLeave = () => {
        setHoveredTable(null);
    };
    const handleDrop = (e, tableId) => {
        e.preventDefault();
        const guestId = e.dataTransfer.getData('text/plain');
        if (guestId && onDropGuest) {
            onDropGuest(guestId, tableId);
        }
        setDraggedGuest(null);
        setHoveredTable(null);
    };
    return (<div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold">Floor Plan</h3>
        <TableStatusLegend />
      </div>

      <div className="grid gap-6">
        {zones.map(zone => {
            const zoneTables = tables.filter(t => (t.zone || 'main') === zone);
            return (<div key={zone} className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {zone} Section
              </h4>
              <div className="relative bg-muted/30 rounded-2xl p-6 min-h-[200px] border border-border/50">
                <div className="flex flex-wrap gap-6 justify-center">
                  {zoneTables.map(table => (<div key={table.id} onDragOver={(e) => handleDragOver(e, table.id, table.status)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, table.id)} className={cn('transition-all duration-200', hoveredTable === table.id && 'ring-4 ring-primary/50 rounded-xl scale-105')}>
                      <TableCard table={table} onClick={() => onTableClick?.(table)} size="md"/>
                    </div>))}
                </div>
              </div>
            </div>);
        })}
      </div>

      {waitlist && waitlist.length > 0 && (<div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Drag guests to seat them
          </h4>
          <div className="flex flex-wrap gap-3">
            {waitlist.map(entry => (<div key={entry.id} draggable onDragStart={(e) => handleDragStart(e, entry.id)} className={cn('px-4 py-2 bg-card rounded-lg border border-border shadow-sm cursor-grab', 'transition-all hover:shadow-md hover:border-primary/50', draggedGuest === entry.id && 'opacity-50')}>
                <span className="font-medium">{entry.guest_name}</span>
                <span className="text-muted-foreground ml-2">({entry.party_size})</span>
              </div>))}
          </div>
        </div>)}
    </div>);
}

import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';
const statusConfig = {
    free: { bg: 'bg-status-free', label: 'Available', icon: '✓' },
    occupied: { bg: 'bg-status-occupied', label: 'Occupied', icon: '●' },
    cleaning: { bg: 'bg-status-cleaning', label: 'Cleaning', icon: '◐' },
    reserved: { bg: 'bg-status-reserved', label: 'Reserved', icon: '◉' },
};
export function TableCard({ table, onClick, isDragging, size = 'md' }) {
    const config = statusConfig[table.status] || statusConfig.free;
    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
    };
    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };
    return (<div onClick={onClick} className={cn('relative rounded-xl transition-all duration-300 cursor-pointer', 'flex flex-col items-center justify-center gap-1', 'border-2 border-transparent', config.bg, sizeClasses[size], isDragging && 'opacity-50 scale-95', onClick && 'hover:scale-105 hover:shadow-lg hover:border-foreground/20', 'shadow-md')}>
      <span className={cn('font-bold text-primary-foreground', size === 'sm' ? 'text-lg' : 'text-xl')}>
        {table.table_number}
      </span>
      <div className={cn('flex items-center gap-1 text-primary-foreground/90', textSizes[size])}>
        <Users className="w-3 h-3"/>
        <span>{table.seats}</span>
      </div>
      {table.party_name && size !== 'sm' && (<div className={cn('absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full', 'bg-card text-card-foreground px-2 py-0.5 rounded-md shadow-sm border border-border', 'text-xs whitespace-nowrap max-w-[100px] truncate')}>
          {table.party_name}
        </div>)}
    </div>);
}
export function TableStatusLegend() {
    return (<div className="flex flex-wrap gap-4">
      {Object.entries(statusConfig).map(([status, config]) => (<div key={status} className="flex items-center gap-2">
          <div className={cn('w-4 h-4 rounded-md', config.bg)}/>
          <span className="text-sm text-muted-foreground capitalize">{config.label}</span>
        </div>))}
    </div>);
}

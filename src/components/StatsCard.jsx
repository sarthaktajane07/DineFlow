import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
export function StatsCard({ title, value, description, icon: Icon, trend, className }) {
    return (<Card className={cn('shadow-card overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold font-display">{value}</p>
            {description && (<p className="text-xs text-muted-foreground">{description}</p>)}
            {trend && (<div className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', trend.positive ? 'bg-status-free/10 text-status-free' : 'bg-status-occupied/10 text-status-occupied')}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </div>)}
          </div>
          <div className="p-3 bg-primary/10 rounded-xl">
            <Icon className="w-6 h-6 text-primary"/>
          </div>
        </div>
      </CardContent>
    </Card>);
}

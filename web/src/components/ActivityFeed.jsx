import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Activity, Bell, CheckCircle, Users, UtensilsCrossed } from 'lucide-react';
const actionIcons = {
  'Table status changed': UtensilsCrossed,
  'Guest added to waitlist': Users,
  'Guest notified': Bell,
  'Guest seated': CheckCircle,
  'Table added': UtensilsCrossed,
  'Table removed': UtensilsCrossed,
};
export function ActivityFeed({ logs, className }) {
  const getTimeAgo = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'just now';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'just now';
    }
  };

  return (<Card className={cn('shadow-card', className)}>
    <CardHeader className="pb-4">
      <CardTitle className="font-display text-xl flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Activity Feed
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          {logs.length === 0 ? (<p className="text-center text-muted-foreground py-8">No recent activity</p>) : (logs.map((log) => {
            const Icon = actionIcons[log.action] || Activity;
            const logId = log._id || log.id;
            const timestamp = log.createdAt || log.created_at || new Date();

            return (<div key={logId} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="p-2 rounded-full bg-primary/10">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{log.description || log.action}</p>
                {log.details && (<p className="text-xs text-muted-foreground truncate">
                  {Object.entries(log.details)
                    .filter(([_, v]) => v)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' • ')}
                </p>)}
                <p className="text-xs text-muted-foreground mt-1">
                  {getTimeAgo(timestamp)}
                </p>
              </div>
            </div>);
          }))}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>);
}

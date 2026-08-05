'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Server,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';

import { NotificationType } from '@incidentops/shared';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notificationsApi } from '@/lib/api/settings';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<string, { icon: any; color: string }> = {
  [NotificationType.INCIDENT_CREATED]: { icon: AlertTriangle, color: 'text-red-400' },
  [NotificationType.INCIDENT_ASSIGNED]: { icon: UserPlus, color: 'text-blue-400' },
  [NotificationType.INCIDENT_ACKNOWLEDGED]: { icon: CheckCircle2, color: 'text-yellow-400' },
  [NotificationType.INCIDENT_RESOLVED]: { icon: CheckCircle2, color: 'text-green-400' },
  [NotificationType.INCIDENT_COMMENTED]: { icon: MessageSquare, color: 'text-purple-400' },
  [NotificationType.SERVICE_DOWN]: { icon: Server, color: 'text-orange-400' },
  [NotificationType.SERVICE_RECOVERED]: { icon: Server, color: 'text-green-400' },
  default: { icon: Bell, color: 'text-muted-foreground' },
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.findAll(),
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All marked as read');
    },
  });

  const markOneMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.data ?? [];
  const unreadCount = data?.meta?.unreadCount ?? 0;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Bell className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">No notifications yet</p>
              <p className="text-sm text-muted-foreground/70">
                You'll see incident alerts and updates here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n: any) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.default;
                const Icon = cfg.icon;
                return (
                  <div
                    key={n._id}
                    className={cn(
                      'flex items-start gap-4 p-4 transition-colors hover:bg-muted/30',
                      !n.read && 'bg-primary/3',
                    )}
                  >
                    <div
                      className={cn(
                        'h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center shrink-0 mt-0.5',
                        !n.read && 'ring-2 ring-primary/20',
                      )}
                    >
                      <Icon className={cn('h-4 w-4', cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={cn('text-sm', !n.read ? 'font-semibold' : 'font-medium')}>
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!n.read && (
                            <button
                              onClick={() => markOneMutation.mutate(n._id)}
                              className="h-1.5 w-1.5 rounded-full bg-primary hover:bg-primary/70 transition-colors"
                              title="Mark as read"
                            />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteMutation.mutate(n._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

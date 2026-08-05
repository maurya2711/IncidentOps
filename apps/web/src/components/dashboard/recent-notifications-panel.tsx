'use client';

import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { notificationsApi } from '@/lib/api/settings';

export function RecentNotificationsPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-notifications'],
    queryFn: () => notificationsApi.findAll(1, 5),
    refetchInterval: 30000,
  });

  const notifications = data?.data ?? [];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-4 w-4 text-muted-foreground" />
          Recent Alerts & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground p-6 text-center">No alerts recorded yet</p>
        ) : (
          <ScrollArea className="h-[250px]">
            <div className="flex flex-col">
              {notifications.map((notification: any, i: number) => (
                <div key={notification._id} className="flex flex-col">
                  <div className="p-4 hover:bg-muted/50 transition-colors">
                    <p className="text-sm font-medium leading-none mb-1">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mb-1">{notification.body}</p>
                    <p className="text-xs text-muted-foreground/60">
                      {notification.createdAt
                        ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                        : ''}
                    </p>
                  </div>
                  {i < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

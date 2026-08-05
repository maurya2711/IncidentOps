'use client';

import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';

import { IncidentStatus } from '@incidentops/shared';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIncidentsQuery } from '@/hooks/use-incidents';

export function RecentActivityTimeline() {
  const { data, isLoading } = useIncidentsQuery({ limit: 5 });
  const incidents = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : incidents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
        ) : (
          <div className="relative border-l ml-3 border-muted space-y-6">
            {incidents.map((incident: any) => {
              const isResolved = incident.status === IncidentStatus.RESOLVED;
              const isAck = incident.status === IncidentStatus.ACKNOWLEDGED;
              const Icon = isResolved ? CheckCircle2 : isAck ? Clock : AlertCircle;
              const iconColor = isResolved
                ? 'text-green-500'
                : isAck
                  ? 'text-yellow-500'
                  : 'text-red-500';

              return (
                <div key={incident._id} className="relative pl-6">
                  <span className="absolute -left-3.5 bg-background p-1 rounded-full">
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      INC-{incident.incidentNumber}: {incident.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Status: <span className="capitalize">{incident.status}</span> ·{' '}
                      {incident.createdAt
                        ? formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })
                        : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

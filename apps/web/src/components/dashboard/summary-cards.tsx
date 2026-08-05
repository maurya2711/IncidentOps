'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, Clock, Loader2, Server } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsApi } from '@/lib/api/analytics';

export function SummaryCards() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => analyticsApi.getSummary(30),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="flex items-center justify-center h-28">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
          <Activity className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.totalIncidents ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.activeIncidents ?? 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">MTTR</CardTitle>
          <Clock className="h-4 w-4 text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.mttr ?? 0}
            <span className="text-sm font-normal text-muted-foreground ml-1">min</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Mean time to resolve</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Service Uptime</CardTitle>
          <Server className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.averageUptimePercent ?? 100}%</div>
          <p className="text-xs text-muted-foreground mt-1">All monitored services</p>
        </CardContent>
      </Card>
    </div>
  );
}

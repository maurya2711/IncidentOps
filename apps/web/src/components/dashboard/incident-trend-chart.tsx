'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsApi } from '@/lib/api/analytics';

export function IncidentTrendChart() {
  const { data: trendData, isLoading } = useQuery({
    queryKey: ['dashboard-trend'],
    queryFn: () => analyticsApi.getIncidentTrend(30),
  });

  const chartData = (trendData ?? []).map((item: any) => ({
    date: item.date ? item.date.slice(5) : '',
    created: item.created ?? 0,
    resolved: item.resolved ?? 0,
  }));

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Incident Trend (30 Days)</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="created"
                name="Created"
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#colorCreated)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="resolved"
                name="Resolved"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#colorResolved)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

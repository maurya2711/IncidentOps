'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsApi } from '@/lib/api/analytics';

export function TopFailedServices() {
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['dashboard-top-failing'],
    queryFn: () => analyticsApi.getTopFailingServices(5),
  });

  const data = (rawData ?? []).map((item: any) => ({
    name: item.name ?? 'Unknown',
    errors: item.count ?? 0,
  }));

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Top Failed Services</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            No incident failures recorded for services yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 0, left: 30, bottom: 0 }}
            >
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                fontSize={12}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar
                dataKey="errors"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
                barSize={24}
                name="Incidents"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

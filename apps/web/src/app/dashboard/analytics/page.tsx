'use client';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  CheckCircle2,
  Clock,
  Loader2,
  Server,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsApi } from '@/lib/api/analytics';
import { cn } from '@/lib/utils';

const RANGE_OPTS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

function RangePicker({ value, onChange }: { value: number; onChange: (d: number) => void }) {
  return (
    <div className="flex gap-1 bg-muted/30 p-1 rounded-md border border-border">
      {RANGE_OPTS.map(({ label, days }) => (
        <button
          key={days}
          onClick={() => onChange(days)}
          className={cn(
            'px-2.5 py-1 rounded text-xs font-medium transition-colors',
            value === days
              ? 'bg-background text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function KpiCard({
  title,
  value,
  unit,
  icon: Icon,
  color,
  sub,
}: {
  title: string;
  value: string | number;
  unit?: string;
  icon: any;
  color: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={cn('text-3xl font-bold mt-1', color)}>
              {value}
              {unit && (
                <span className="text-base font-normal text-muted-foreground ml-1">{unit}</span>
              )}
            </p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div
            className={cn(
              'h-10 w-10 rounded-lg flex items-center justify-center',
              `${color.replace('text-', 'bg-').replace('-400', '-500/10')}`,
            )}
          >
            <Icon className={cn('h-5 w-5', color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 8,
  },
  labelStyle: { color: 'hsl(var(--foreground))' },
};

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['analytics', 'summary', days],
    queryFn: () => analyticsApi.getSummary(days),
  });

  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ['analytics', 'trend', days],
    queryFn: () => analyticsApi.getIncidentTrend(days),
  });

  const { data: mttr } = useQuery({
    queryKey: ['analytics', 'mttr', days],
    queryFn: () => analyticsApi.getMttr(days),
  });

  const { data: bySeverity } = useQuery({
    queryKey: ['analytics', 'bySeverity', days],
    queryFn: () => analyticsApi.getIncidentsBySeverity(days),
  });

  const { data: topFailingServices } = useQuery({
    queryKey: ['analytics', 'topFailing', days],
    queryFn: () => analyticsApi.getTopFailingServices(10),
  });

  const { data: slaCompliance } = useQuery({
    queryKey: ['analytics', 'sla', days],
    queryFn: () => analyticsApi.getSlaCompliance(days),
  });

  const pieData = (bySeverity ?? []).map((d: any) => ({
    name: d._id,
    value: d.count,
  }));

  const mttrBySeverity = Object.entries(mttr?.bySeverity ?? {}).map(([sev, mins]) => ({
    severity: sev,
    minutes: mins as number,
    color: SEVERITY_COLORS[sev] ?? '#6366f1',
  }));

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Operational insights and performance metrics
          </p>
        </div>
        <RangePicker value={days} onChange={setDays} />
      </div>

      {/* KPI Cards */}
      {summaryLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard
            title="Total Incidents"
            value={summary?.totalIncidents ?? 0}
            icon={Activity}
            color="text-blue-400"
            sub={`Last ${days} days`}
          />
          <KpiCard
            title="Active Now"
            value={summary?.activeIncidents ?? 0}
            icon={TrendingUp}
            color="text-red-400"
          />
          <KpiCard
            title="Resolved"
            value={summary?.resolvedToday ?? 0}
            icon={CheckCircle2}
            color="text-green-400"
            sub={`Last ${days} days`}
          />
          <KpiCard
            title="Avg Uptime"
            value={`${summary?.averageUptimePercent ?? 100}`}
            unit="%"
            icon={Server}
            color="text-emerald-400"
          />
          <KpiCard
            title="MTTR"
            value={summary?.mttr ?? 0}
            unit="min"
            icon={Clock}
            color="text-orange-400"
            sub="Avg resolution time"
          />
          <KpiCard
            title="MTTD"
            value={summary?.mttd ?? 'N/A'}
            unit={summary?.mttd ? 'min' : ''}
            icon={TrendingDown}
            color="text-purple-400"
            sub="Avg detection time"
          />
        </div>
      )}

      {/* Incident Trend Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Incident Trend — Created vs Resolved</CardTitle>
        </CardHeader>
        <CardContent>
          {trendLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend ?? []}>
                  <defs>
                    <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    allowDecimals={false}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="created"
                    stroke="#6366f1"
                    fill="url(#gradCreated)"
                    strokeWidth={2}
                    name="Created"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stroke="#22c55e"
                    fill="url(#gradResolved)"
                    strokeWidth={2}
                    name="Resolved"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MTTR by Severity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">MTTR by Severity (minutes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mttrBySeverity} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="severity"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    width={65}
                  />
                  <Tooltip {...tooltipStyle} formatter={(v) => [`${v} min`, 'MTTR']} />
                  <Bar dataKey="minutes" radius={[0, 4, 4, 0]}>
                    {mttrBySeverity.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Incidents by Severity Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Incidents by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52 flex items-center">
              {pieData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  No data for this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((_: any, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Failing Services */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Services by Incident Count</CardTitle>
          </CardHeader>
          <CardContent>
            {(topFailingServices ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No service-linked incidents yet
              </p>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topFailingServices ?? []} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      width={100}
                    />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Incidents" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SLA Compliance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SLA Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {(slaCompliance ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No resolved incidents in this period
              </p>
            ) : (
              (slaCompliance ?? []).map((item: any) => (
                <div key={item.severity} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">{item.severity}</span>
                    <span
                      className={cn(
                        'font-bold',
                        item.compliance >= 90
                          ? 'text-green-400'
                          : item.compliance >= 70
                            ? 'text-yellow-400'
                            : 'text-red-400',
                      )}
                    >
                      {item.compliance}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        item.compliance >= 90
                          ? 'bg-green-500'
                          : item.compliance >= 70
                            ? 'bg-yellow-500'
                            : 'bg-red-500',
                      )}
                      style={{ width: `${item.compliance}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Target: {item.target}min · {item.withinSla}/{item.total} within SLA
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

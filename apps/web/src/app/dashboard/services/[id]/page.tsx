'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { formatDistanceToNow } from 'date-fns';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Loader2,
  RefreshCw,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wrench,
  XCircle,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

import { Incident, Service, ServiceStatus } from '@incidentops/shared';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIncidentsQuery } from '@/hooks/use-incidents';
import {
  useDeleteServiceMutation,
  useServiceMetricsQuery,
  useServiceQuery,
  useUpdateServiceMutation,
} from '@/hooks/use-services';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<
  ServiceStatus,
  { label: string; color: string; bg: string; icon: any }
> = {
  [ServiceStatus.OPERATIONAL]: {
    label: 'Operational',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    icon: CheckCircle2,
  },
  [ServiceStatus.DEGRADED]: {
    label: 'Degraded',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    icon: AlertTriangle,
  },
  [ServiceStatus.PARTIAL_OUTAGE]: {
    label: 'Partial Outage',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    icon: AlertTriangle,
  },
  [ServiceStatus.MAJOR_OUTAGE]: {
    label: 'Major Outage',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    icon: XCircle,
  },
  [ServiceStatus.MAINTENANCE]: {
    label: 'Maintenance',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    icon: Wrench,
  },
  [ServiceStatus.UNKNOWN]: {
    label: 'Unknown',
    color: 'text-gray-400',
    bg: 'bg-gray-500/10 border-gray-500/20',
    icon: Activity,
  },
};

const METRIC_RANGE_OPTIONS = [
  { label: '24h', days: 1 },
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
];

function MetricCard({
  label,
  value,
  unit,
  good,
  warn,
}: {
  label: string;
  value: number;
  unit: string;
  good: number;
  warn: number;
}) {
  const isGood = value <= good;
  const isMedium = value <= warn;
  return (
    <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          'text-xl font-bold',
          isGood ? 'text-green-400' : isMedium ? 'text-yellow-400' : 'text-red-400',
        )}
      >
        {value}
        <span className="text-sm font-normal text-muted-foreground ml-0.5">{unit}</span>
      </p>
    </div>
  );
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [metricDays, setMetricDays] = useState(7);

  const { data: service, isLoading } = useServiceQuery(id);
  const { data: metrics } = useServiceMetricsQuery(id, metricDays);
  const { data: incidentsData } = useIncidentsQuery({ service: id, limit: 5 });
  const updateMutation = useUpdateServiceMutation(id);
  const deleteMutation = useDeleteServiceMutation();

  if (isLoading || !service) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const config = STATUS_CONFIG[service.status] ?? STATUS_CONFIG[ServiceStatus.UNKNOWN];
  const Icon = config.icon;

  const handleStatusChange = async (status: ServiceStatus) => {
    try {
      await updateMutation.mutateAsync({ status });
      toast.success(`Status updated to ${STATUS_CONFIG[status].label}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${service.name}"? This cannot be undone.`))
      return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Service deleted');
      router.push('/dashboard/services');
    } catch {
      toast.error('Failed to delete service');
    }
  };

  const copyBadgeToken = () => {
    navigator.clipboard.writeText(service.statusBadgeToken ?? '');
    toast.success('Badge token copied!');
  };

  // Format metrics for chart
  const chartData = (metrics ?? []).slice(-50).map((m: any) => ({
    time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    Latency: m.latency,
    'Error Rate': m.errorRate,
  }));

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <Button variant="ghost" onClick={() => router.push('/dashboard/services')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
      </Button>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold">{service.name}</h1>
            <Badge className={cn('border text-sm', config.bg, config.color)}>
              <Icon className="mr-1.5 h-3.5 w-3.5" />
              {config.label}
            </Badge>
          </div>
          {service.description && (
            <p className="text-sm text-muted-foreground">{service.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={service.status}
            onChange={(e) => handleStatusChange(e.target.value as ServiceStatus)}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            disabled={updateMutation.isPending}
          >
            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
              <option key={val} value={val}>
                {cfg.label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Uptime" value={service.uptime ?? 0} unit="%" good={99} warn={95} />
        <MetricCard
          label="Avg Latency"
          value={service.latency ?? 0}
          unit="ms"
          good={200}
          warn={500}
        />
        <MetricCard label="Error Rate" value={service.errorRate ?? 0} unit="%" good={1} warn={5} />
        <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-1">
          <p className="text-xs text-muted-foreground">Team</p>
          <p className="text-sm font-semibold truncate">
            {(service.team as any)?.name ?? 'Unassigned'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Performance Metrics</CardTitle>
              <div className="flex gap-1">
                {METRIC_RANGE_OPTIONS.map(({ label, days }) => (
                  <button
                    key={days}
                    onClick={() => setMetricDays(days)}
                    className={cn(
                      'px-2.5 py-1 rounded text-xs font-medium transition-colors',
                      metricDays === days
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 8,
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="Latency"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="Error Rate"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>No metric data yet</p>
                    <p className="text-xs mt-1">
                      Metrics are recorded when you POST to /services/{id}/metrics
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Incidents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Recent Incidents</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard/incidents?service=${id}`)}
              >
                View all
              </Button>
            </CardHeader>
            <CardContent>
              {incidentsData?.data?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No incidents for this service 🎉
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {incidentsData?.data?.map((incident: Incident) => (
                    <div
                      key={incident._id}
                      className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 px-2 -mx-2 rounded-md"
                      onClick={() => router.push(`/dashboard/incidents/${incident._id}`)}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{incident.title}</p>
                        <p className="text-xs text-muted-foreground">
                          INC-{incident.incidentNumber} ·{' '}
                          {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {incident.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dependencies */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Dependencies</CardTitle>
            </CardHeader>
            <CardContent>
              {service.dependencies?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No dependencies configured.</p>
              ) : (
                <div className="space-y-2">
                  {service.dependencies?.map((dep: any, i: number) => {
                    const depConfig =
                      STATUS_CONFIG[dep.status as ServiceStatus] ??
                      STATUS_CONFIG[ServiceStatus.UNKNOWN];
                    return (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{dep.name}</span>
                        <span className={cn('text-xs font-medium', depConfig.color)}>
                          {depConfig.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Badge */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Status Badge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Embed your service status in any dashboard or README.
              </p>
              <div className="bg-muted/50 rounded-md p-2 font-mono text-xs break-all border border-border">
                {service.statusBadgeToken ?? 'generating...'}
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={copyBadgeToken}>
                <Copy className="mr-2 h-3.5 w-3.5" /> Copy Badge Token
              </Button>
            </CardContent>
          </Card>

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {service.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

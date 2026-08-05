'use client';

import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Wrench,
  XCircle,
  Zap,
} from 'lucide-react';

import { IncidentSeverity, IncidentStatus, ServiceStatus } from '@incidentops/shared';

import { API_URL } from '@/lib/constants';
import { cn } from '@/lib/utils';

const statusApi = {
  getOverall: () => axios.get(`${API_URL}/api/status`).then((r) => r.data?.data ?? r.data),
  getServices: () =>
    axios.get(`${API_URL}/api/status/services`).then((r) => r.data?.data ?? r.data),
  getIncidents: () =>
    axios.get(`${API_URL}/api/status/incidents`).then((r) => r.data?.data ?? r.data),
  getHistory: () => axios.get(`${API_URL}/api/status/history`).then((r) => r.data?.data ?? r.data),
};

const OVERALL_CONFIG = {
  operational: {
    label: 'All Systems Operational',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/30',
    icon: CheckCircle2,
  },
  degraded: {
    label: 'Partial System Degradation',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    icon: AlertTriangle,
  },
  major_outage: {
    label: 'Major System Outage',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/30',
    icon: XCircle,
  },
};

const SERVICE_STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  [ServiceStatus.OPERATIONAL]: { label: 'Operational', dot: 'bg-green-500' },
  [ServiceStatus.DEGRADED]: { label: 'Degraded', dot: 'bg-yellow-500' },
  [ServiceStatus.PARTIAL_OUTAGE]: { label: 'Partial Outage', dot: 'bg-orange-500' },
  [ServiceStatus.MAJOR_OUTAGE]: { label: 'Major Outage', dot: 'bg-red-500 animate-pulse' },
  [ServiceStatus.MAINTENANCE]: { label: 'Maintenance', dot: 'bg-blue-500' },
  [ServiceStatus.UNKNOWN]: { label: 'Unknown', dot: 'bg-gray-500' },
};

const SEV_COLORS: Record<string, string> = {
  [IncidentSeverity.CRITICAL]: 'text-red-400 border-red-500/30 bg-red-500/10',
  [IncidentSeverity.HIGH]: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  [IncidentSeverity.MEDIUM]: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  [IncidentSeverity.LOW]: 'text-green-400 border-green-500/30 bg-green-500/10',
};

export default function StatusPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { data: overall, refetch: refetchOverall } = useQuery({
    queryKey: ['status', 'overall'],
    queryFn: statusApi.getOverall,
    refetchInterval: 60000,
  });
  const { data: services } = useQuery({
    queryKey: ['status', 'services'],
    queryFn: statusApi.getServices,
    refetchInterval: 60000,
  });
  const { data: incidents } = useQuery({
    queryKey: ['status', 'incidents'],
    queryFn: statusApi.getIncidents,
    refetchInterval: 60000,
  });
  const { data: history } = useQuery({
    queryKey: ['status', 'history'],
    queryFn: statusApi.getHistory,
    refetchInterval: 60000,
  });

  useEffect(() => {
    const timer = setInterval(() => setLastUpdated(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const overallStatus = overall?.overall ?? 'operational';
  const cfg =
    OVERALL_CONFIG[overallStatus as keyof typeof OVERALL_CONFIG] ?? OVERALL_CONFIG.operational;
  const StatusIcon = cfg.icon;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-[#0a0a0a]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">IncidentOps</span>
            <span className="text-muted-foreground text-sm ml-1">Status</span>
          </div>
          <button
            onClick={() => {
              refetchOverall();
              setLastUpdated(new Date());
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {/* Overall Status Banner */}
        <div className={cn('rounded-2xl border p-8 text-center', cfg.bg)}>
          <StatusIcon className={cn('h-12 w-12 mx-auto mb-4', cfg.color)} />
          <h1 className={cn('text-2xl md:text-3xl font-bold', cfg.color)}>{cfg.label}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {overall?.serviceCount ?? 0} services monitored · {overall?.affectedCount ?? 0} affected
          </p>
          <p className="text-sm mt-2">
            Average uptime:{' '}
            <span className="font-bold text-green-400">{overall?.avgUptime ?? 100}%</span>
          </p>
        </div>

        {/* Active Incidents */}
        {incidents && incidents.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Active Incidents
            </h2>
            <div className="space-y-3">
              {incidents.map((inc: any) => (
                <div
                  key={inc._id}
                  className="bg-card border border-border rounded-xl p-5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <p className="font-semibold">{inc.title}</p>
                    <div className="flex gap-2">
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full border font-medium capitalize',
                          SEV_COLORS[inc.severity] ?? '',
                        )}
                      >
                        {inc.severity}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full border border-border bg-muted/50 font-medium capitalize">
                        {inc.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Started {formatDistanceToNow(new Date(inc.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Service Health</h2>
          <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
            {!services || services.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
                <Activity className="h-4 w-4" /> No services configured yet
              </div>
            ) : (
              services.map((service: any) => {
                const scfg =
                  SERVICE_STATUS_CONFIG[service.status] ??
                  SERVICE_STATUS_CONFIG[ServiceStatus.UNKNOWN];
                return (
                  <div key={service._id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', scfg.dot)} />
                      <span className="font-medium text-sm">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="hidden sm:inline">{service.uptime?.toFixed(2)}% uptime</span>
                      <span
                        className={cn(
                          'font-medium',
                          scfg.dot.includes('green')
                            ? 'text-green-400'
                            : scfg.dot.includes('yellow')
                              ? 'text-yellow-400'
                              : 'text-red-400',
                        )}
                      >
                        {scfg.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Incident History */}
        {history && history.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Incident History (Last 30 Days)</h2>
            <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
              {history.map((inc: any) => (
                <div key={inc._id} className="flex items-start justify-between px-5 py-4 gap-4">
                  <div>
                    <p className="text-sm font-medium">{inc.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(inc.createdAt), 'MMM d, yyyy')}
                      {inc.resolvedAt &&
                        ` → resolved ${formatDistanceToNow(new Date(inc.resolvedAt), { addSuffix: true })}`}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full border font-medium capitalize shrink-0',
                      SEV_COLORS[inc.severity] ?? '',
                    )}
                  >
                    {inc.severity}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground pt-4 border-t border-border/50">
          <p>Auto-refreshes every 60 seconds · Powered by IncidentOps</p>
        </footer>
      </main>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  Search,
  Wrench,
  XCircle,
} from 'lucide-react';

import { Service, ServiceStatus } from '@incidentops/shared';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useServicesQuery } from '@/hooks/use-services';
import { cn } from '@/lib/utils';

const STATUS_TABS: { label: string; value: string; icon?: any }[] = [
  { label: 'All', value: 'all' },
  { label: 'Operational', value: ServiceStatus.OPERATIONAL },
  { label: 'Degraded', value: ServiceStatus.DEGRADED },
  { label: 'Partial Outage', value: ServiceStatus.PARTIAL_OUTAGE },
  { label: 'Major Outage', value: ServiceStatus.MAJOR_OUTAGE },
  { label: 'Maintenance', value: ServiceStatus.MAINTENANCE },
];

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

function ServiceCard({ service }: { service: Service }) {
  const router = useRouter();
  const config = STATUS_CONFIG[service.status] ?? STATUS_CONFIG[ServiceStatus.UNKNOWN];
  const Icon = config.icon;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-200 group"
      onClick={() => router.push(`/dashboard/services/${service._id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors line-clamp-1">
            {service.name}
          </CardTitle>
          <Badge className={cn('shrink-0 text-xs border', config.bg, config.color)}>
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        </div>
        {service.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Uptime</p>
            <p
              className={cn(
                'text-sm font-bold',
                service.uptime >= 99
                  ? 'text-green-400'
                  : service.uptime >= 95
                    ? 'text-yellow-400'
                    : 'text-red-400',
              )}
            >
              {service.uptime?.toFixed(2)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Latency</p>
            <p
              className={cn(
                'text-sm font-bold',
                service.latency < 200
                  ? 'text-green-400'
                  : service.latency < 500
                    ? 'text-yellow-400'
                    : 'text-red-400',
              )}
            >
              {service.latency}ms
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Error Rate</p>
            <p
              className={cn(
                'text-sm font-bold',
                service.errorRate < 1
                  ? 'text-green-400'
                  : service.errorRate < 5
                    ? 'text-yellow-400'
                    : 'text-red-400',
              )}
            >
              {service.errorRate?.toFixed(2)}%
            </p>
          </div>
        </div>
        {service.team && (
          <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Team:</span>
            <span className="text-xs font-medium">{(service.team as any).name ?? 'Unknown'}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ServicesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useServicesQuery({
    status: activeTab !== 'all' ? activeTab : undefined,
    search: search || undefined,
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor the health of all your services
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/services/new')}>
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1.5 flex-wrap bg-muted/30 p-1.5 rounded-lg border border-border w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150',
              activeTab === tab.value
                ? 'bg-background text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Service Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data?.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center border border-dashed border-border rounded-lg">
          <Activity className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-medium">No services found</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {activeTab !== 'all'
              ? 'Try a different filter'
              : 'Add your first service to get started'}
          </p>
          {activeTab === 'all' && (
            <Button
              className="mt-4"
              size="sm"
              onClick={() => router.push('/dashboard/services/new')}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Service
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {data?.meta.total} service{data?.meta.total !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data?.data.map((service: Service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

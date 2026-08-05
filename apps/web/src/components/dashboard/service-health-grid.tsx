'use client';

import { useRouter } from 'next/navigation';

import { Loader2 } from 'lucide-react';

import { ServiceStatus } from '@incidentops/shared';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useServicesQuery } from '@/hooks/use-services';
import { cn } from '@/lib/utils';

const DEFAULT_STATIC_SERVICES = [
  { _id: 'static-1', name: 'API Gateway', status: ServiceStatus.OPERATIONAL, uptime: 99.99 },
  { _id: 'static-2', name: 'Authentication', status: ServiceStatus.OPERATIONAL, uptime: 99.99 },
  { _id: 'static-3', name: 'Database Cluster', status: ServiceStatus.DEGRADED, uptime: 99.95 },
  { _id: 'static-4', name: 'Storage Service', status: ServiceStatus.OPERATIONAL, uptime: 100 },
  { _id: 'static-5', name: 'Search Engine', status: ServiceStatus.MAJOR_OUTAGE, uptime: 98.5 },
  { _id: 'static-6', name: 'Worker Nodes', status: ServiceStatus.OPERATIONAL, uptime: 99.9 },
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  [ServiceStatus.OPERATIONAL]: {
    label: 'Operational',
    bg: 'bg-green-500/10 border-green-500/20',
    color: 'text-green-400',
  },
  [ServiceStatus.DEGRADED]: {
    label: 'Degraded',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    color: 'text-yellow-400',
  },
  [ServiceStatus.PARTIAL_OUTAGE]: {
    label: 'Partial Outage',
    bg: 'bg-orange-500/10 border-orange-500/20',
    color: 'text-orange-400',
  },
  [ServiceStatus.MAJOR_OUTAGE]: {
    label: 'Major Outage',
    bg: 'bg-red-500/10 border-red-500/20',
    color: 'text-red-400',
  },
  [ServiceStatus.MAINTENANCE]: {
    label: 'Maintenance',
    bg: 'bg-blue-500/10 border-blue-500/20',
    color: 'text-blue-400',
  },
  [ServiceStatus.UNKNOWN]: {
    label: 'Unknown',
    bg: 'bg-gray-500/10 border-gray-500/20',
    color: 'text-gray-400',
  },
};

export function ServiceHealthGrid() {
  const router = useRouter();
  const { data: rawServices, isLoading } = useServicesQuery();

  // Extract array safely regardless of response wrapping
  const fetchedServices = Array.isArray(rawServices)
    ? rawServices
    : Array.isArray((rawServices as any)?.data)
      ? (rawServices as any).data
      : [];

  // Fallback to static services if no services exist in DB yet
  const servicesList = fetchedServices.length > 0 ? fetchedServices : DEFAULT_STATIC_SERVICES;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Service Health</CardTitle>
        <button
          onClick={() => router.push('/dashboard/services')}
          className="text-xs text-primary hover:underline font-normal"
        >
          View all
        </button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {servicesList.map((service: any) => {
              const cfg = STATUS_CONFIG[service.status] ?? STATUS_CONFIG[ServiceStatus.UNKNOWN];
              const isStatic = service._id?.startsWith('static-');
              return (
                <div
                  key={service._id}
                  onClick={() =>
                    router.push(
                      isStatic ? '/dashboard/services' : `/dashboard/services/${service._id}`,
                    )
                  }
                  className="flex flex-col p-4 border rounded-lg bg-card hover:border-primary/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="font-medium text-sm truncate">{service.name}</span>
                    <Badge variant="outline" className={cn('text-xs shrink-0', cfg.bg, cfg.color)}>
                      {cfg.label}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-auto">
                    Uptime: <span className="font-semibold text-foreground">{service.uptime}%</span>
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

'use client';

import { useRouter } from 'next/navigation';

import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Loader2 } from 'lucide-react';

import { Incident, IncidentSeverity } from '@incidentops/shared';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useIncidentsQuery } from '@/hooks/use-incidents';
import { cn } from '@/lib/utils';

const SEVERITY_BADGES: Record<string, { label: string; className: string }> = {
  [IncidentSeverity.CRITICAL]: {
    label: 'Critical (P1)',
    className: 'bg-red-500/10 text-red-400 border-red-500/30',
  },
  [IncidentSeverity.HIGH]: {
    label: 'High (P2)',
    className: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  },
  [IncidentSeverity.MEDIUM]: {
    label: 'Medium (P3)',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  },
  [IncidentSeverity.LOW]: {
    label: 'Low (P4)',
    className: 'bg-green-500/10 text-green-400 border-green-500/30',
  },
};

export function ActiveIncidentsList() {
  const router = useRouter();
  const { data, isLoading } = useIncidentsQuery({ limit: 5 });

  const incidents: Incident[] = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.data)
      ? (data as any).data
      : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Incidents</CardTitle>
        <button
          onClick={() => router.push('/dashboard/incidents')}
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
        ) : incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
            <AlertCircle className="h-8 w-8 opacity-40" />
            <p className="text-sm">No incidents reported yet 🎉</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead className="text-right">Age</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => {
                const sev =
                  SEVERITY_BADGES[incident.severity] ?? SEVERITY_BADGES[IncidentSeverity.MEDIUM];
                return (
                  <TableRow
                    key={incident._id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/dashboard/incidents/${incident._id}`)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground font-mono">
                          INC-{incident.incidentNumber}
                        </span>
                        <span className="font-medium text-sm line-clamp-1">{incident.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('text-xs border', sev.className)}>
                        {sev.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {incident.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {(incident.assignee as any)?.name ?? 'Unassigned'}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {incident.createdAt
                        ? formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })
                        : '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

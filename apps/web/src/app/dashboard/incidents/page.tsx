'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Filter, Loader2, Plus, Search } from 'lucide-react';

import { Incident, IncidentSeverity, IncidentStatus } from '@incidentops/shared';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useIncidentsQuery } from '@/hooks/use-incidents';

export default function IncidentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useIncidentsQuery({ search });

  const getSeverityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.CRITICAL:
        return <Badge variant="destructive">Critical</Badge>;
      case IncidentSeverity.HIGH:
        return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
      case IncidentSeverity.MEDIUM:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
      case IncidentSeverity.LOW:
        return <Badge className="bg-green-500 hover:bg-green-600">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.OPEN:
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            Open
          </Badge>
        );
      case IncidentStatus.ACKNOWLEDGED:
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            Acknowledged
          </Badge>
        );
      case IncidentStatus.INVESTIGATING:
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Investigating
          </Badge>
        );
      case IncidentStatus.RESOLVED:
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Resolved
          </Badge>
        );
      case IncidentStatus.CLOSED:
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
        <Button onClick={() => router.push('/dashboard/incidents/new')}>
          <Plus className="mr-2 h-4 w-4" /> Create Incident
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border border-border">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            className="pl-8 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Incident</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No incidents found.
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((incident: Incident) => (
                <TableRow
                  key={incident._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/dashboard/incidents/${incident._id}`)}
                >
                  <TableCell>
                    <div className="font-medium">INC-{incident.incidentNumber}</div>
                    <div className="text-sm text-muted-foreground">{incident.title}</div>
                  </TableCell>
                  <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                  <TableCell>{getStatusBadge(incident.status)}</TableCell>
                  <TableCell>
                    {incident.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {incident.assignee.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm">{incident.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

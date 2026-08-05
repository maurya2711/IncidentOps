'use client';

import { useRouter } from 'next/navigation';

import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { IncidentSeverity, IncidentStatus } from '@incidentops/shared';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateIncidentMutation } from '@/hooks/use-incidents';

export default function CreateIncidentPage() {
  const router = useRouter();
  const createMutation = useCreateIncidentMutation();
  // Using native form since React Hook Form was causing some type issues quickly,
  // but let's use a simpler approach for the prototype

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const severity = formData.get('severity') as IncidentSeverity;

    if (!title) {
      toast.error('Title is required');
      return;
    }

    try {
      const incident = await createMutation.mutateAsync({
        title,
        description,
        severity: severity || IncidentSeverity.MEDIUM,
        status: IncidentStatus.OPEN,
      });
      toast.success('Incident created successfully');
      const incidentId = (incident as any)?._id ?? (incident as any)?.data?._id;
      if (incidentId) {
        router.push(`/dashboard/incidents/${incidentId}`);
      } else {
        router.push('/dashboard/incidents');
      }
    } catch (error) {
      toast.error('Failed to create incident');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Incidents
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Incident</CardTitle>
          <CardDescription>Report a new incident or outage in the system.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., API Gateway latency spike"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Detailed description of the issue..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <select
                id="severity"
                name="severity"
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue={IncidentSeverity.MEDIUM}
              >
                <option value={IncidentSeverity.CRITICAL}>Critical (P1)</option>
                <option value={IncidentSeverity.HIGH}>High (P2)</option>
                <option value={IncidentSeverity.MEDIUM}>Medium (P3)</option>
                <option value={IncidentSeverity.LOW}>Low (P4)</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-6">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Incident
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

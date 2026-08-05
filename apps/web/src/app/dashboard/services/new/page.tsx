'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { ServiceStatus } from '@incidentops/shared';

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
import { useCreateServiceMutation } from '@/hooks/use-services';

export default function CreateServicePage() {
  const router = useRouter();
  const createMutation = useCreateServiceMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const status = formData.get('status') as ServiceStatus;

    if (!name.trim()) {
      toast.error('Service name is required');
      return;
    }

    try {
      const service = await createMutation.mutateAsync({
        name,
        description,
        status: status || ServiceStatus.OPERATIONAL,
      });
      toast.success('Service created successfully');
      router.push(`/dashboard/services/${service._id}`);
    } catch {
      toast.error('Failed to create service');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add New Service</CardTitle>
          <CardDescription>Register a service to monitor its health and incidents.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">
                Service Name <span className="text-red-500">*</span>
              </Label>
              <Input id="name" name="name" placeholder="e.g., Payment Gateway" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="What does this service do?"
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={ServiceStatus.OPERATIONAL}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value={ServiceStatus.OPERATIONAL}>Operational</option>
                <option value={ServiceStatus.DEGRADED}>Degraded</option>
                <option value={ServiceStatus.PARTIAL_OUTAGE}>Partial Outage</option>
                <option value={ServiceStatus.MAJOR_OUTAGE}>Major Outage</option>
                <option value={ServiceStatus.MAINTENANCE}>Maintenance</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-5">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Service
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

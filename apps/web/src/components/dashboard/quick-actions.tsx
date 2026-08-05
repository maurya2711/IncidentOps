'use client';

import { useRouter } from 'next/navigation';

import { Activity, CheckSquare, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function QuickActions() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button
          className="w-full justify-start"
          onClick={() => router.push('/dashboard/incidents/new')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Incident
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <CheckSquare className="mr-2 h-4 w-4" />
          Acknowledge All
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Activity className="mr-2 h-4 w-4" />
          Run Diagnostic
        </Button>
      </CardContent>
    </Card>
  );
}

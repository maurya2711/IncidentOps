'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AlertCircle, Loader2, Mail } from 'lucide-react';

import { ActiveIncidentsList } from '@/components/dashboard/active-incidents-list';
import { IncidentTrendChart } from '@/components/dashboard/incident-trend-chart';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivityTimeline } from '@/components/dashboard/recent-activity-timeline';
import { RecentNotificationsPanel } from '@/components/dashboard/recent-notifications-panel';
import { ServiceHealthGrid } from '@/components/dashboard/service-health-grid';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { TopFailedServices } from '@/components/dashboard/top-failed-services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Once the loading is done, redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show full-page spinner only while actively loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Restoring your session…</p>
      </div>
    );
  }

  // Not authenticated → redirect (useEffect handles it, render nothing while it runs)
  if (!isAuthenticated) {
    return null;
  }

  // Show verification warning if user is not verified
  if (!user?.isVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Email verification required</CardTitle>
            <CardDescription>
              Please verify your email address to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                We sent a verification email to{' '}
                <span className="font-medium text-foreground">{user?.email}</span>. Please check
                your inbox.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() =>
                router.push(`/resend-verification?email=${encodeURIComponent(user?.email || '')}`)
              }
            >
              <Mail className="mr-2 h-4 w-4" />
              Resend verification email
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.push('/login')}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
      </div>

      <SummaryCards />
      <ServiceHealthGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <IncidentTrendChart />
          <ActiveIncidentsList />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <RecentActivityTimeline />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopFailedServices />
        <RecentNotificationsPanel />
      </div>
    </div>
  );
}

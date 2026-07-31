'use client';

import { useAuth } from '@/providers/auth-provider';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please sign in to access the dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>Email: {user?.email}</p>
            <p>Role: {user?.role}</p>
            <p>Status: {user?.isVerified ? 'Verified' : 'Not verified'}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Incidents</h3>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Active Incidents</h3>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Services</h3>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Team Members</h3>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>
        </div>

        <div className="mt-8 p-6 rounded-lg border border-dashed border-border bg-muted/50">
          <p className="text-center text-muted-foreground">
            Dashboard implementation coming in Phase 3
          </p>
        </div>
      </div>
    </div>
  );
}

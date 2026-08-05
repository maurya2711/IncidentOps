'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Loader2, Lock, Zap } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminApi } from '@/lib/api/admin';

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: adminApi.acceptInvite,
    onSuccess: () => {
      setIsSuccess(true);
      toast.success('Account activated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to activate account');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Missing invitation token');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    mutation.mutate({ token, password });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>
              This invitation link is missing a required token. Please check your email link or
              contact your admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border text-center">
          <CardHeader>
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Account Activated!</CardTitle>
            <CardDescription>
              Your password has been set and your email is verified. You can now log into
              IncidentOps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push('/login')}>
              Proceed to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-6 flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/25">
          <Zap className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight">IncidentOps</span>
      </div>

      <Card className="max-w-md w-full border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome to IncidentOps</CardTitle>
          <CardDescription>
            Set your account password to complete registration and activate your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                  minLength={8}
                />
                <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  required
                  minLength={8}
                />
                <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Activate Account & Join
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}

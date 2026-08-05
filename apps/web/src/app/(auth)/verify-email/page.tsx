'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/lib/api/auth';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: (data) => {
      setStatus('success');
      setMessage((data.data as any)?.message || 'Email verified');
      toast.success('Email verified successfully!');
    },
    onError: (error: any) => {
      if (error.response?.status === 400) {
        setStatus('expired');
        setMessage('Verification link has expired or is invalid');
      } else {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      }
      toast.error(error.response?.data?.message || 'Verification failed');
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
    } else {
      setStatus('error');
      setMessage('No verification token provided');
    }
  }, [token]);

  const handleResend = () => {
    if (email) {
      router.push(`/resend-verification?email=${encodeURIComponent(email)}`);
    } else {
      router.push('/resend-verification');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="space-y-1 text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl font-bold">Verifying your email</CardTitle>
              <CardDescription>Please wait while we verify your email address</CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold">Email verified!</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold">Verification failed</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}

          {status === 'expired' && (
            <>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-orange-500" />
              </div>
              <CardTitle className="text-2xl font-bold">Link expired</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'success' && (
            <Button className="w-full" onClick={() => router.push('/login')}>
              Go to sign in
            </Button>
          )}

          {(status === 'error' || status === 'expired') && (
            <>
              <Button variant="outline" className="w-full" onClick={handleResend}>
                <Mail className="mr-2 h-4 w-4" />
                Resend verification email
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => router.push('/login')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

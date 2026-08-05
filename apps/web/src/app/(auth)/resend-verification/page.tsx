'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';

const resendSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResendFormData = z.infer<typeof resendSchema>;

function ResendVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromParams = searchParams.get('email');
  const [isSuccess, setIsSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResendFormData>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: emailFromParams || '',
    },
  });

  useEffect(() => {
    if (emailFromParams) {
      setValue('email', emailFromParams);
    }
  }, [emailFromParams, setValue]);

  const resendMutation = useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: (data, variables) => {
      setSentEmail(variables);
      setIsSuccess(true);
      toast.success('Verification email sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send verification email');
    },
  });

  const onSubmit = async (data: ResendFormData) => {
    await resendMutation.mutateAsync(data.email);
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription>
              We've sent a new verification link to
              <br />
              <span className="font-medium text-foreground">{sentEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-4">
                The link will expire in 24 hours. If you don't receive an email, check your spam
                folder.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setIsSuccess(false)}>
              Send another email
            </Button>
            <div className="text-center text-sm">
              <Link href="/login" className="text-primary hover:underline">
                Return to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="space-y-1">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Resend verification email</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a new verification link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                disabled={resendMutation.isPending}
              />
              {errors.email && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4" />
                  {errors.email.message}
                </motion.div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={resendMutation.isPending}>
              {resendMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send verification email'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground inline-flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ResendVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResendVerificationContent />
    </Suspense>
  );
}

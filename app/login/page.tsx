'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/lib/schemas';
import { authApi, ApiError } from '@/lib/api';
import { useAdminAuth } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const login = useAdminAuth((s) => s.login);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    try {
      const res = await authApi.login(data);
      if (res.user.role !== 'ADMIN') {
        setError("This account doesn't have admin access.");
        return;
      }
      login(
        {
          id: res.user.id,
          email: res.user.email,
          displayName: res.user.displayName,
          role: res.user.role,
        },
        res.accessToken,
      );
      router.push('/admin/overview');
    } catch (err) {
      // A network failure is not a rejected password, and calling it one sent us
      // hunting for a credentials bug when the dashboard simply couldn't reach
      // the API at all — which is what happens on a phone if NEXT_PUBLIC_API_URL
      // still points at localhost.
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        const target = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3005/api';
        console.error('[admin] could not reach the API', { target, err });
        setError(
          `Could not reach the server at ${target}. Check that the API is running ` +
            'and that this address is reachable from this device.',
        );
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Signal Face Admin</CardTitle>
          <CardDescription>Sign in with your admin account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" {...form.register('password')} />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Sign In'}
            </Button>
            <div className="text-center">
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

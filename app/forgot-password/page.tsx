'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  emailSchema,
  otpSchema,
  newPasswordSchema,
  type EmailInput,
  type OtpInput,
  type NewPasswordInput,
} from '@/lib/schemas';
import { authApi, ApiError } from '@/lib/api';
import { useAdminAuth } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Step = 'request' | 'reset';

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAdminAuth((s) => s.login);
  const invitedEmail = searchParams.get('email') ?? '';

  const [step, setStep] = useState<Step>(invitedEmail ? 'reset' : 'request');
  const [email, setEmail] = useState(invitedEmail);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(
    invitedEmail ? 'Enter the code we emailed you to set your password.' : null,
  );
  const [resending, setResending] = useState(false);

  const emailForm = useForm<EmailInput>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: invitedEmail },
  });

  const otpForm = useForm<OtpInput>({ resolver: zodResolver(otpSchema), defaultValues: { otp: '' } });

  const passwordForm = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const requestCode = async (data: EmailInput) => {
    setError(null);
    try {
      const res = await authApi.forgotPassword(data);
      setEmail(data.email);
      setInfo(res.message);
      setStep('reset');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    }
  };

  const resendCode = async () => {
    if (!email || resending) return;
    setResending(true);
    setError(null);
    try {
      const res = await authApi.forgotPassword({ email });
      setInfo(res.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resend code.');
    } finally {
      setResending(false);
    }
  };

  const setPassword = async (data: NewPasswordInput) => {
    setError(null);
    try {
      const otp = otpForm.getValues('otp');
      const res = await authApi.resetPassword({ email, otp, password: data.password });
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
      setError(err instanceof ApiError ? err.message : 'Could not set password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">{invitedEmail ? 'Set your password' : 'Forgot password'}</CardTitle>
          <CardDescription>
            {step === 'request'
              ? "Enter your admin account's email and we'll send you a reset code"
              : `Enter the code sent to ${email} and choose a password`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {info && !error && (
            <Alert className="mb-4">
              <AlertDescription>{info}</AlertDescription>
            </Alert>
          )}

          {step === 'request' ? (
            <form onSubmit={emailForm.handleSubmit(requestCode)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" {...emailForm.register('email')} />
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{emailForm.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
                {emailForm.formState.isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  'Send Reset Code'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={passwordForm.handleSubmit(setPassword)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">6-digit code</label>
                <Input maxLength={6} {...otpForm.register('otp')} />
                {otpForm.formState.errors.otp && (
                  <p className="text-xs text-destructive">{otpForm.formState.errors.otp.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">New password</label>
                <Input type="password" {...passwordForm.register('password')} />
                {passwordForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{passwordForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirm password</label>
                <Input type="password" {...passwordForm.register('confirmPassword')} />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  'Set Password'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={resending}
                onClick={resendCode}
              >
                {resending ? 'Sending…' : 'Resend code'}
              </Button>
            </form>
          )}

          <div className="text-center mt-4">
            <Link href="/login" className="text-sm text-primary hover:underline">
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

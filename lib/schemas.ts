import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'Enter the 6-digit code')
    .regex(/^\d+$/, 'Code must be numeric'),
});

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const inviteAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  displayName: z.string().min(1, 'Display name is required').max(60),
});

export const createSignalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(80),
  worth: z.number({ error: 'Worth is required' }).positive('Worth must be a positive number'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type EmailInput = z.infer<typeof emailSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
export type InviteAdminInput = z.infer<typeof inviteAdminSchema>;
export type CreateSignalInput = z.infer<typeof createSignalSchema>;

import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const verifyLogin2FASchema = z.object({
  body: z.object({
    mfaToken: z.string().min(1, 'MFA Token is required'),
    code: z.string().min(1, '6-digit authenticator or backup code is required'),
  }),
});

export const enable2FASchema = z.object({
  body: z.object({
    code: z.string().min(6, '6-digit code from your authenticator app is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
});

export const createSubAdminSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100),
    allowedTabs: z.array(z.string()).optional().default([]),
  }),
});

/**
 * 🛡️ AUTHENTICATION ZOD VALIDATION SCHEMAS:
 * 
 * Real World Analogy: Airport Security Scanner 🔍.
 * Before an incoming HTTP request reaches your controller, Zod inspects the payload shape.
 * If data is malformed (e.g. invalid email format or password < 6 chars), Zod halts the request instantly 
 * with a 400 Bad Request JSON response, protecting your database & logic from bad data!
 * 
 * Execution Flow:
 * Client Request ──> [auth.routes.js] ──> [validate(signupSchema)] ──> [authController.signup]
 */
import { z } from 'zod';
import { paginationQuerySchema } from '../../common/helpers/pagination.helper.js';

export const getSubAdminsQuerySchema = z.object({
  query: paginationQuerySchema,
});

export const getUsersQuerySchema = z.object({
  query: paginationQuerySchema,
});

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
    rememberMe: z.boolean().optional(),
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

export const updateSubAdminSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid SubAdmin ID'),
  }),
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100).optional(),
    email: z.string().email('Please enter a valid email address').optional(),
    allowedTabs: z.array(z.string()).optional(),
  }),
});

export const googleAuthSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, 'Google ID Token is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters').max(100),
  }),
});

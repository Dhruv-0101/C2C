import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { loginSchema } from '../../../validations/auth.validation';
import { useLogin } from '../hooks/useLogin';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Card } from '../../../components/ui/Card';

export const LoginForm = () => {
  const { mutate: login, isPending, error: apiError } = useLogin();
  const { mutate: googleAuth, isPending: isGooglePending, error: googleError } = useGoogleAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data) => {
    login(data);
  };

  const handleGoogleSuccess = (credentialResponse) => {
    if (credentialResponse.credential) {
      googleAuth({ idToken: credentialResponse.credential });
    }
  };

  const activeError = apiError || googleError;

  return (
    <Card className="w-full">
      <div className="space-y-6">
        {/* Form Title */}
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
            <span>Welcome Back</span>
            <span className="inline-block animate-bounce">👋</span>
          </h2>
          <p className="text-sm text-slate-400">
            Sign in to access your AI Social Dashboard & Brand Kits.
          </p>
        </div>

        {/* API Error Alert Banner */}
        {activeError && (
          <Alert
            variant="error"
            title="Authentication Failed"
            message={activeError.message || 'Authentication failed. Please try again.'}
          />
        )}

        {/* Google OAuth Button */}
        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.error('Google Sign-In Failed')}
            theme="filled_black"
            shape="pill"
            text="continue_with"
            width="100%"
          />
        </div>

        {/* Or Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-[#131B2A] px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold absolute">
            Or continue with email
          </span>
        </div>

        {/* Form Controls */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Email Address"
            id="login-email"
            type="email"
            placeholder="name@company.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            id="login-password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/50"
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-amber-400 hover:underline font-medium">
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isPending || isGooglePending}
            icon={LogIn}
            className="w-full mt-2"
          >
            Sign In to Dashboard
          </Button>
        </form>

        {/* Footer Navigation Switch */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 hover:underline transition-colors"
            >
              <span>Create Account</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </Card>
  );
};

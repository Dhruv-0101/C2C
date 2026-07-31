import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react';
import { registerSchema } from '../../../validations/auth.validation';
import { useRegister } from '../hooks/useRegister';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Card } from '../../../components/ui/Card';

export const RegisterForm = () => {
  const { mutate: registerUser, isPending, error: apiError } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data) => {
    registerUser(data);
  };

  return (
    <Card className="w-full">
      <div className="space-y-6">
        {/* Header Title */}
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
            Create Your Account
          </h2>
          <p className="text-sm text-slate-400">
            Join BrandFlow to automate your social brand workflow.
          </p>
        </div>

        {/* API Error Alert Banner */}
        {apiError && (
          <Alert
            variant="error"
            title="Registration Failed"
            message={apiError.message || 'Could not complete account creation. Please check your inputs.'}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Full Name"
            id="register-fullname"
            type="text"
            placeholder="John Doe"
            icon={User}
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          <Input
            label="Email Address"
            id="register-email"
            type="email"
            placeholder="name@company.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            id="register-password"
            type="password"
            placeholder="At least 6 characters"
            icon={Lock}
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirm Password"
            id="register-confirm-password"
            type="password"
            placeholder="Re-enter password"
            icon={Lock}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isPending}
            icon={UserPlus}
            className="w-full mt-2"
          >
            Create Account
          </Button>
        </form>

        {/* Footer Navigation Switch */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 hover:underline transition-colors"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </Card>
  );
};

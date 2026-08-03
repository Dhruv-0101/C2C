import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { authApi } from '../../../services/auth.api';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Card } from '../../../components/ui/Card';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const ForgotPasswordPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await authApi.forgotPassword(data);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0F17] text-slate-100">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-2xl border-slate-800 bg-[#131B2A]/90 backdrop-blur-xl">
          <div className="space-y-6">
            {/* Header Icon & Title */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-white tracking-tight">
                Forgot Your Password?
              </h2>
              <p className="text-sm text-slate-400">
                Enter your account email and we'll send you a password reset link.
              </p>
            </div>

            {errorMessage && (
              <Alert variant="error" title="Error" message={errorMessage} />
            )}

            {isSubmitted ? (
              <div className="space-y-5 text-center py-2">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm space-y-2">
                  <div className="flex items-center justify-center gap-2 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Reset Link Dispatched!</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    If an account exists for <strong className="text-white">{submittedEmail}</strong>, you will receive an email with instructions to reset your password shortly.
                  </p>
                </div>

                <div className="text-xs text-slate-400">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-amber-400 font-semibold hover:underline"
                  >
                    try another email address
                  </button>
                </div>

                <Link to="/login" className="inline-flex w-full">
                  <Button variant="outline" className="w-full justify-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Input
                  label="Registered Email Address"
                  id="forgot-email"
                  type="email"
                  placeholder="name@company.com"
                  icon={Mail}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  icon={Send}
                  className="w-full mt-2"
                >
                  Send Reset Link
                </Button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

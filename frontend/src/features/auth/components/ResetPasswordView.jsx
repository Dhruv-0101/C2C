import React from "react";
import { Link } from "react-router-dom";
import { Lock, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { Card } from "../../../components/ui/Card";

/**
 * ResetPasswordView
 * Pure Presentational Component rendering new password entry form and success confirmation screen.
 */
export const ResetPasswordView = ({
  register,
  handleSubmit,
  errors,
  onSubmit,
  token,
  isLoading,
  isSuccess,
  errorMessage,
  navigate,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0F17] text-slate-100">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-2xl border-slate-800 bg-[#131B2A]/90 backdrop-blur-xl">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-white tracking-tight">
                Reset Your Password
              </h2>
              <p className="text-sm text-slate-400">
                Choose a strong new password for your BrandFlow account.
              </p>
            </div>

            {!token && !isSuccess && (
              <Alert
                variant="error"
                title="Missing Token"
                message="Invalid or missing reset token in URL. Please click the reset link sent to your email address."
              />
            )}

            {errorMessage && (
              <Alert variant="error" title="Reset Failed" message={errorMessage} />
            )}

            {isSuccess ? (
              <div className="space-y-5 text-center py-2">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm space-y-2">
                  <div className="flex items-center justify-center gap-2 font-semibold text-base">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <span>Password Reset Successful!</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Your password has been updated and active login sessions have been secured. You can now sign in with your new password.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate("/login")}
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Input
                  label="New Password"
                  id="reset-new-password"
                  type="password"
                  placeholder="At least 6 characters"
                  icon={Lock}
                  error={errors.newPassword?.message}
                  {...register("newPassword")}
                />

                <Input
                  label="Confirm New Password"
                  id="reset-confirm-password"
                  type="password"
                  placeholder="Re-enter new password"
                  icon={Lock}
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  disabled={!token}
                  className="w-full mt-2"
                >
                  Reset Password & Sign In
                </Button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-amber-400 hover:underline"
                  >
                    Cancel and Return to Sign In
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

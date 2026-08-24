import React from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User, UserPlus, ArrowRight, CheckCircle2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { Card } from "../../../components/ui/Card";

/**
 * RegisterView
 * Pure Presentational Component rendering registration input fields and Google OAuth signup.
 */
export const RegisterView = ({
  register,
  handleSubmit,
  errors,
  onSubmit,
  handleGoogleSuccess,
  activeError,
  isCreating,
  successMessage,
}) => {
  return (
    <Card className="w-full max-w-md mx-auto p-5 sm:p-6 border-[#2C384E] bg-[#131B2A]/90 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-3.5">
        {/* Form Header */}
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Create Free Account ✨
          </h2>
          <p className="text-xs text-slate-400">
            Join BrandFlow to customize frames & auto-fill your BrandKit.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* API Error Alert */}
        {activeError && (
          <Alert
            variant="error"
            title="Registration Failed"
            message={activeError.message || "Could not complete registration. Please check your inputs."}
          />
        )}

        {/* Form Controls */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5" noValidate>
          <Input
            label="Full Name"
            id="register-fullname"
            type="text"
            placeholder="John Doe"
            icon={User}
            disabled={isCreating || !!successMessage}
            error={errors.fullName?.message}
            {...register("fullName")}
          />

          <Input
            label="Email Address"
            id="register-email"
            type="email"
            placeholder="name@company.com"
            icon={Mail}
            disabled={isCreating || !!successMessage}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            id="register-password"
            type="password"
            placeholder="At least 6 characters"
            icon={Lock}
            disabled={isCreating || !!successMessage}
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            label="Confirm Password"
            id="register-confirm-password"
            type="password"
            placeholder="Re-enter password"
            icon={Lock}
            disabled={isCreating || !!successMessage}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isCreating}
            disabled={isCreating || !!successMessage}
            icon={UserPlus}
            className="w-full shadow-lg shadow-amber-500/20 mt-1"
          >
            {isCreating
              ? "Creating Account..."
              : successMessage
              ? "Redirecting..."
              : "Create Account"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-[#131B2A] px-3 text-[10px] text-slate-400 uppercase tracking-wider font-bold absolute">
            Or register with
          </span>
        </div>

        {/* Google OAuth Button */}
        <div className="flex justify-center w-full pt-0.5">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.error("Google Sign-In Failed")}
            theme="filled_black"
            shape="pill"
            text="signup_with"
            width="100%"
          />
        </div>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 hover:underline transition-colors ml-1"
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

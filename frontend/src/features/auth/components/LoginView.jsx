import React from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, LogIn, ArrowRight, CheckCircle2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { Card } from "../../../components/ui/Card";

/**
 * LoginView
 * Pure Presentational Component rendering the login form inputs and Google OAuth buttons.
 */
export const LoginView = ({
  register,
  handleSubmit,
  errors,
  onSubmit,
  handleGoogleSuccess,
  activeError,
  isAuthenticating,
  successMessage,
}) => {
  return (
    <Card className="w-full max-w-md mx-auto p-6 sm:p-7 border-[#2C384E] bg-[#131B2A]/90 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        {/* Form Header */}
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="font-heading text-2xl font-extrabold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
            <span>Welcome Back</span>
            <span className="inline-block animate-bounce">👋</span>
          </h2>
          <p className="text-xs text-slate-400">
            Sign in to access your brand workspace & custom frames.
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
            title="Authentication Failed"
            message={activeError.message || "Authentication failed. Please try again."}
          />
        )}

        {/* Form Controls */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <Input
            label="Email Address"
            id="login-email"
            type="email"
            placeholder="name@company.com"
            icon={Mail}
            disabled={isAuthenticating || !!successMessage}
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            id="login-password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            disabled={isAuthenticating || !!successMessage}
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                disabled={isAuthenticating || !!successMessage}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/50"
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
            isLoading={isAuthenticating}
            disabled={isAuthenticating || !!successMessage}
            icon={LogIn}
            className="w-full shadow-lg shadow-amber-500/20 mt-1"
          >
            {isAuthenticating
              ? "Authenticating..."
              : successMessage
              ? "Redirecting..."
              : "Sign In to Workspace"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-[#131B2A] px-3 text-[10px] text-slate-400 uppercase tracking-wider font-bold absolute">
            Or continue with
          </span>
        </div>

        {/* Google OAuth Button */}
        <div className="flex justify-center w-full pt-1">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.error("Google Sign-In Failed")}
            theme="filled_black"
            shape="pill"
            text="continue_with"
            width="100%"
          />
        </div>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 hover:underline transition-colors ml-1"
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

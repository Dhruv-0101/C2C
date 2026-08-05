import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { MainLayout } from "../layouts/MainLayout";
import { PublicRoute } from "./PublicRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { TwoFactorVerifyPage } from "../features/auth/pages/TwoFactorVerifyPage";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";
import { DashboardPage } from "../pages/DashboardPage";
import { CreatePostPage } from "../pages/CreatePostPage";
import { AdminDashboardPage } from "../pages/AdminDashboardPage";
import { SubAdminDashboardPage } from "../pages/SubAdminDashboardPage";
import { BrandKitPage } from "../pages/BrandKitPage";
import { VaultPage } from "../pages/VaultPage";
import { WelcomeSplashPage } from "../pages/WelcomeSplashPage";
import { useAuth } from "../hooks/useAuth";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  Sparkles,
  Palette,
  Share2,
  FolderKanban,
  BarChart3,
  Settings,
} from "lucide-react";

const GenericPage = ({ title, icon: Icon, description }) => (
  <Card className="p-8 text-center space-y-4 border-[#2C384E] bg-[#131B2A]">
    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
      <Icon className="w-6 h-6" />
    </div>
    <h2 className="font-heading font-extrabold text-2xl text-white">{title}</h2>
    <p className="text-sm text-slate-400 max-w-md mx-auto">{description}</p>
  </Card>
);

export const AppRoutes = () => {
  const { isAuthenticated, isSuperAdmin, isSubAdmin } = useAuth();

  const getHomeRedirect = () => {
    if (!isAuthenticated) return "/welcome";
    if (isSuperAdmin) return "/admin/dashboard";
    if (isSubAdmin) return "/subadmin/dashboard";
    return "/dashboard";
  };

  return (
    <Routes>
      {/* Root Route Redirect */}
      <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />

      {/* Public Welcome Splash Experience */}
      <Route path="/welcome" element={<WelcomeSplashPage />} />

      {/* Public Guest Auth Routes & 2FA Challenge */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-2fa" element={<TwoFactorVerifyPage />} />
        </Route>
      </Route>

      {/* Protected Shared Workspace Routes (SuperAdmin, SubAdmin, SMB Users) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/create-post" element={<CreatePostPage />} />
          <Route path="/brand-kit" element={<BrandKitPage />} />
          <Route path="/brandkit" element={<BrandKitPage />} />
          <Route
            path="/connections"
            element={
              <GenericPage
                title="Social Media Connections"
                icon={Share2}
                description="Connect Instagram, LinkedIn, X, and Facebook accounts for automated publishing."
              />
            }
          />
          <Route
            path="/vault"
            element={<VaultPage />}
          />
          <Route
            path="/analytics"
            element={
              <GenericPage
                title="Growth & Analytics Engine"
                icon={BarChart3}
                description="Track post engagement, follower reach, and campaign ROI metrics."
              />
            }
          />
          <Route
            path="/settings"
            element={
              <GenericPage
                title="Account & Security Settings"
                icon={Settings}
                description="Manage account details, password updates, and 2FA security preferences."
              />
            }
          />
        </Route>
      </Route>

      {/* Protected SuperAdmin Routes */}
      <Route element={<ProtectedRoute requireSuperAdmin />}>
        <Route element={<MainLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Route>
      </Route>

      {/* Protected SubAdmin Routes */}
      <Route element={<ProtectedRoute requireSubAdmin />}>
        <Route element={<MainLayout />}>
          <Route
            path="/subadmin/dashboard"
            element={<SubAdminDashboardPage />}
          />
        </Route>
      </Route>

      {/* Catch-all 404 Route */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0F17] text-white">
            <Card className="max-w-md w-full text-center space-y-4">
              <h1 className="font-heading font-extrabold text-6xl text-amber-500">
                404
              </h1>
              <h2 className="font-heading font-bold text-xl">Page Not Found</h2>
              <p className="text-sm text-slate-400">
                The requested page does not exist or has been relocated.
              </p>
              <Button
                variant="primary"
                onClick={() => (window.location.href = "/")}
                className="w-full"
              >
                Return to Home
              </Button>
            </Card>
          </div>
        }
      />
    </Routes>
  );
};

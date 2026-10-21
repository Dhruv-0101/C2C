import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/layouts/AppLayout/components/Header';
import { Footer } from '@/layouts/AppLayout/components/Footer';
import { AuthHeroBanner } from './components/AuthHeroBanner';
import { AuthLoader } from '@/components/feedback/AuthLoader';

/**
 * Authentication Shell (Login, Register, Forgot Password)
 * Keeps Header, Footer, and AuthHeroBanner permanently mounted with zero layout shifts.
 */
export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0B0F17] text-slate-100 font-body relative overflow-x-hidden">
      {/* Background Radial Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-amber-500/10 blur-[100px] sm:blur-[120px] pointer-events-none animate-pulse duration-[7000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-teal-500/10 blur-[100px] sm:blur-[120px] pointer-events-none animate-pulse duration-[7000ms]" />

      <Header />

      <main className="flex-1 flex items-center justify-center py-6 sm:py-10 px-3.5 sm:px-6 relative z-10 min-h-0 w-full">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Visual Brand Hero & Features */}
          <div className="lg:col-span-6 hidden lg:block">
            <AuthHeroBanner />
          </div>

          {/* Right Column: Form Container */}
          <div className="lg:col-span-6 flex justify-center w-full min-w-0">
            <Suspense fallback={<AuthLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthLayout;


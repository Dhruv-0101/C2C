import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/layouts/AppLayout/components/Header';
import { Footer } from '@/layouts/AppLayout/components/Footer';
import { AuthHeroBanner } from './components/AuthHeroBanner';

/**
 * Authentication Shell (Login, Register, Forgot Password)
 */
export const AuthLayout = () => {
  return (
    <div className="h-screen flex flex-col justify-between bg-[#0B0F17] text-slate-100 font-body relative overflow-hidden">
      {/* Background Radial Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none animate-pulse duration-[7000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none animate-pulse duration-[7000ms]" />

      <Header />

      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 relative z-10 overflow-hidden">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Visual Brand Hero & Features */}
          <div className="lg:col-span-6 hidden lg:block">
            <AuthHeroBanner />
          </div>

          {/* Right Column: Form Container */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <Outlet />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthLayout;

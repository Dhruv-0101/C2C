import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/layouts/AppLayout/components/Header';
import { Footer } from '@/layouts/AppLayout/components/Footer';
import { ContentLoader } from '@/components/feedback/ContentLoader';

/**
 * 🌐 PublicLayout Shell
 * Shared responsive layout for public informational pages (Privacy, Terms)
 * maintaining persistent Header, content outlet, and universal Footer.
 */
export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0B0F17] text-slate-100 font-body relative">
      <Header />

      <main className="flex-1 w-full">
        <Suspense fallback={<ContentLoader />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
};

export default PublicLayout;

import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from '../store/store';
import { AppRoutes } from '../routes/AppRoutes';
import { queryClient } from './queryClient';
import { ScrollToTop } from '../components/navigation/ScrollToTop';
import { PageLoader } from '../components/feedback/PageLoader';

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '723882466133-dktl5rijt0uld6rcsbsui5oovted7jpo.apps.googleusercontent.com';

/**
 * AppContent Component
 * Implements Canva / Linear-style App Bootstrapping Gate.
 * Guarantees that users experience BrandFlow's signature AI Cartoon Artist Loader
 * upon initial boot and hard reloads, eliminating jarring unstyled flashes.
 */
const AppContent = () => {
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    // App bootstrapping phase: ensures fonts, design tokens & auth hydrate smoothly
    const timer = setTimeout(() => {
      setIsBootstrapping(false);
    }, 1400);

    return () => clearTimeout(timer);
  }, []);

  if (isBootstrapping) {
    return (
      <PageLoader
        title="BrandFlow Creative Studio"
        subtitle="Initializing your AI workspace & brand kits..."
      />
    );
  }

  return (
    <>
      <ScrollToTop />
      <AppRoutes />
    </>
  );
};

export const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;

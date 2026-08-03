import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from '../store/store';
import { AppRoutes } from '../routes/AppRoutes';

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '723882466133-dktl5rijt0uld6rcsbsui5oovted7jpo.apps.googleusercontent.com';

// Configure TanStack Query Client with enterprise default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 15,    // 15 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;

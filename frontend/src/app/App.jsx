import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from '../store/store';
import { AppRoutes } from '../routes/AppRoutes';
import { queryClient } from './queryClient';

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '723882466133-dktl5rijt0uld6rcsbsui5oovted7jpo.apps.googleusercontent.com';

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


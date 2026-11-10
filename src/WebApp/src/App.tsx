import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/routes';
import { AuthInitializer } from '@/features/auth/components/AuthInitializer';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '283809283266-nktc2vof21qbapr0a9f46vgod5lnujm4.apps.googleusercontent.com';

export const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>
          <RouterProvider router={router} />
        </AuthInitializer>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;

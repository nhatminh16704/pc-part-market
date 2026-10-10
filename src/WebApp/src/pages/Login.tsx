import React from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const Login: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
};

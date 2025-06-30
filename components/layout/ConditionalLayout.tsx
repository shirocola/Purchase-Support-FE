'use client';

import { usePathname } from 'next/navigation';
import { MainLayout } from './MainLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password'];

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Check if current path is an auth page
  const isAuthPage = AUTH_PATHS.some(path => pathname.startsWith(path));
  
  if (isAuthPage) {
    // For auth pages, just render children without MainLayout
    return (
      <AuthGuard requireAuth={false}>
        {children}
      </AuthGuard>
    );
  }
  
  // For all other pages, wrap with MainLayout and require auth
  return (
    <AuthGuard>
      <MainLayout>
        {children}
      </MainLayout>
    </AuthGuard>
  );
}
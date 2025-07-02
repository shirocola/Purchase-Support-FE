'use client';

import { usePathname } from 'next/navigation';
import { MainLayout } from './MainLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password'];
const PUBLIC_PATHS = ['/', '/components-showcase']; // Pages that don't require authentication

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Check if current path is an auth page
  const isAuthPage = AUTH_PATHS.some(path => pathname.startsWith(path));
  
  // Check if current path is a public page (no auth required)
  const isPublicPage = PUBLIC_PATHS.some(path => pathname === path);
  
  if (isAuthPage) {
    // For auth pages, just render children without MainLayout
    return (
      <AuthGuard requireAuth={false}>
        {children}
      </AuthGuard>
    );
  }
  
  if (isPublicPage) {
    // For public pages, render with MainLayout but no auth required
    return (
      <AuthGuard requireAuth={false}>
        <MainLayout>
          {children}
        </MainLayout>
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
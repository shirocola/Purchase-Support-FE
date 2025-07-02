'use client';

import { usePathname } from 'next/navigation';
import { MainLayout } from './MainLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/lib/contexts/auth-context';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/callback'];
const PUBLIC_PATHS = ['/components-showcase']; // Pages that don't require authentication but allow authenticated users
const MIXED_PATHS = ['/']; // Pages that work for both authenticated and unauthenticated users

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Check if current path is an auth page
  const isAuthPage = AUTH_PATHS.some(path => pathname.startsWith(path));
  
  // Check if current path is a public page (no auth required)
  const isPublicPage = PUBLIC_PATHS.some(path => pathname === path);
  
  // Check if current path allows both auth states (like homepage)
  const isMixedPage = MIXED_PATHS.some(path => pathname === path);
  
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
  
  if (isMixedPage) {
    // For mixed pages (like homepage), don't enforce any auth requirement
    // Just render with MainLayout regardless of auth status
    // Use key to force remount when auth state changes to prevent hooks violations
    return (
      <MainLayout key={user ? 'authenticated' : 'unauthenticated'}>
        {children}
      </MainLayout>
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
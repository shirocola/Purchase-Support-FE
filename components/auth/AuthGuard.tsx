'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '@/lib/contexts/auth-context';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * AuthGuard component that protects routes based on authentication status
 */
export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo,
  fallback 
}: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (isLoading) return; // Don't redirect while loading

    if (requireAuth && !isAuthenticated) {
      // User needs to be authenticated but isn't
      const defaultRedirect = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(redirectTo || defaultRedirect);
      return;
    }

    if (!requireAuth && isAuthenticated) {
      // User shouldn't be on this page if authenticated (e.g., login page)
      router.push(redirectTo || '/');
      return;
    }
  }, [isLoading, isAuthenticated, requireAuth, router, pathname, redirectTo]);

  // Show loading state only while checking auth
  if (isLoading) {
    return fallback || <AuthLoadingFallback />;
  }

  // User is in correct auth state, render children
  return <>{children}</>;
}

/**
 * Default loading fallback component
 */
function AuthLoadingFallback({ message = 'กำลังตรวจสอบสิทธิ์การเข้าใช้...' }: { message?: string }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress size={40} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

/**
 * Higher-order component for protecting pages
 */
export function withAuthGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<AuthGuardProps, 'children'> = {}
) {
  const GuardedComponent = (props: P) => {
    return (
      <AuthGuard {...options}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };
  
  GuardedComponent.displayName = `withAuthGuard(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return GuardedComponent;
}

/**
 * Hook for checking auth status in components
 */
export function useRequireAuth(redirectTo?: string) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const defaultRedirect = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(redirectTo || defaultRedirect);
    }
  }, [isLoading, isAuthenticated, router, pathname, redirectTo]);
  
  return { isAuthenticated, isLoading };
}

export default AuthGuard;
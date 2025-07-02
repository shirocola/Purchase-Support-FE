'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { canAccessRoute, getRedirectRoute } from '@/lib/utils/role-routing';
import { Box, CircularProgress, Typography } from '@mui/material';

interface RoleGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * RoleGuard component that restricts access to routes based on user role
 * Automatically redirects users to appropriate pages if they don't have access
 */
export default function RoleGuard({ children, fallback }: RoleGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything while auth is loading
    if (isLoading) return;

    // If not authenticated, let AuthGuard handle it
    if (!isAuthenticated || !user) return;

    // Check if user can access current route
    const hasAccess = canAccessRoute(user.role, pathname);
    
    if (!hasAccess) {
      // Get redirect route for this user role
      const redirectRoute = getRedirectRoute(user.role, pathname);
      
      if (redirectRoute) {
        console.log(`User role ${user.role} cannot access ${pathname}, redirecting to ${redirectRoute}`);
        router.replace(redirectRoute);
      }
    }
  }, [user, pathname, router, isLoading, isAuthenticated]);

  // Show loading while checking permissions
  if (isLoading) {
    return (
      fallback || (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="200px"
          gap={2}
        >
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            กำลังตรวจสอบสิทธิ์การเข้าถึง...
          </Typography>
        </Box>
      )
    );
  }

  // If not authenticated, let AuthGuard handle it
  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  // Check if user has access to current route
  const hasAccess = canAccessRoute(user.role, pathname);
  
  if (!hasAccess) {
    // Show access denied while redirecting
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="400px"
        gap={2}
        p={3}
      >
        <Typography variant="h6" color="error">
          ไม่มีสิทธิ์เข้าถึงหน้านี้
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          บทบาทของคุณ ({user.role}) ไม่มีสิทธิ์เข้าถึงหน้า {pathname}
          <br />
          กำลังเปลี่ยนเส้นทางไปยังหน้าที่เหมาะสม...
        </Typography>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // User has access, render children
  return <>{children}</>;
}

/**
 * Higher-order component to wrap pages that need role-based protection
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function ProtectedComponent(props: P) {
    return (
      <RoleGuard fallback={fallback}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}

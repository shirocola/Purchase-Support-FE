'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/contexts/auth-context';
import { RoleManager, AllowedRole } from '../../lib/utils/role-management';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  CircularProgress 
} from '@mui/material';
import { Warning, Home } from '@mui/icons-material';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: AllowedRole | AllowedRole[];
  fallback?: React.ReactNode;
  /** Custom redirect path for unauthorized users */
  redirectTo?: string;
  /** Show debug info even in production */
  showDebugInfo?: boolean;
}

/**
 * RoleGuard Component - Route protection based on user roles
 * 
 * Features:
 * - RBAC (Role-Based Access Control)
 * - Accessibility compliant (ARIA attributes)
 * - Development debugging support
 * - Custom fallback components
 * - Responsive design
 * 
 * @param children - Components to render when access is granted
 * @param requiredRole - Required role(s) for access
 * @param fallback - Optional custom error UI
 * @param redirectTo - Custom redirect path (default: '/')
 * @param showDebugInfo - Force show debug info in production
 */
export function RoleGuard({ 
  children, 
  requiredRole, 
  fallback,
  redirectTo = '/',
  showDebugInfo = false
}: RoleGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Not authenticated - return null to prevent flash of content
  if (!isAuthenticated || !user) {
    return null;
  }

  // Role validation
  const currentRole = user.role;
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const hasAccess = currentRole && allowedRoles.includes(currentRole as AllowedRole);

  // Access denied
  if (!hasAccess) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <AccessDeniedScreen 
        currentRole={currentRole}
        allowedRoles={allowedRoles}
        redirectTo={redirectTo}
        showDebugInfo={showDebugInfo}
      />
    );
  }

  // Access granted
  return <>{children}</>;
}

/**
 * Loading state component - extracted for reusability
 */
function LoadingState() {
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="50vh"
      role="status"
      aria-label="กำลังตรวจสอบสิทธิ์"
    >
      <CircularProgress size={40} />
      <Typography variant="body2" sx={{ ml: 2 }}>
        กำลังตรวจสอบสิทธิ์...
      </Typography>
    </Box>
  );
}

/**
 * Access denied screen component - extracted for better testing
 */
interface AccessDeniedScreenProps {
  currentRole: string | null;
  allowedRoles: AllowedRole[];
  redirectTo: string;
  showDebugInfo: boolean;
}

function AccessDeniedScreen({ 
  currentRole, 
  allowedRoles, 
  redirectTo,
  showDebugInfo 
}: AccessDeniedScreenProps) {
  const router = useRouter();
  
  const shouldShowDebug = showDebugInfo || process.env.NODE_ENV === 'development';

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="50vh"
      sx={{ textAlign: 'center', p: 3 }}
      role="alert"
      aria-labelledby="access-denied-title"
    >
      <Warning 
        color="warning" 
        sx={{ fontSize: 64, mb: 2 }} 
        aria-hidden="true"
      />
      
      <Typography 
        id="access-denied-title"
        variant="h5" 
        gutterBottom
        component="h1"
      >
        ไม่มีสิทธิ์เข้าถึง
      </Typography>
      
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ mb: 2 }}
      >
        คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (ต้องการสิทธิ์: {allowedRoles.join(' หรือ ')})
      </Typography>
      
      {/* Debug info */}
      {shouldShowDebug && (
        <DebugInfo currentRole={currentRole} allowedRoles={allowedRoles} />
      )}
      
      <Button
        variant="contained"
        startIcon={<Home />}
        onClick={() => router.push(redirectTo)}
        size="large"
        sx={{ mt: 2 }}
      >
        กลับหน้าแรก
      </Button>
    </Box>
  );
}

/**
 * Debug information component - extracted for better organization
 */
interface DebugInfoProps {
  currentRole: string | null;
  allowedRoles: AllowedRole[];
}

function DebugInfo({ currentRole, allowedRoles }: DebugInfoProps) {
  return (
    <Alert severity="info" sx={{ mb: 3, textAlign: 'left', maxWidth: 400 }}>
      <Typography variant="body2">
        <strong>🔍 Debug Info:</strong><br />
        Current Role: <code>"{currentRole || 'null'}"</code><br />
        Required Roles: <code>{JSON.stringify(allowedRoles)}</code><br />
        Is Valid Role: <code>{currentRole ? RoleManager.isValidRole(currentRole).toString() : 'false'}</code>
      </Typography>
    </Alert>
  );
}

// Export sub-components for testing
export { LoadingState, AccessDeniedScreen, DebugInfo };
'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CircularProgress, Box, Typography, Button, Alert } from '@mui/material';
import { Warning, Home } from '@mui/icons-material';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: 'AppUser' | 'MaterialControl';
}

export function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth(); // ✅ ลบ getCurrentUserRole ออก
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    console.log('🔍 [ROLE_GUARD] Loading...');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ [ROLE_GUARD] Not authenticated');
    return null;
  }

  // ✅ ใช้ user.role โดยตรง แทน getCurrentUserRole()
  const currentRole = user?.role;
  
  console.log('🔍 [ROLE_GUARD] Role check:', {
    currentRole,
    requiredRole,
    user: user,
    hasAccess: currentRole === requiredRole
  });

  // ✅ ตรวจสอบสิทธิ์ตาม role
  if (currentRole !== requiredRole) {
    console.log('❌ [ROLE_GUARD] Access denied');
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        sx={{ textAlign: 'center', p: 3 }}
      >
        <Warning color="warning" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          ไม่มีสิทธิ์เข้าถึง
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (ต้องการสิทธิ์: {requiredRole})
        </Typography>
        
        {/* Debug Info - แสดงเฉพาะใน development */}
        {process.env.NODE_ENV === 'development' && (
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>Debug Info:</strong><br />
              Current Role: "{currentRole}" <br />
              Required Role: "{requiredRole}" <br />
              User: {user ? JSON.stringify(user, null, 2) : 'null'}
            </Typography>
          </Alert>
        )}
        
        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={() => router.push('/')}
        >
          กลับหน้าแรก
        </Button>
      </Box>
    );
  }

  console.log('✅ [ROLE_GUARD] Access granted');
  return <>{children}</>;
}
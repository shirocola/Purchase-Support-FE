// components/guards/RoleGuard.tsx
'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CircularProgress, Box, Typography, Button } from '@mui/material';
import { Warning, Home } from '@mui/icons-material';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: 'AppUser' | 'MaterialControl';
}

export function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const { isAuthenticated, isLoading, getCurrentUserRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const currentRole = getCurrentUserRole();

  // ✅ ตรวจสอบสิทธิ์ตาม role
  if (currentRole !== requiredRole) {
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
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (ต้องการสิทธิ์: {requiredRole})
        </Typography>
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

  return <>{children}</>;
}
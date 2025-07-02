'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Box,
  Container,
  Paper,
  Button,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useAuth } from '@/lib/contexts/auth-context';

interface LoginFormErrors {
  general?: string;
}

export default function LoginPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuth();
  
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);
  
  // Show loading while checking auth status
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        data-testid="auth-loading"
      >
        <CircularProgress />
      </Box>
    );
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // For AD authentication, redirect to backend AD auth endpoint
      // This will initiate the AD OAuth flow
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
      const redirectUrl = `${apiBaseUrl}/auth/ad/login`;
      
      // Redirect to backend AD authentication
      window.location.href = redirectUrl;
      
    } catch (error) {
      console.error('Login failed:', error);
      
      let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'ไม่สามารถเข้าสู่ระบบได้';
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({ general: errorMessage });
      setIsSubmitting(false);
    }
  };
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(to right, #D0EDFF, #E5E4E2)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: isMobile ? 3 : 4,
            borderRadius: 2,
            background: theme.palette.background.paper,
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <Image
                src="/PurchaseSupport.Logo.png"
                alt="Purchase Support Logo"
                width={240}
                height={120}
                priority
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
            </Box>
          </Box>
          
          {/* Error Alert */}
          {errors.general && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              data-testid="login-error"
            >
              {errors.general}
            </Alert>
          )}
          
          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                backgroundColor: 'rgb(15, 17, 119)',
                borderColor: 'rgb(255, 255, 255)',
                border: '2px solid rgb(255, 255, 255)',
                '&:hover': {
                  backgroundColor: 'rgb(12, 14, 95)',
                  borderColor: 'rgb(255, 255, 255)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(15, 17, 119, 0.5)',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              }}
              data-testid="login-button"
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  กำลังเปลี่ยนเส้นทางไป AD...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </Box>
          
          {/* Footer */}
          <Box textAlign="center" mt={4}>
            <Typography variant="body2" color="text.secondary">
              © 2024 Purchase Order Management System
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
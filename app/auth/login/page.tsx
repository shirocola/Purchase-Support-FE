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
  Chip,
} from '@mui/material';
import { useAuth } from '@/lib/contexts/auth-context';

interface LoginFormErrors {
  general?: string;
}

interface AuthResponse {
  success: boolean;
  authUrl?: string;
  token?: string;
  user?: any;
  message?: string;
}

export default function LoginPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuth();
  
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if mock auth is enabled
  const isMockAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true';
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
  const testAuthCode = process.env.NEXT_PUBLIC_TEST_AUTH_CODE || 'admin-auth-code';
  
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
  
  const handleTestLogin = async () => {
    try {
      // Use auth context mock login instead of making HTTP requests
      await login({
        username: 'material.control', // Default test user
        password: 'password'
      });
      
      // Auth context will handle the authentication and redirect will happen via useEffect
      console.log('Mock login successful');
      
    } catch (error) {
      console.error('Test login failed:', error);
      
      let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบแบบทดสอบ';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
      setIsSubmitting(false);
    }
  };
  
  const handleAzureLogin = async () => {
    try {
      // Call backend to get Azure AD authentication URL
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AuthResponse = await response.json();
      
      // Check if response contains authUrl
      if (data.success && data.authUrl) {
        // Redirect to Azure AD authentication URL
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.message || 'ไม่สามารถเชื่อมต่อกับ Azure AD ได้');
      }
      
    } catch (error) {
      console.error('Azure login failed:', error);
      
      let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'ไม่สามารถเข้าสู่ระบบได้';
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({ general: errorMessage });
      setIsSubmitting(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setErrors({});
    
    if (isMockAuthEnabled) {
      await handleTestLogin();
    } else {
      await handleAzureLogin();
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
            
            {/* Environment indicator */}
            {isMockAuthEnabled && (
              <Box sx={{ mb: 2 }}>
                <Chip
                  label="TEST MODE"
                  color="warning"
                  variant="outlined"
                  size="small"
                />
              </Box>
            )}
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
                backgroundColor: isMockAuthEnabled ? 'rgb(255, 152, 0)' : 'rgb(15, 17, 119)',
                borderColor: 'rgb(255, 255, 255)',
                border: '2px solid rgb(255, 255, 255)',
                '&:hover': {
                  backgroundColor: isMockAuthEnabled ? 'rgb(230, 136, 0)' : 'rgb(12, 14, 95)',
                  borderColor: 'rgb(255, 255, 255)',
                },
                '&:disabled': {
                  backgroundColor: isMockAuthEnabled ? 'rgba(255, 152, 0, 0.5)' : 'rgba(15, 17, 119, 0.5)',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              }}
              data-testid="login-button"
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  {isMockAuthEnabled ? 'กำลังเข้าสู่ระบบแบบทดสอบ...' : 'กำลังเชื่อมต่อกับ Azure AD...'}
                </>
              ) : (
                isMockAuthEnabled ? 'เข้าสู่ระบบแบบทดสอบ (Test Login)' : 'เข้าสู่ระบบด้วย Azure AD'
              )}
            </Button>
            
            {isMockAuthEnabled && (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
                ระบบจะใช้รหัสทดสอบ: {testAuthCode}
              </Typography>
            )}
          </Box>
          
          {/* Footer */}
          <Box textAlign="center" mt={4}>
            <Typography variant="body2" color="text.secondary">
              © 2024 Purchase Order Management System
            </Typography>
            {isMockAuthEnabled && (
              <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
                Development/Test Environment
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/auth-context';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginFormErrors {
  username?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
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
  
  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    }
    
    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 3) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 3 ตัวอักษร';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      await login(formData);
      
      // Redirect after successful login
      const redirectTo = searchParams.get('redirect') || '/';
      router.push(redirectTo);
    } catch (error) {
      console.error('Login failed:', error);
      
      let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
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
                src="/PurchaseSupport.Logo.svg"
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
            <Typography 
              variant={isMobile ? 'h5' : 'h4'} 
              component="h1" 
              gutterBottom
              fontWeight="bold"
            >
              ระบบจัดการใบสั่งซื้อ
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
            >
              เข้าสู่ระบบเพื่อเริ่มการทำงาน (AD Authentication)
            </Typography>
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
            <TextField
              fullWidth
              label="ชื่อผู้ใช้"
              variant="outlined"
              value={formData.username}
              onChange={handleInputChange('username')}
              error={!!errors.username}
              helperText={errors.username}
              margin="normal"
              autoComplete="username"
              autoFocus
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color={errors.username ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
              data-testid="username-input"
            />
            
            <TextField
              fullWidth
              label="รหัสผ่าน"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              autoComplete="current-password"
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color={errors.password ? 'error' : 'action'} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              data-testid="password-input"
            />
            
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
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ'
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
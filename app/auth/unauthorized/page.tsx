'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert
} from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2440AF 0%, #13256C 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: { xs: '100%', sm: 500 },
          maxWidth: 500,
          p: 4,
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <ErrorOutline 
          sx={{ 
            fontSize: 80, 
            color: 'error.main',
            mb: 2 
          }} 
        />
        
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: 'error.main'
          }}
        >
          ไม่มีสิทธิ์เข้าใช้งาน
        </Typography>

        <Typography
          variant="h6"
          sx={{
            mb: 3,
            color: 'text.secondary'
          }}
        >
          Unauthorized Access
        </Typography>

        <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>เหตุผลที่เป็นไปได้:</strong>
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>บัญชีผู้ใช้ของคุณไม่มีสิทธิ์เข้าใช้งานระบบ</li>
            <li>Role ที่ได้รับไม่ถูกต้องหรือไม่ได้รับการอนุมัติ</li>
            <li>ติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์เข้าใช้งาน</li>
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            component={Link}
            href="/auth/login"
            variant="contained"
            color="primary"
            size="large"
          >
            เข้าสู่ระบบใหม่
          </Button>
          
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            onClick={() => window.history.back()}
          >
            ย้อนกลับ
          </Button>
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 3,
            color: 'text.secondary'
          }}
        >
          หากต้องการความช่วยเหลือ กรุณาติดต่อผู้ดูแลระบบ
        </Typography>
      </Paper>
    </Box>
  );
}
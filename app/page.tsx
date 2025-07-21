'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../lib/contexts/auth-context';
import { getDefaultRouteForRole, isValidRole } from '../lib/utils/role-routing';
import { Box, CircularProgress, Typography, Paper, Alert } from '@mui/material';
import { UserRole } from '@/lib/types/po';

export default function HomePage() {
  const { user } = useAuth();
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLog(prev => [...prev, logMessage]);
  };

  useEffect(() => {
    addLog('HomePage useEffect triggered');
    addLog(`User state: ${user ? 'Authenticated' : 'Not authenticated'}`);
    
    if (user) {
      addLog(`User data: ${JSON.stringify(user, null, 2)}`);
      addLog(`User role: "${user.role}" (type: ${typeof user.role})`);
      
      // Step 1: Check if role exists
      if (!user.role) {
        addLog('❌ User role is missing or empty');
        addLog('Redirecting to /auth/unauthorized');
        setTimeout(() => {
          window.location.href = '/auth/unauthorized';
        }, 2000); // รอ 2 วินาทีเพื่อให้เห็น log
        return;
      }

      // Step 2: Check if role is valid
      const roleIsValid = isValidRole(user.role);
      addLog(`Role validation result: ${roleIsValid}`);
      addLog(`Valid roles: ['AppUser', 'MaterialControl']`);
      
      if (!roleIsValid) {
        addLog(`❌ Invalid role: "${user.role}"`);
        addLog('Redirecting to /auth/unauthorized');
        setTimeout(() => {
          window.location.href = '/auth/unauthorized';
        }, 2000);
        return;
      }

      // Step 3: Get redirect route
      const redirectRoute = getDefaultRouteForRole(user.role as UserRole);
      addLog(`✅ Valid role detected`);
      addLog(`Redirect route: ${redirectRoute}`);
      addLog('Redirecting in 2 seconds...');
      
      setTimeout(() => {
        window.location.href = redirectRoute;
      }, 2000);
      
    } else {
      addLog('User is not authenticated');
      addLog('Redirecting to /auth/login in 2 seconds...');
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    }
  }, [user]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        p: 2
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        กำลังตรวจสอบสิทธิ์...
      </Typography>

      {/* Debug Panel - แสดงเฉพาะใน development */}
      {process.env.NODE_ENV === 'development' && (
        <Paper 
          sx={{ 
            mt: 4, 
            p: 2, 
            maxWidth: 800, 
            width: '100%',
            maxHeight: 400,
            overflow: 'auto',
            backgroundColor: '#f5f5f5' 
          }}
        >
          <Typography variant="h6" gutterBottom>
            🔍 Debug Log
          </Typography>
          
          {user && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Current User:</strong><br />
                Email: {user.email}<br />
                Role: "{user.role}" ({typeof user.role})
              </Typography>
            </Alert>
          )}

          <Box 
            component="pre" 
            sx={{ 
              fontSize: '12px', 
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              margin: 0 
            }}
          >
            {debugLog.join('\n')}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
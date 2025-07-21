'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../lib/contexts/auth-context';
import { RoleManager } from '../lib/utils/role-management'; // ✅ Single source
import { Box, CircularProgress, Typography, Paper, Alert } from '@mui/material';

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
      
      if (!user.role) {
        addLog('❌ User role is missing or empty');
        addLog('Redirecting to /auth/unauthorized');
        setTimeout(() => {
          window.location.href = '/auth/unauthorized';
        }, 2000);
        return;
      }

      // ✅ ใช้ RoleManager แทน
      const roleIsValid = RoleManager.isValidRole(user.role);
      addLog(`Role validation result: ${roleIsValid}`);
      
      if (!roleIsValid) {
        addLog('❌ Invalid role detected');
        addLog('Redirecting to /auth/unauthorized');
        setTimeout(() => {
          window.location.href = '/auth/unauthorized';
        }, 2000);
        return;
      }

      // ✅ ใช้ RoleManager สำหรับ redirect
      const defaultRoute = RoleManager.getDefaultRouteForRole(user.role);
      addLog(`Default route for role "${user.role}": ${defaultRoute}`);
      addLog('Redirecting in 3 seconds...');
      
      setTimeout(() => {
        addLog('Redirecting now...');
        window.location.href = defaultRoute;
      }, 3000);
    } else {
      addLog('No user found, staying on homepage');
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
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Chip,
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  SwapHoriz,
  Logout,
  Person,
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/auth-context';
import { UserRole } from '@/lib/types/po';

interface MainLayoutProps {
  children: React.ReactNode;
}

const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'ผู้ดูแลระบบ',
  [UserRole.MATERIAL_CONTROL]: 'เจ้าหน้าที่จัดซื้อ',
  [UserRole.APP_USER]: 'ผู้ใช้ทั่วไป',
  [UserRole.VENDOR]: 'ผู้ขาย',
};

export function MainLayout({ children }: MainLayoutProps) {
  const { user, switchRole, logout } = useAuth();
  const router = useRouter();
  
  const [roleMenuAnchor, setRoleMenuAnchor] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleRoleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setRoleMenuAnchor(event.currentTarget);
  };

  const handleRoleMenuClose = () => {
    setRoleMenuAnchor(null);
  };

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    handleRoleMenuClose();
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleUserMenuClose();
      // Redirect to login page after logout
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, close menu and redirect to login
      handleUserMenuClose();
      router.push('/auth/login');
    }
  };

  if (!user) {
    // For public pages, render without user-specific features
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: 'rgb(15, 17, 119)',
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              ระบบจัดการใบสั่งซื้อ
            </Typography>
            {/* Show login button when not authenticated */}
            <Button
              color="inherit"
              variant="outlined"
              href="/auth/login"
              sx={{ 
                ml: 2,
                borderColor: 'white',
                '&:hover': { borderColor: 'rgba(255, 255, 255, 0.7)' }
              }}
            >
              เข้าสู่ระบบ
            </Button>
          </Toolbar>
        </AppBar>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8, // Account for AppBar height
          }}
        >
          {children}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'rgb(15, 17, 119)',
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ระบบจัดการใบสั่งซื้อ
          </Typography>

          {/* User Menu and Role Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* User Info and Menu */}
            <Button
              color="inherit"
              startIcon={<Person />}
              onClick={handleUserMenuOpen}
              size="small"
              sx={{ 
                textTransform: 'none',
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
              variant="outlined"
            >
              {user.username}
            </Button>

            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem disabled>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {user.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                  <Chip
                    label={roleLabels[user.role]}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout fontSize="small" sx={{ mr: 1 }} />
                ออกจากระบบ
              </MenuItem>
            </Menu>
            
            {/* Role Indicator */}
            <Chip
              label={roleLabels[user.role]}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ 
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '& .MuiChip-label': {
                  color: 'white',
                },
              }}
            />
            
            {/* Role Switcher (Development Feature) */}
            {process.env.NODE_ENV === 'development' && (
              <Button
                color="inherit"
                startIcon={<SwapHoriz />}
                onClick={handleRoleMenuOpen}
                size="small"
                sx={{ 
                  ml: 1,
                  textTransform: 'none',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
                variant="outlined"
              >
                เปลี่ยนบทบาท
              </Button>
            )}
            
            <Menu
              anchorEl={roleMenuAnchor}
              open={Boolean(roleMenuAnchor)}
              onClose={handleRoleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {Object.entries(roleLabels).map(([role, label]) => (
                <MenuItem
                  key={role}
                  onClick={() => handleRoleSwitch(role as UserRole)}
                  selected={user.role === role}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountCircle fontSize="small" />
                    {label} ({role})
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8, // Account for AppBar height
          bgcolor: 'background.default',
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
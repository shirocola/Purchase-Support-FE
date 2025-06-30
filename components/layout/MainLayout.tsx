'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Button,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  SwapHoriz,
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/auth-context';
import { Sidebar } from './Sidebar';
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
  const { user, switchRole } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [roleMenuAnchor, setRoleMenuAnchor] = useState<null | HTMLElement>(null);

  const drawerWidth = 280;

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

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

  if (!user) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: sidebarOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open sidebar"
            edge="start"
            onClick={handleSidebarToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ระบบจัดการใบสั่งซื้อ
          </Typography>

          {/* Role Indicator and Switcher */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        variant={isMobile ? 'temporary' : 'persistent'}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: sidebarOpen && !isMobile ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: 'background.default',
          overflow: 'auto',
        }}
      >
        {/* Toolbar spacing */}
        <Toolbar />
        
        {/* Page Content */}
        <Box sx={{ height: 'calc(100vh - 64px)', overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/auth-context';
import { getMenuItemsForRole, MenuItem } from '@/config/menu-config';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'persistent' | 'temporary';
}

export function Sidebar({ open, onClose, variant = 'temporary' }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const drawerWidth = 280;

  if (!user) {
    return null;
  }

  const menuItems = getMenuItemsForRole(user.role);

  const handleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.path === pathname) return true;
    if (item.children) {
      return item.children.some(child => isItemActive(child));
    }
    return false;
  };

  const isItemExpanded = (itemId: string): boolean => {
    return expandedItems.has(itemId);
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = isItemActive(item);
    const isExpanded = isItemExpanded(item.id);
    
    const handleClick = () => {
      if (hasChildren) {
        handleExpand(item.id);
      } else {
        // Close drawer on mobile when navigating
        if (isMobile) {
          onClose();
        }
      }
    };

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ pl: level * 2 }}>
          <ListItemButton
            component={hasChildren ? 'div' : Link}
            href={hasChildren ? undefined : item.path}
            onClick={handleClick}
            selected={isActive && !hasChildren}
            sx={{
              minHeight: 48,
              pl: 2 + level,
              borderRadius: 1,
              mx: 1,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: isActive ? 'inherit' : theme.palette.text.secondary,
              }}
            >
              <item.icon />
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              secondary={level > 0 && item.description ? item.description : undefined}
              primaryTypographyProps={{
                fontSize: level > 0 ? '0.875rem' : '1rem',
                fontWeight: isActive ? 600 : 400,
              }}
              secondaryTypographyProps={{
                fontSize: '0.75rem',
                color: theme.palette.text.disabled,
              }}
            />
            {hasChildren && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box sx={{ width: drawerWidth, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="div" fontWeight="bold">
          PO Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ระบบจัดการใบสั่งซื้อ
        </Typography>
        
        {/* User Role Indicator */}
        <Box sx={{ mt: 1 }}>
          <Chip
            label={user.role}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
        </Box>
      </Box>

      {/* Menu Items */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List>
          {menuItems.map(item => renderMenuItem(item))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          {user.username}
        </Typography>
        <Typography variant="caption" color="text.disabled" align="center" display="block">
          {user.email}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
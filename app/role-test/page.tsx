'use client';

import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  Alert,
  Paper
} from '@mui/material';
import { useAuth } from '@/lib/contexts/auth-context';
import { UserRole } from '@/lib/types/po';
import { getDefaultRouteForRole, canAccessRoute } from '@/lib/utils/role-routing';
import { useRouter } from 'next/navigation';

const roleColors = {
  [UserRole.APP_USER]: 'info',
  [UserRole.MATERIAL_CONTROL]: 'success', 
  [UserRole.ADMIN]: 'error',
  [UserRole.VENDOR]: 'warning',
} as const;

const testRoutes = [
  { path: '/', label: 'หน้าแรก' },
  { path: '/po/list', label: 'รายการ PO' },
  { path: '/po/material', label: 'จัดการวัสดุ' },
  { path: '/components-showcase', label: 'Component Showcase' },
  { path: '/vendor/portal', label: 'Vendor Portal' },
  { path: '/po/po-001/edit', label: 'แก้ไข PO' },
  { path: '/po/po-001/send-email', label: 'ส่งอีเมล PO' },
];

export default function RoleTestPage() {
  const { user, switchRole } = useAuth();
  const router = useRouter();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          กรุณาเข้าสู่ระบบเพื่อทดสอบ Role-based Routing
        </Alert>
      </Container>
    );
  }

  const currentDefaultRoute = getDefaultRouteForRole(user.role);

  const handleRouteTest = (route: string) => {
    setSelectedRoute(route);
    // Try to navigate to the route
    router.push(route);
  };

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    setSelectedRoute(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        🔒 Role-Based Routing Test
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        ทดสอบระบบควบคุมการเข้าถึงหน้าต่างๆ ตามบทบาทผู้ใช้
      </Typography>

      {/* Current User Info */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ข้อมูลผู้ใช้ปัจจุบัน
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip 
              label={user.role} 
              color={roleColors[user.role]}
              size="medium"
            />
            <Typography variant="body1">
              {user.username} ({user.email})
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            หน้าเริ่มต้นสำหรับบทบาทนี้: <strong>{currentDefaultRoute}</strong>
          </Typography>
        </CardContent>
      </Card>

      {/* Role Switching */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            เปลี่ยนบทบาท (สำหรับทดสอบ)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Object.values(UserRole).map((role) => (
              <Button
                key={role}
                variant={user.role === role ? "contained" : "outlined"}
                color={roleColors[role]}
                size="small"
                onClick={() => handleRoleSwitch(role)}
                disabled={user.role === role}
              >
                {role}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Route Testing */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ทดสอบการเข้าถึงหน้าต่างๆ
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            คลิกปุ่มด้านล่างเพื่อทดสอบการเข้าถึงหน้าต่างๆ ระบบจะเปลี่ยนเส้นทางอัตโนมัติถ้าไม่มีสิทธิ์
          </Typography>
          
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)'
              },
              gap: 2 
            }}
          >
            {testRoutes.map((route) => {
              const hasAccess = canAccessRoute(user.role, route.path);
              
              return (
                <Paper 
                  key={route.path}
                  sx={{ 
                    p: 2, 
                    border: selectedRoute === route.path ? '2px solid' : '1px solid',
                    borderColor: selectedRoute === route.path ? 'primary.main' : 'divider',
                    backgroundColor: hasAccess ? 'background.paper' : 'action.disabledBackground',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip 
                      label={hasAccess ? '✓ อนุญาต' : '✗ ปฏิเสธ'} 
                      color={hasAccess ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="subtitle2" gutterBottom>
                    {route.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    {route.path}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => handleRouteTest(route.path)}
                    color={hasAccess ? 'primary' : 'error'}
                  >
                    {hasAccess ? 'เข้าถึง' : 'ทดสอบ (จะถูกเปลี่ยนเส้นทาง)'}
                  </Button>
                </Paper>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Information */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          วิธีการทำงาน:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li>เมื่อ login สำเร็จ ระบบจะพาไปหน้าเริ่มต้นตามบทบาท</li>
          <li>เมื่อพยายามเข้าหน้าที่ไม่มีสิทธิ์ ระบบจะเปลี่ยนเส้นทางไปหน้าที่เหมาะสม</li>
          <li>RoleGuard จะตรวจสอบสิทธิ์ทุกครั้งที่เปลี่ยนหน้า</li>
          <li>แต่ละ role จะเห็นเมนูที่แตกต่างกันใน sidebar</li>
        </Typography>
      </Alert>
    </Container>
  );
}

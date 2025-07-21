'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../lib/contexts/auth-context';
import { RoleGuard } from '../components/guards/RoleGuard';
import { RoleManager } from '../lib/utils/role-management';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Alert, 
  Button,
  Divider 
} from '@mui/material';
import { 
  Dashboard, 
  ListAlt, 
  Inventory, 
  Build 
} from '@mui/icons-material';

export default function HomePage() {
  // ✅ ใช้ RoleGuard เพื่อป้องกันการเข้าถึง
  return (
    <RoleGuard requiredRole={['AppUser', 'MaterialControl']}>
      <HomePageContent />
    </RoleGuard>
  );
}

/**
 * Protected homepage content - แสดงเมื่อผ่าน role guard แล้ว
 */
function HomePageContent() {
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
        return;
      }

      // ✅ ใช้ RoleManager สำหรับ validation
      const roleIsValid = RoleManager.isValidRole(user.role);
      addLog(`Role validation result: ${roleIsValid}`);
      
      if (!roleIsValid) {
        addLog('❌ Invalid role detected');
        return;
      }

      addLog('✅ User authenticated and role is valid');
      addLog(`Welcome, ${user.role}!`);
    }
  }, [user]);

  // ✅ เนื่องจากใช้ RoleGuard แล้ว user จะมีค่าเสมอ
  if (!user) {
    return null; // Fallback (ไม่ควรเกิดขึ้นเพราะมี RoleGuard)
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            ระบบจัดการ Purchase Order
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            ยินดีต้อนรับ, {user.role}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            ระบบจัดการใบสั่งซื้อ (PO) สำหรับองค์กร พร้อมระบบควบคุมสิทธิ์ตามบทบาทผู้ใช้
          </Typography>
          
          {/* Quick Actions based on Role */}
          <QuickActions userRole={user.role} />
        </Paper>

        {/* Features Overview */}
        <FeaturesOverview userRole={user.role} />

        {/* Debug Section (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <DebugSection debugLog={debugLog} user={user} />
        )}
      </Box>
    </Container>
  );
}

/**
 * Quick actions based on user role
 */
interface QuickActionsProps {
  userRole: string;
}

function QuickActions({ userRole }: QuickActionsProps) {
  const canViewPOList = ['AppUser', 'MaterialControl', 'Admin'].includes(userRole);
  const canManageMaterial = ['MaterialControl', 'Admin'].includes(userRole);
  const canAccessAdmin = userRole === 'Admin';

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {canViewPOList && (
        <Button
          variant="contained"
          startIcon={<ListAlt />}
          href="/po/list"
          size="large"
        >
          รายการ PO
        </Button>
      )}
      
      {canManageMaterial && (
        <Button
          variant="outlined"
          startIcon={<Inventory />}
          href="/po/material"
          size="large"
        >
          จัดการวัสดุ
        </Button>
      )}
      
      {canAccessAdmin && (
        <Button
          variant="outlined"
          startIcon={<Build />}
          href="/admin"
          size="large"
          disabled
        >
          ระบบจัดการ (เร็วๆ นี้)
        </Button>
      )}
      
      <Button
        variant="text"
        startIcon={<Dashboard />}
        href="/components-showcase"
        size="large"
      >
        ตัวอย่าง Components
      </Button>
    </Box>
  );
}

/**
 * Features overview with role-based display
 */
interface FeaturesOverviewProps {
  userRole: string;
}

function FeaturesOverview({ userRole }: FeaturesOverviewProps) {
  const features = [
    {
      title: 'รายการ Purchase Order',
      description: 'ดูและจัดการใบสั่งซื้อทั้งหมดในระบบ พร้อมการค้นหาและกรองข้อมูล',
      href: '/po/list',
      icon: <ListAlt />,
      roles: ['AppUser', 'MaterialControl', 'Admin']
    },
    {
      title: 'จัดการวัสดุ',
      description: 'ค้นหาและจัดการข้อมูลวัสดุ ตั้งชื่อเทียบเท่าสำหรับวัสดุลับ',
      href: '/po/material',
      icon: <Inventory />,
      roles: ['MaterialControl', 'Admin']
    },
    {
      title: 'ระบบจัดการ',
      description: 'จัดการระบบ users, permissions และ configuration ต่างๆ',
      href: '/admin',
      icon: <Build />,
      roles: ['Admin']
    }
  ];

  const userFeatures = features.filter(feature => 
    feature.roles.includes(userRole)
  );

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        ฟีเจอร์ที่คุณสามารถใช้งานได้
      </Typography>
      
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {userFeatures.map((feature, index) => (
          <Paper 
            key={index}
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)',
                transition: 'all 0.2s'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ mr: 2, color: 'primary.main' }}>
                {feature.icon}
              </Box>
              <Typography variant="h6" component="h3">
                {feature.title}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2 }}>
              {feature.description}
            </Typography>
            
            <Button
              variant="outlined"
              href={feature.href}
              disabled={feature.href === '/admin'} // Disable admin for now
              sx={{ alignSelf: 'flex-start' }}
            >
              เข้าใช้งาน
            </Button>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

/**
 * Debug section for development
 */
interface DebugSectionProps {
  debugLog: string[];
  user: any;
}

function DebugSection({ debugLog, user }: DebugSectionProps) {
  return (
    <Paper sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        🔍 Debug Information (Development)
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Current User:</strong><br />
          Role: <code>{user.role}</code><br />
          Email: <code>{user.email || 'N/A'}</code><br />
          Department: <code>{user.department || 'N/A'}</code>
        </Typography>
      </Alert>

      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle2" gutterBottom>
        Application Logs:
      </Typography>
      
      <Box 
        sx={{ 
          bgcolor: 'grey.100', 
          p: 2, 
          borderRadius: 1, 
          maxHeight: 200, 
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.85rem'
        }}
      >
        {debugLog.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </Box>
    </Paper>
  );
}
'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { POStatusTimeline } from '@/components/po/POStatusTimeline';
import { POAuditLog } from '@/components/po/POAuditLog';
import { POHeader } from '@/components/po/POHeader';
import { POItemsTable } from '@/components/po/POItemsTable';
import { AuditLog } from '@/components/po/AuditLog';
import { POStatus, UserRole } from '@/lib/types/po';
import { mockPO, mockAuditLog, mockStatusHistory } from '@/lib/mockData';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ComponentShowcasePage() {
  const [tabValue, setTabValue] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ADMIN);
  const [selectedStatus, setSelectedStatus] = useState<POStatus>(POStatus.SENT);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        PO Component Showcase
      </Typography>
      
      <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Demonstration of POStatusTimeline and POAuditLog components
      </Typography>

      {/* Role Selector */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>User Role</InputLabel>
              <Select
                value={selectedRole}
                label="User Role"
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              >
                <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
                <MenuItem value={UserRole.MATERIAL_CONTROL}>Material Control</MenuItem>
                <MenuItem value={UserRole.APP_USER}>App User</MenuItem>
                <MenuItem value={UserRole.VENDOR}>Vendor</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Current Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Current Status"
                onChange={(e) => setSelectedStatus(e.target.value as POStatus)}
              >
                <MenuItem value={POStatus.DRAFT}>Draft</MenuItem>
                <MenuItem value={POStatus.PENDING_APPROVAL}>Pending Approval</MenuItem>
                <MenuItem value={POStatus.APPROVED}>Approved</MenuItem>
                <MenuItem value={POStatus.SENT}>Sent</MenuItem>
                <MenuItem value={POStatus.ACKNOWLEDGED}>Acknowledged</MenuItem>
                <MenuItem value={POStatus.CANCELLED}>Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">
              Selected Role: <strong>{selectedRole}</strong><br />
              Current Status: <strong>{selectedStatus}</strong>
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="component showcase tabs">
          <Tab label="PO Status Timeline" />
          <Tab label="PO Audit Log" />
          <Tab label="Supporting Components" />
          <Tab label="Legacy Audit Log" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            POStatusTimeline Component
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            This component shows the progression of a PO through different status stages. 
            It automatically adjusts between timeline (mobile) and stepper (desktop) layouts.
            Role-based permissions control what information is displayed.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Typography variant="h6" gutterBottom>
              With Status History
            </Typography>
            <POStatusTimeline
              poId={mockPO.id}
              currentStatus={selectedStatus}
              statusHistory={mockStatusHistory}
              userRole={selectedRole}
            />
          </Grid>
          
          <Grid item xs={12} lg={6}>
            <Typography variant="h6" gutterBottom>
              Default Progression
            </Typography>
            <POStatusTimeline
              poId={mockPO.id}
              currentStatus={selectedStatus}
              userRole={selectedRole}
            />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            POAuditLog Component
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Enhanced audit log component with filtering capabilities. Users can filter by action type, 
            date range, and user name. The component shows detailed change tracking with old/new values 
            and metadata information. Role-based permissions control data visibility.
          </Typography>
        </Box>

        <POAuditLog
          poId={mockPO.id}
          auditLog={mockAuditLog}
          userRole={selectedRole}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Supporting Components
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Additional components created to support the PO system and fix failing tests.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              POHeader Component
            </Typography>
            <POHeader po={mockPO} />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              POItemsTable Component
            </Typography>
            <POItemsTable
              items={mockPO.items}
              totalAmount={mockPO.totalAmount}
              currency={mockPO.currency}
              canViewFinancialData={selectedRole !== UserRole.APP_USER}
            />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Legacy AuditLog Component
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Basic audit log component (created to fix existing tests). This is a simpler version 
            without filtering capabilities.
          </Typography>
        </Box>

        <AuditLog
          auditLog={mockAuditLog}
          isLoading={false}
          error={null}
        />
      </TabPanel>

      {/* Usage Instructions */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Usage Instructions
        </Typography>
        <Typography variant="body2" component="div">
          <strong>POStatusTimeline:</strong>
          <ul>
            <li>Automatically shows progression through PO status stages</li>
            <li>Responsive design: Timeline on mobile, Stepper on desktop</li>
            <li>Role-based permissions control information visibility</li>
            <li>Supports custom status history or default progression</li>
          </ul>
          
          <strong>POAuditLog:</strong>
          <ul>
            <li>Enhanced audit log with filtering by action, user, and date range</li>
            <li>Shows detailed field changes with old/new values</li>
            <li>Displays metadata information when available</li>
            <li>Role-based data masking and permissions</li>
            <li>Responsive card layout</li>
          </ul>
        </Typography>
      </Paper>
    </Container>
  );
}
'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  Avatar,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Collapse,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Person,
  Edit,
  Email,
  CheckCircle,
  Cancel,
  Add,
  FilterList,
  ExpandMore,
  ExpandLess,
  Search,
  Clear,
} from '@mui/icons-material';
import { AuditLogEntry, UserRole } from '@/lib/types/po';
import { getRolePermissions, formatDate } from '@/lib/utils/permissions';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';

interface POAuditLogProps {
  poId: string;
  auditLog: AuditLogEntry[];
  userRole?: UserRole;
  isLoading?: boolean;
  error?: Error | null;
}

interface FilterOptions {
  action: string;
  dateRange: {
    from: string;
    to: string;
  };
  userName: string;
}

export function POAuditLog({
  poId,
  auditLog,
  userRole = UserRole.APP_USER,
  isLoading = false,
  error = null,
}: POAuditLogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const permissions = getRolePermissions(userRole);

  const [filters, setFilters] = useState<FilterOptions>({
    action: '',
    dateRange: { from: '', to: '' },
    userName: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return <Add color="success" />;
      case 'UPDATE':
        return <Edit color="warning" />;
      case 'STATUS_CHANGE':
        return <CheckCircle color="info" />;
      case 'EMAIL_SENT':
        return <Email color="primary" />;
      case 'CANCEL':
        return <Cancel color="error" />;
      case 'APPROVE':
        return <CheckCircle color="success" />;
      default:
        return <Person color="action" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'warning';
      case 'STATUS_CHANGE':
        return 'info';
      case 'EMAIL_SENT':
        return 'primary';
      case 'CANCEL':
        return 'error';
      case 'APPROVE':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatChangeValue = (entry: AuditLogEntry) => {
    if (!entry.fieldName || (entry.oldValue === undefined && entry.newValue === undefined)) {
      return null;
    }

    // Don't duplicate description text
    if (entry.metadata?.description === entry.newValue) {
      return null;
    }

    return (
      <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1, fontSize: '0.875rem' }}>
        <Typography variant="body2" color="text.secondary" fontWeight="bold" gutterBottom>
          Field: {entry.fieldName}
        </Typography>
        {entry.oldValue !== undefined && (
          <Typography variant="body2" color="text.secondary">
            From: <strong>{String(entry.oldValue)}</strong>
          </Typography>
        )}
        {entry.newValue !== undefined && (
          <Typography variant="body2" color="text.secondary">
            To: <strong>{String(entry.newValue)}</strong>
          </Typography>
        )}
      </Box>
    );
  };

  const formatMetadata = (metadata: any) => {
    if (!metadata) return null;

    const entries = Object.entries(metadata).filter(([key]) => key !== 'description');
    if (entries.length === 0) return null;

    return (
      <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" fontWeight="bold" gutterBottom>
          Additional Information:
        </Typography>
        {entries.map(([key, value]) => (
          <Typography key={key} variant="body2" color="text.secondary">
            {key}: {String(value)}
          </Typography>
        ))}
      </Box>
    );
  };

  // Filter logic
  const filteredAuditLog = useMemo(() => {
    return auditLog.filter((entry) => {
      // Action filter
      if (filters.action && !entry.action.toLowerCase().includes(filters.action.toLowerCase())) {
        return false;
      }

      // User name filter
      if (filters.userName && !entry.userName.toLowerCase().includes(filters.userName.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const entryDate = new Date(entry.timestamp);
        if (filters.dateRange.from && entryDate < new Date(filters.dateRange.from)) {
          return false;
        }
        if (filters.dateRange.to && entryDate > new Date(filters.dateRange.to + 'T23:59:59')) {
          return false;
        }
      }

      return true;
    });
  }, [auditLog, filters]);

  const clearFilters = () => {
    setFilters({
      action: '',
      dateRange: { from: '', to: '' },
      userName: '',
    });
  };

  const hasActiveFilters = filters.action || filters.dateRange.from || filters.dateRange.to || filters.userName;

  // Get unique actions for filter dropdown
  const uniqueActions = useMemo(() => {
    const actions = new Set(auditLog.map(entry => entry.action));
    return Array.from(actions).sort();
  }, [auditLog]);

  if (isLoading) {
    return <LoadingState message="Loading audit log..." />;
  }

  if (error) {
    return <ErrorState message={`Failed to load audit log: ${error.message}`} />;
  }

  if (!auditLog || auditLog.length === 0) {
    return <EmptyState message="No audit log entries found." />;
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Audit Log ({filteredAuditLog.length})
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {hasActiveFilters && (
              <Button
                startIcon={<Clear />}
                onClick={clearFilters}
                size="small"
                variant="outlined"
              >
                Clear Filters
              </Button>
            )}
            <Button
              startIcon={<FilterList />}
              endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setShowFilters(!showFilters)}
              variant="outlined"
              size="small"
            >
              Filters
            </Button>
          </Box>
        </Box>

        {/* Filter Panel */}
        <Collapse in={showFilters}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Filter Options
              </Typography>
              
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 2,
                  mt: 2,
                }}
              >
                <FormControl size="small">
                  <InputLabel>Action Type</InputLabel>
                  <Select
                    value={filters.action}
                    label="Action Type"
                    onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                  >
                    <MenuItem value="">All Actions</MenuItem>
                    {uniqueActions.map(action => (
                      <MenuItem key={action} value={action}>{action}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  label="User Name"
                  value={filters.userName}
                  onChange={(e) => setFilters(prev => ({ ...prev, userName: e.target.value }))}
                  InputProps={{
                    startAdornment: <Search color="action" sx={{ mr: 1 }} />,
                  }}
                />

                <TextField
                  size="small"
                  label="From Date"
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, from: e.target.value } 
                  }))}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  size="small"
                  label="To Date"
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, to: e.target.value } 
                  }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </CardContent>
          </Card>
        </Collapse>

        {/* Audit Log Entries */}
        {filteredAuditLog.length === 0 ? (
          <EmptyState message="No entries match the current filters." />
        ) : (
          <List sx={{ p: 0 }}>
            {filteredAuditLog.map((entry, index) => (
              <React.Fragment key={entry.id}>
                <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: `${getActionColor(entry.action)}.main`,
                        width: 40,
                        height: 40,
                      }}
                    >
                      {getActionIcon(entry.action)}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: 1, 
                          alignItems: 'center', 
                          mb: 1 
                        }}
                      >
                        <Chip
                          label={entry.action}
                          color={getActionColor(entry.action) as any}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          by {entry.userName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(entry.timestamp)}
                        </Typography>
                      </Box>

                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {entry.metadata?.description || `${entry.action} action performed`}
                      </Typography>

                      {formatChangeValue(entry)}
                      {formatMetadata(entry.metadata)}
                    </Box>
                  </Box>
                </ListItem>
                
                {index < filteredAuditLog.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export default POAuditLog;
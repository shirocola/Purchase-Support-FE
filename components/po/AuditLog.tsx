'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person,
  Edit,
  Email,
  CheckCircle,
  Cancel,
  Add,
} from '@mui/icons-material';
import { AuditLogEntry } from '@/lib/types/po';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import { formatDate } from '@/lib/utils/permissions';

interface AuditLogProps {
  auditLog: AuditLogEntry[];
  isLoading: boolean;
  error: Error | null;
}

export function AuditLog({ auditLog, isLoading, error }: AuditLogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      default:
        return 'default';
    }
  };

  const formatChangeValue = (entry: AuditLogEntry) => {
    if (!entry.fieldName || (entry.oldValue === undefined && entry.newValue === undefined)) {
      return null;
    }

    // If the new value is the same as the description, don't show it again
    if (entry.metadata?.description === entry.newValue) {
      return null;
    }

    return (
      <Box sx={{ mt: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
        {entry.oldValue !== undefined && (
          <Box component="span">
            From: <strong>{String(entry.oldValue)}</strong>
          </Box>
        )}
        {entry.oldValue !== undefined && entry.newValue !== undefined && (
          <Box component="span" sx={{ mx: 1 }}>→</Box>
        )}
        {entry.newValue !== undefined && (
          <Box component="span">
            To: <strong>{String(entry.newValue)}</strong>
          </Box>
        )}
      </Box>
    );
  };

  const formatMetadata = (metadata: Record<string, unknown>) => {
    if (!metadata) return null;

    return Object.entries(metadata)
      .filter(([key]) => key !== 'description')
      .map(([key, value]) => (
        <Box key={key} component="span" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          {key}: {String(value)}
        </Box>
      ));
  };

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
    <Box>
      <Typography variant="h6" gutterBottom>
        Audit Log
      </Typography>

      <List>
        {auditLog.map((entry) => (
          <ListItem key={entry.id} sx={{ px: 0 }}>
            <Card sx={{ width: '100%' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: 2,
                    alignItems: isMobile ? 'flex-start' : 'center',
                  }}
                >
                  <Avatar sx={{ bgcolor: `${getActionColor(entry.action)}.main` }}>
                    {getActionIcon(entry.action)}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 1 }}>
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

                    <Typography variant="body1">
                      {entry.metadata?.description || `${entry.action} action performed`}
                    </Typography>

                    {formatChangeValue(entry)}

                    {entry.metadata && formatMetadata(entry.metadata) && (
                      <Box sx={{ mt: 1 }}>
                        {formatMetadata(entry.metadata)}
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default AuditLog;
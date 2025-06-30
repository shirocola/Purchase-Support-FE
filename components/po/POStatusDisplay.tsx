'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  CheckCircle,
  Schedule,
  Send,
  Approval,
  Edit,
} from '@mui/icons-material';
import { POStatus } from '@/lib/types/po';
import { formatDate } from '@/lib/utils/permissions';

interface StatusHistoryEntry {
  status: POStatus;
  timestamp: string;
  updatedBy: string;
  notes?: string;
}

interface POStatusDisplayProps {
  currentStatus: {
    status: POStatus;
    timestamp: string;
    updatedBy: string;
  };
  statusHistory: StatusHistoryEntry[];
}

export function POStatusDisplay({ currentStatus, statusHistory }: POStatusDisplayProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getStatusIcon = (status: POStatus) => {
    switch (status) {
      case POStatus.DRAFT:
        return <Edit />;
      case POStatus.PENDING_APPROVAL:
        return <Schedule />;
      case POStatus.APPROVED:
        return <Approval />;
      case POStatus.SENT:
        return <Send />;
      case POStatus.ACKNOWLEDGED:
        return <CheckCircle />;
      default:
        return <Schedule />;
    }
  };

  const getStatusColor = (status: POStatus) => {
    switch (status) {
      case POStatus.DRAFT:
        return 'grey';
      case POStatus.PENDING_APPROVAL:
        return 'warning';
      case POStatus.APPROVED:
        return 'success';
      case POStatus.SENT:
        return 'primary';
      case POStatus.ACKNOWLEDGED:
        return 'success';
      case POStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const formatStatusText = (status: POStatus) => {
    switch (status) {
      case POStatus.DRAFT:
        return 'Draft';
      case POStatus.PENDING_APPROVAL:
        return 'Pending Approval';
      case POStatus.APPROVED:
        return 'Approved';
      case POStatus.SENT:
        return 'Sent to Vendor';
      case POStatus.ACKNOWLEDGED:
        return 'Acknowledged';
      case POStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status.replace('_', ' ');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Status Information
      </Typography>

      {/* Current Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Current Status:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip
              icon={getStatusIcon(currentStatus.status)}
              label={formatStatusText(currentStatus.status)}
              color={getStatusColor(currentStatus.status) as any}
              variant="filled"
            />
            <Typography variant="body2" color="text.secondary">
              Updated {formatDate(currentStatus.timestamp)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Status History */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Status History
          </Typography>

          <Timeline>
            {statusHistory.map((entry, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot color={getStatusColor(entry.status) as any}>
                    {getStatusIcon(entry.status)}
                  </TimelineDot>
                  {index < statusHistory.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="subtitle2">
                    {formatStatusText(entry.status)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(entry.timestamp)} by {entry.updatedBy}
                  </Typography>
                  {entry.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {entry.notes}
                    </Typography>
                  )}
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </CardContent>
      </Card>
    </Box>
  );
}

export default POStatusDisplay;
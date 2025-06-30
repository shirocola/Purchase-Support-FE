'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  useTheme,
  useMediaQuery,
  CircularProgress,
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
  Cancel,
  Pending,
} from '@mui/icons-material';
import { POStatus, UserRole } from '@/lib/types/po';
import { getRolePermissions, formatDate } from '@/lib/utils/permissions';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';

interface StatusEntry {
  status: POStatus;
  timestamp?: string;
  updatedBy?: string;
  userName?: string;
  notes?: string;
  completed: boolean;
}

interface POStatusTimelineProps {
  poId: string;
  currentStatus: POStatus;
  statusHistory?: StatusEntry[];
  userRole?: UserRole;
  isLoading?: boolean;
  error?: Error | null;
}

export function POStatusTimeline({
  poId,
  currentStatus,
  statusHistory = [],
  userRole = UserRole.APP_USER,
  isLoading = false,
  error = null,
}: POStatusTimelineProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const permissions = getRolePermissions(userRole);

  const getStatusIcon = (status: POStatus, completed: boolean) => {
    if (!completed) {
      return <Schedule color="action" />;
    }

    switch (status) {
      case POStatus.DRAFT:
        return <Edit color="action" />;
      case POStatus.PENDING_APPROVAL:
        return <Pending color="warning" />;
      case POStatus.APPROVED:
        return <Approval color="success" />;
      case POStatus.SENT:
        return <Send color="primary" />;
      case POStatus.ACKNOWLEDGED:
        return <CheckCircle color="success" />;
      case POStatus.CANCELLED:
        return <Cancel color="error" />;
      default:
        return <Schedule color="action" />;
    }
  };

  const getStatusColor = (status: POStatus, completed: boolean) => {
    if (!completed) return 'grey';

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
        return 'grey';
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
      case POStatus.REJECTED:
        return 'Rejected';
      default:
        return status.replace('_', ' ');
    }
  };

  // Default status progression if no history provided
  const defaultStatuses: StatusEntry[] = [
    {
      status: POStatus.DRAFT,
      completed: [POStatus.DRAFT, POStatus.PENDING_APPROVAL, POStatus.APPROVED, POStatus.SENT, POStatus.ACKNOWLEDGED].includes(currentStatus),
      notes: 'Initial draft created',
    },
    {
      status: POStatus.PENDING_APPROVAL,
      completed: [POStatus.PENDING_APPROVAL, POStatus.APPROVED, POStatus.SENT, POStatus.ACKNOWLEDGED].includes(currentStatus),
      notes: 'Submitted for approval',
    },
    {
      status: POStatus.APPROVED,
      completed: [POStatus.APPROVED, POStatus.SENT, POStatus.ACKNOWLEDGED].includes(currentStatus),
      notes: 'Approved by authorized person',
    },
    {
      status: POStatus.SENT,
      completed: [POStatus.SENT, POStatus.ACKNOWLEDGED].includes(currentStatus),
      notes: 'Sent to vendor for confirmation',
    },
    {
      status: POStatus.ACKNOWLEDGED,
      completed: currentStatus === POStatus.ACKNOWLEDGED,
      notes: 'Vendor acknowledgment received',
    },
  ];

  const statuses = statusHistory.length > 0 ? statusHistory : defaultStatuses;

  if (isLoading) {
    return <LoadingState message="Loading status timeline..." />;
  }

  if (error) {
    return <ErrorState message={`Failed to load status: ${error.message}`} />;
  }

  const renderMobileTimeline = () => (
    <Timeline>
      {statuses.map((entry, index) => (
        <TimelineItem key={entry.status}>
          <TimelineSeparator>
            <TimelineDot color={getStatusColor(entry.status, entry.completed) as any}>
              {getStatusIcon(entry.status, entry.completed)}
            </TimelineDot>
            {index < statuses.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Box sx={{ pb: 2 }}>
              <Chip
                label={formatStatusText(entry.status)}
                color={getStatusColor(entry.status, entry.completed) as any}
                variant={entry.completed ? 'filled' : 'outlined'}
                size="small"
                sx={{ mb: 1 }}
              />
              
              {entry.timestamp && (
                <Typography variant="body2" color="text.secondary">
                  {formatDate(entry.timestamp)}
                  {entry.userName && ` by ${entry.userName}`}
                </Typography>
              )}
              
              {entry.notes && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {entry.notes}
                </Typography>
              )}

              {!entry.completed && entry.status === currentStatus && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
              )}
            </Box>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );

  const renderDesktopStepper = () => (
    <Stepper orientation="vertical" nonLinear>
      {statuses.map((entry, index) => (
        <Step key={entry.status} completed={entry.completed} active={entry.status === currentStatus}>
          <StepLabel
            optional={
              entry.timestamp && (
                <Typography variant="caption">
                  {formatDate(entry.timestamp)}
                  {entry.userName && ` by ${entry.userName}`}
                </Typography>
              )
            }
            StepIconComponent={() => getStatusIcon(entry.status, entry.completed)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={entry.completed ? 'bold' : 'normal'}>
                {formatStatusText(entry.status)}
              </Typography>
              
              {entry.status === currentStatus && (
                <Chip
                  label="Current"
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </StepLabel>
          
          {entry.notes && (
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                {entry.notes}
              </Typography>
            </StepContent>
          )}
        </Step>
      ))}
    </Stepper>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Status Timeline
        </Typography>
        
        {isMobile ? renderMobileTimeline() : renderDesktopStepper()}
      </CardContent>
    </Card>
  );
}

export default POStatusTimeline;
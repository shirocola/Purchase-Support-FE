import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingStateProps {
  message?: string;
  size?: number;
}

export function LoadingState({ message = 'กำลังโหลด...', size = 40 }: LoadingStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      gap={2}
    >
      <CircularProgress size={size} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  message = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 
  onRetry 
}: ErrorStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      gap={2}
      p={3}
    >
      <Typography variant="h6" color="error">
        เกิดข้อผิดพลาด
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {message}
      </Typography>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          ลองใหม่
        </button>
      )}
    </Box>
  );
}

interface EmptyStateProps {
  message?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ 
  message = 'ไม่พบข้อมูล',
  description,
  icon,
  action
}: EmptyStateProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      gap={2}
      p={3}
    >
      {icon}
      <Typography variant="body1" color="text.secondary" textAlign="center">
        {message}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {description}
        </Typography>
      )}
      {action && (
        <Box sx={{ mt: 1 }}>
          {action}
        </Box>
      )}
    </Box>
  );
}
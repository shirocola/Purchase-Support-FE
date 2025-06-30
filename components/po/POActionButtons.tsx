'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Email,
  CheckCircle,
  GetApp,
  Link,
} from '@mui/icons-material';
import { RolePermissions } from '@/lib/types/po';

interface POActionButtonsProps {
  poId: string;
  permissions: RolePermissions;
  onSendEmail: () => void;
  onAcknowledge: () => void;
  isEmailLoading: boolean;
  isAcknowledgeLoading: boolean;
}

export function POActionButtons({
  poId,
  permissions,
  onSendEmail,
  onAcknowledge,
  isEmailLoading,
  isAcknowledgeLoading,
}: POActionButtonsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'email' | 'acknowledge' | null;
    title: string;
    message: string;
    confirmText: string;
  }>({
    open: false,
    type: null,
    title: '',
    message: '',
    confirmText: '',
  });

  const handleSendEmailClick = () => {
    setConfirmDialog({
      open: true,
      type: 'email',
      title: 'Send Email to Vendor',
      message: 'Are you sure you want to send this PO to the vendor?',
      confirmText: 'Confirm Send',
    });
  };

  const handleAcknowledgeClick = () => {
    setConfirmDialog({
      open: true,
      type: 'acknowledge',
      title: 'Acknowledge PO',
      message: 'Acknowledge this PO as received and reviewed?',
      confirmText: 'Confirm Acknowledge',
    });
  };

  const handleConfirm = () => {
    if (confirmDialog.type === 'email') {
      onSendEmail();
    } else if (confirmDialog.type === 'acknowledge') {
      onAcknowledge();
    }
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const handleClose = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const hasAnyPermission = permissions.canSendEmail || permissions.canEdit;

  if (!hasAnyPermission) {
    return null;
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {permissions.canSendEmail && (
          <Button
            variant="contained"
            startIcon={<Email />}
            onClick={handleSendEmailClick}
            disabled={isEmailLoading}
            fullWidth={isMobile}
          >
            📧 Send Email to Vendor
          </Button>
        )}

        <Button
          variant="outlined"
          startIcon={<CheckCircle />}
          onClick={handleAcknowledgeClick}
          disabled={isAcknowledgeLoading}
          fullWidth={isMobile}
        >
          ✅ Acknowledge PO
        </Button>

        <Button
          variant="outlined"
          startIcon={<GetApp />}
          fullWidth={isMobile}
        >
          📄 Download PDF
        </Button>

        <Button
          variant="outlined"
          startIcon={<Link />}
          fullWidth={isMobile}
        >
          🔗 Copy Link
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleClose}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained" autoFocus>
            {confirmDialog.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default POActionButtons;
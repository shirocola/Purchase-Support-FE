'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  IconButton,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  Refresh,
  Email,
  CheckCircle,
  Schedule,
  Error,
  ContentCopy,
  Send,
  Person,
} from '@mui/icons-material';
import { POAcknowledgeStatus as AckStatus, UserRole } from '@/lib/types/po';
import { usePOAcknowledgeStatus, useResendPOEmail, usePOAcknowledgeLink } from '@/lib/hooks/usePO';
import { getRolePermissions, formatDate } from '@/lib/utils/permissions';
import { LoadingState, ErrorState } from '@/components/ui/States';

interface POAcknowledgeStatusProps {
  poId: string;
  userRole: UserRole;
}

export function POAcknowledgeStatus({ poId, userRole }: POAcknowledgeStatusProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'resend' | null;
    title: string;
    message: string;
  }>({
    open: false,
    type: null,
    title: '',
    message: '',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // API hooks
  const {
    data: acknowledgeData,
    isLoading,
    isError,
    error,
    refetch,
  } = usePOAcknowledgeStatus(poId);

  const {
    data: acknowledgeLink,
    refetch: fetchAcknowledgeLink,
  } = usePOAcknowledgeLink(poId);

  const resendEmailMutation = useResendPOEmail();

  // Get permissions for current user role
  const permissions = getRolePermissions(userRole);

  // Helper functions
  const getStatusIcon = (status: AckStatus) => {
    switch (status) {
      case AckStatus.NOT_SENT:
        return <Schedule color="disabled" />;
      case AckStatus.SENT_PENDING:
        return <Schedule color="warning" />;
      case AckStatus.ACKNOWLEDGED:
        return <CheckCircle color="success" />;
      case AckStatus.REJECTED:
        return <Error color="error" />;
      default:
        return <Schedule color="disabled" />;
    }
  };

  const getStatusColor = (status: AckStatus): 'default' | 'warning' | 'success' | 'error' => {
    switch (status) {
      case AckStatus.NOT_SENT:
        return 'default';
      case AckStatus.SENT_PENDING:
        return 'warning';
      case AckStatus.ACKNOWLEDGED:
        return 'success';
      case AckStatus.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: AckStatus) => {
    switch (status) {
      case AckStatus.NOT_SENT:
        return 'ยังไม่ส่งอีเมล';
      case AckStatus.SENT_PENDING:
        return 'รอ vendor ยืนยัน';
      case AckStatus.ACKNOWLEDGED:
        return 'vendor รับทราบแล้ว';
      case AckStatus.REJECTED:
        return 'vendor ปฏิเสธ';
      default:
        return 'ไม่ทราบสถานะ';
    }
  };

  const getStatusMessage = (status: AckStatus) => {
    switch (status) {
      case AckStatus.NOT_SENT:
        return 'PO ยังไม่ได้ส่งให้ vendor กรุณาส่งอีเมลก่อน';
      case AckStatus.SENT_PENDING:
        return 'อีเมลถูกส่งให้ vendor แล้ว กำลังรอการยืนยันจาก vendor';
      case AckStatus.ACKNOWLEDGED:
        return 'vendor ได้รับทราบและยืนยัน PO แล้ว';
      case AckStatus.REJECTED:
        return 'vendor ปฏิเสธ PO นี้';
      default:
        return 'ไม่สามารถระบุสถานะได้';
    }
  };

  // Event handlers
  const handleRefresh = () => {
    refetch();
  };

  const handleResendEmail = () => {
    setConfirmDialog({
      open: true,
      type: 'resend',
      title: 'ยืนยันการส่งอีเมลซ้ำ',
      message: 'คุณต้องการส่งอีเมล PO ให้ vendor ซ้ำอีกครั้งหรือไม่?',
    });
  };

  const handleConfirmResend = async () => {
    try {
      await resendEmailMutation.mutateAsync(poId);
      setConfirmDialog({ open: false, type: null, title: '', message: '' });
      setSnackbar({
        open: true,
        message: 'ส่งอีเมลซ้ำเรียบร้อยแล้ว',
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการส่งอีเมล',
        severity: 'error',
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      if (!acknowledgeLink) {
        await fetchAcknowledgeLink();
      }
      
      if (acknowledgeLink) {
        await navigator.clipboard.writeText(acknowledgeLink);
        setSnackbar({
          open: true,
          message: 'คัดลอกลิงก์เรียบร้อยแล้ว',
          severity: 'success',
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: 'ไม่สามารถคัดลอกลิงก์ได้',
        severity: 'error',
      });
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialog({ open: false, type: null, title: '', message: '' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  // Check permissions
  if (!permissions.canViewAcknowledgeStatus) {
    return (
      <ErrorState
        message="คุณไม่มีสิทธิ์ในการดูสถานะการรับทราบ PO"
      />
    );
  }

  // Loading state
  if (isLoading) {
    return <LoadingState message="กำลังโหลดสถานะการรับทราบ..." />;
  }

  // Error state
  if (isError || !acknowledgeData) {
    return (
      <ErrorState
        message={error?.message || 'ไม่สามารถโหลดสถานะการรับทราบได้'}
        onRetry={refetch}
      />
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1">
          สถานะการรับทราบ PO
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="รีเฟรชข้อมูล">
            <IconButton onClick={handleRefresh} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Status Overview Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: 2,
              mb: 2,
            }}
          >
            {getStatusIcon(acknowledgeData.status)}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">
                สถานะปัจจุบัน
              </Typography>
              <Chip
                label={getStatusText(acknowledgeData.status)}
                color={getStatusColor(acknowledgeData.status)}
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
          
          <Alert
            severity={acknowledgeData.status === AckStatus.ACKNOWLEDGED ? 'success' : 
                     acknowledgeData.status === AckStatus.REJECTED ? 'error' : 'info'}
            sx={{ mt: 2 }}
          >
            {getStatusMessage(acknowledgeData.status)}
          </Alert>
        </CardContent>
      </Card>

      {/* Vendor Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
            ข้อมูล Vendor
          </Typography>
          
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>ชื่อ:</strong> {acknowledgeData.vendorName}
            </Typography>
            <Typography variant="body2">
              <strong>อีเมล:</strong> {acknowledgeData.vendorEmail}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Email Timeline */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Email sx={{ mr: 1, verticalAlign: 'middle' }} />
            ประวัติการส่งอีเมล
          </Typography>
          
          <Stack spacing={2}>
            {acknowledgeData.emailsSent > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  จำนวนครั้งที่ส่ง: {acknowledgeData.emailsSent} ครั้ง
                </Typography>
                {acknowledgeData.lastEmailSentAt && (
                  <Typography variant="body2" color="text.secondary">
                    ส่งล่าสุด: {formatDate(acknowledgeData.lastEmailSentAt)}
                  </Typography>
                )}
              </Box>
            )}
            
            {acknowledgeData.emailSentAt && (
              <Box>
                <Typography variant="body2">
                  <strong>วันเวลาที่ส่งอีเมลครั้งแรก:</strong>{' '}
                  {formatDate(acknowledgeData.emailSentAt)}
                </Typography>
                {acknowledgeData.emailSentBy && (
                  <Typography variant="body2" color="text.secondary">
                    ส่งโดย: {acknowledgeData.emailSentBy}
                  </Typography>
                )}
              </Box>
            )}
            
            {acknowledgeData.acknowledgedAt && (
              <Box>
                <Typography variant="body2">
                  <strong>วันเวลาที่ vendor รับทราบ:</strong>{' '}
                  {formatDate(acknowledgeData.acknowledgedAt)}
                </Typography>
                {acknowledgeData.acknowledgedBy && (
                  <Typography variant="body2" color="text.secondary">
                    รับทราบโดย: {acknowledgeData.acknowledgedBy}
                  </Typography>
                )}
              </Box>
            )}
            
            {acknowledgeData.rejectedAt && (
              <Box>
                <Typography variant="body2">
                  <strong>วันเวลาที่ vendor ปฏิเสธ:</strong>{' '}
                  {formatDate(acknowledgeData.rejectedAt)}
                </Typography>
                {acknowledgeData.rejectionReason && (
                  <Typography variant="body2" color="text.secondary">
                    เหตุผล: {acknowledgeData.rejectionReason}
                  </Typography>
                )}
              </Box>
            )}
            
            {acknowledgeData.lastError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                ข้อผิดพลาดล่าสุด: {acknowledgeData.lastError}
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {(permissions.canResendEmail || permissions.canCopyAcknowledgeLink) && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              การดำเนินการ
            </Typography>
            
            <Stack 
              direction={isMobile ? 'column' : 'row'} 
              spacing={2}
              sx={{ mt: 2 }}
            >
              {permissions.canResendEmail && (
                <Button
                  variant="outlined"
                  startIcon={<Send />}
                  onClick={handleResendEmail}
                  disabled={resendEmailMutation.isPending}
                >
                  ส่งอีเมลซ้ำ
                </Button>
              )}
              
              {permissions.canCopyAcknowledgeLink && (
                <Button
                  variant="outlined"
                  startIcon={<ContentCopy />}
                  onClick={handleCopyLink}
                >
                  คัดลอกลิงก์ยืนยัน
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ยกเลิก</Button>
          <Button
            onClick={handleConfirmResend}
            variant="contained"
            disabled={resendEmailMutation.isPending}
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default POAcknowledgeStatus;
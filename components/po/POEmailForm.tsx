'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  Snackbar,
} from '@mui/material';
import {
  Close,
  Preview,
  Send,
  Refresh,
  ArrowBack,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { 
  UserRole,
  POStatus
} from '@/lib/types/po';
import { 
  getRolePermissions, 
  formatCurrency, 
  formatDate 
} from '@/lib/utils/permissions';
import { 
  usePO, 
  useSendPOEmailWithData, 
  usePOEmailStatus 
} from '@/lib/hooks/usePO';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

// Form data type for react-hook-form
type EmailFormData = {
  recipientEmails: string[];
  customMessage?: string;
  includeAttachments: boolean;
}

// Validation schema
const emailFormSchema = z.object({
  recipientEmails: z.array(z.string().email('กรุณาระบุอีเมลที่ถูกต้อง')).min(1, 'กรุณาระบุอีเมลผู้รับอย่างน้อย 1 รายการ'),
  customMessage: z.string().optional(),
  includeAttachments: z.boolean(),
});

interface POEmailFormProps {
  poId: string;
  userRole: UserRole;
  onBack?: () => void;
  onSuccess?: () => void;
}

export function POEmailForm({ poId, userRole, onBack, onSuccess }: POEmailFormProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State management
  const [emailAddresses, setEmailAddresses] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
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
  const { data: po, isLoading: poLoading, isError: poError, error: poErrorMsg, refetch: refetchPO } = usePO(poId);
  const { data: emailStatus, isLoading: statusLoading, refetch: refetchEmailStatus } = usePOEmailStatus(poId);
  const sendEmailMutation = useSendPOEmailWithData();

  // Get permissions for current user role
  const permissions = getRolePermissions(userRole);

  // Form handling
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      recipientEmails: [],
      customMessage: '',
      includeAttachments: true,
    },
  });

  const watchedFormData = watch();

  // Initialize form with vendor email
  useEffect(() => {
    if (po && emailAddresses.length === 0) {
      const initialEmails = po.vendor.email ? [po.vendor.email] : [];
      setEmailAddresses(initialEmails);
      reset({
        recipientEmails: initialEmails,
        customMessage: `เรียน ${po.vendor.contactPerson || po.vendor.name},\n\nขอส่ง Purchase Order ฉบับนี้มาเพื่อดำเนินการตามรายการที่ระบุ\n\nขอบคุณสำหรับความร่วมมือ`,
        includeAttachments: true,
      });
    }
  }, [po, reset, emailAddresses.length]);

  // Update form when email addresses change
  useEffect(() => {
    setValue('recipientEmails', emailAddresses);
  }, [emailAddresses, setValue]);

  // Handle form submission
  const handleSendEmail = async (data: EmailFormData) => {
    try {
      await sendEmailMutation.mutateAsync({
        id: poId,
        emailData: data,
      });

      setSnackbar({
        open: true,
        message: 'ส่งอีเมลเรียบร้อยแล้ว',
        severity: 'success',
      });

      // Refresh data
      refetchPO();
      refetchEmailStatus();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Send email failed:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการส่งอีเมล',
        severity: 'error',
      });
    } finally {
      setConfirmDialog({ open: false, title: '', message: '' });
    }
  };

  // Add new email field
  const handleAddEmail = () => {
    setEmailAddresses([...emailAddresses, '']);
  };

  // Remove email field
  const handleRemoveEmail = (index: number) => {
    const newEmails = emailAddresses.filter((_, i) => i !== index);
    setEmailAddresses(newEmails);
  };

  // Update email at index
  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emailAddresses];
    newEmails[index] = value;
    setEmailAddresses(newEmails);
  };

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // Generate email preview content
  const generateEmailPreview = (): string => {
    if (!po) return '';

    return `
เรื่อง: Purchase Order ${po.poNumber} - ${po.title}

${watchedFormData.customMessage || ''}

รายละเอียด Purchase Order:
- หมายเลข PO: ${po.poNumber}
- ชื่อ PO: ${po.title}
- ผู้ขาย: ${po.vendor.name}
- วันที่ต้องการสินค้า: ${po.requiredDate ? formatDate(po.requiredDate) : 'ไม่ระบุ'}
- จำนวนเงินรวม: ${formatCurrency(po.totalAmount, po.currency)}

รายการสินค้า:
${po.items.map((item, index) => 
  `${index + 1}. ${item.productName} - จำนวน ${item.quantity} ${item.unit} @ ${formatCurrency(item.unitPrice, po.currency)} = ${formatCurrency(item.totalPrice, po.currency)}`
).join('\n')}

หมายเหตุ: ${po.remarks || 'ไม่มี'}

กรุณายืนยันการรับ PO นี้ผ่านลิงก์ที่แนบมา

ขอบคุณครับ/ค่ะ
    `.trim();
  };

  // Loading state
  if (poLoading) {
    return <LoadingState message="กำลังโหลดข้อมูล PO..." />;
  }

  // Error state
  if (poError || !po) {
    return (
      <ErrorState
        message={poErrorMsg?.message || 'ไม่สามารถโหลดข้อมูล PO ได้'}
        onRetry={refetchPO}
      />
    );
  }

  // Permission check
  if (!permissions.canSendEmail) {
    return (
      <ErrorState
        message="คุณไม่มีสิทธิ์ในการส่งอีเมล PO"
      />
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {onBack && (
            <IconButton onClick={handleBack}>
              <ArrowBack />
            </IconButton>
          )}
          <Typography variant="h4" component="h1">
            ส่งอีเมล PO
          </Typography>
          <Chip
            label={po.status}
            color={po.status === POStatus.APPROVED ? 'success' : 'default'}
            variant="outlined"
          />
        </Box>

        {/* PO Summary */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {po.title} ({po.poNumber})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ผู้ขาย: {po.vendor.name} • ยอดรวม: {formatCurrency(po.totalAmount, po.currency)}
            </Typography>
          </CardContent>
        </Card>

        {/* Email Status */}
        {statusLoading ? (
          <LoadingState message="กำลังโหลดสถานะอีเมล..." />
        ) : emailStatus && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">สถานะการส่งอีเมล</Typography>
                <IconButton onClick={() => refetchEmailStatus()} size="small">
                  <Refresh />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Chip
                  label={emailStatus.isSent ? 'ส่งแล้ว' : 'ยังไม่ส่ง'}
                  color={emailStatus.isSent ? 'success' : 'default'}
                  variant="outlined"
                />
                {emailStatus.lastSentAt && (
                  <Typography variant="body2" color="text.secondary">
                    ส่งล่าสุด: {formatDate(emailStatus.lastSentAt)}
                  </Typography>
                )}
                {emailStatus.emailsSent > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    จำนวนครั้งที่ส่ง: {emailStatus.emailsSent}
                  </Typography>
                )}
              </Box>
              {emailStatus.lastError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  ข้อผิดพลาดล่าสุด: {emailStatus.lastError}
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Check if PO can be sent */}
      {po.status !== POStatus.APPROVED && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          PO ต้องมีสถานะ &quot;อนุมัติแล้ว&quot; เท่านั้นถึงจะสามารถส่งอีเมลได้
        </Alert>
      )}

      <form onSubmit={handleSubmit((data) => {
        setConfirmDialog({
          open: true,
          title: 'ยืนยันการส่งอีเมล',
          message: `คุณต้องการส่งอีเมล PO ให้กับ ${data.recipientEmails.join(', ')} หรือไม่?`,
        });
      })}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Recipients */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ผู้รับอีเมล
              </Typography>
              
              {emailAddresses.map((email, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`อีเมลผู้รับ ${index + 1}`}
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    error={!!errors.recipientEmails?.[index]}
                    helperText={errors.recipientEmails?.[index]?.message}
                  />
                  {emailAddresses.length > 1 && (
                    <IconButton 
                      onClick={() => handleRemoveEmail(index)}
                      color="error"
                    >
                      <Close />
                    </IconButton>
                  )}
                </Box>
              ))}

              <Button
                variant="outlined"
                onClick={handleAddEmail}
                size="small"
                sx={{ mt: 1 }}
              >
                เพิ่มอีเมลผู้รับ
              </Button>
              
              {errors.recipientEmails && typeof errors.recipientEmails.message === 'string' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors.recipientEmails.message}
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Custom Message */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ข้อความในอีเมล
              </Typography>
              <Controller
                name="customMessage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={6}
                    label="ข้อความ (เพิ่มเติม)"
                    placeholder="ระบุข้อความที่ต้องการส่งไปยัง vendor..."
                    helperText="ข้อความนี้จะปรากฏในอีเมลที่ส่งไปยัง vendor พร้อมกับรายละเอียด PO"
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ตัวเลือก
              </Typography>
              <Controller
                name="includeAttachments"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    }
                    label="แนบไฟล์ PO (PDF)"
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'flex-end'
          }}>
            <Button
              variant="outlined"
              startIcon={<Preview />}
              onClick={() => setShowPreview(true)}
              disabled={!isDirty && emailAddresses.length === 0}
            >
              ดูตัวอย่าง
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Send />}
              disabled={
                sendEmailMutation.isPending || 
                po.status !== POStatus.APPROVED ||
                emailAddresses.length === 0
              }
            >
              {sendEmailMutation.isPending ? 'กำลังส่ง...' : 'ส่งอีเมล'}
            </Button>
          </Box>
        </Box>
      </form>

      {/* Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          ตัวอย่างอีเมล
          <IconButton
            onClick={() => setShowPreview(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>
            ถึง: {watchedFormData.recipientEmails.join(', ')}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box
            component="pre"
            sx={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              lineHeight: 1.5,
            }}
          >
            {generateEmailPreview()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, title: '', message: '' })}
        onConfirm={() => handleSendEmail(watchedFormData)}
        title={confirmDialog.title}
        message={confirmDialog.message}
        loading={sendEmailMutation.isPending}
        error={sendEmailMutation.isError ? sendEmailMutation.error?.message : undefined}
      />

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
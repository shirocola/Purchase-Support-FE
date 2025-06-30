'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack,
  Email,
  Save,
  Edit,
  Print,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';

import { 
  POEditFormData, 
  UserRole,
  POStatus,
  Vendor
} from '@/lib/types/po';
import { 
  getRolePermissions, 
  formatCurrency, 
  formatDate, 
  getStatusColor,
  maskValue 
} from '@/lib/utils/permissions';
import { usePO, useUpdatePO, useSendPOEmail } from '@/lib/hooks/usePO';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface POEditPreviewProps {
  poId: string;
  userRole: UserRole;
  onBack?: () => void;
}

export function POEditPreview({ poId, userRole, onBack }: POEditPreviewProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'save' | 'email' | null;
    title: string;
    message: string;
  }>({
    open: false,
    type: null,
    title: '',
    message: '',
  });

  // API hooks
  const { data: po, isLoading, isError, error, refetch } = usePO(poId);
  const updateMutation = useUpdatePO();
  const sendEmailMutation = useSendPOEmail();

  // Get permissions for current user role
  const permissions = getRolePermissions(userRole);

  // Form handling
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<POEditFormData>({
    defaultValues: {
      title: '',
      description: '',
      remarks: '',
      requiredDate: '',
      items: [],
      vendor: {} as Vendor,
    },
  });

  // Initialize form with PO data
  useEffect(() => {
    if (po) {
      reset({
        title: po.title,
        description: po.description,
        remarks: po.remarks,
        requiredDate: po.requiredDate,
        items: po.items,
        vendor: po.vendor,
      });
    }
  }, [po, reset]);

  // Handle save
  const handleSave = async (data: POEditFormData) => {
    try {
      await updateMutation.mutateAsync({
        id: poId,
        data: {
          title: data.title,
          description: data.description,
          remarks: data.remarks,
          requiredDate: data.requiredDate,
        },
      });
      setIsEditing(false);
      setConfirmDialog({ open: false, type: null, title: '', message: '' });
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  // Handle send email
  const handleSendEmail = async () => {
    try {
      await sendEmailMutation.mutateAsync(poId);
      setConfirmDialog({ open: false, type: null, title: '', message: '' });
    } catch (err) {
      console.error('Send email failed:', err);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // Loading state
  if (isLoading) {
    return <LoadingState message="กำลังโหลดข้อมูล PO..." />;
  }

  // Error state
  if (isError || !po) {
    return (
      <ErrorState
        message={error?.message || 'ไม่สามารถโหลดข้อมูล PO ได้'}
        onRetry={refetch}
      />
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={handleBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditing ? 'แก้ไข PO' : 'ตัวอย่าง PO'}
          </Typography>
          <Chip
            label={po.status}
            color={getStatusColor(po.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
            variant="outlined"
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {permissions.canSave && (
            <>
              {!isEditing ? (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  disabled={po.status === POStatus.SENT || po.status === POStatus.ACKNOWLEDGED}
                >
                  แก้ไข
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={() =>
                      setConfirmDialog({
                        open: true,
                        type: 'save',
                        title: 'ยืนยันการบันทึก',
                        message: 'คุณต้องการบันทึกการเปลี่ยนแปลงหรือไม่?',
                      })
                    }
                    disabled={!isDirty || updateMutation.isPending}
                  >
                    บันทึก
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsEditing(false);
                      reset();
                    }}
                  >
                    ยกเลิก
                  </Button>
                </>
              )}
            </>
          )}

          {permissions.canSendEmail && po.status === POStatus.APPROVED && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Email />}
              onClick={() =>
                setConfirmDialog({
                  open: true,
                  type: 'email',
                  title: 'ยืนยันการส่งอีเมล',
                  message: `คุณต้องการส่งอีเมล PO ให้กับ ${po.vendor.name} หรือไม่?`,
                })
              }
              disabled={sendEmailMutation.isPending}
            >
              ส่งอีเมล
            </Button>
          )}

          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={() => window.print()}
          >
            พิมพ์
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {(updateMutation.isError || sendEmailMutation.isError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {updateMutation.error?.message || sendEmailMutation.error?.message}
        </Alert>
      )}

      {/* Success Alert */}
      {(updateMutation.isSuccess || sendEmailMutation.isSuccess) && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {updateMutation.isSuccess && 'บันทึกข้อมูลเรียบร้อยแล้ว'}
          {sendEmailMutation.isSuccess && 'ส่งอีเมลเรียบร้อยแล้ว'}
        </Alert>
      )}

      <form onSubmit={handleSubmit(handleSave)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Basic Information */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ข้อมูลทั่วไป
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="ชื่อ PO"
                        error={!!errors.title}
                        helperText={errors.title?.message}
                        InputProps={{
                          readOnly: !isEditing || !permissions.canEditBasicInfo,
                        }}
                      />
                    )}
                  />
                  <TextField
                    fullWidth
                    label="เลขที่ PO"
                    value={po.poNumber}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    label="วันที่สร้าง"
                    value={formatDate(po.createdAt)}
                    InputProps={{ readOnly: true }}
                  />
                  <Controller
                    name="requiredDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="วันที่ต้องการ"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          readOnly: !isEditing || !permissions.canEditBasicInfo,
                        }}
                      />
                    )}
                  />
                </Box>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="รายละเอียด"
                      multiline
                      rows={3}
                      InputProps={{
                        readOnly: !isEditing || !permissions.canEditBasicInfo,
                      }}
                    />
                  )}
                />
                <Controller
                  name="remarks"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="หมายเหตุ"
                      multiline
                      rows={2}
                      InputProps={{
                        readOnly: !isEditing || !permissions.canEditRemarks,
                      }}
                    />
                  )}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Vendor Information */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ข้อมูลผู้ขาย
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    label="ชื่อบริษัท"
                    value={po.vendor.name}
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    fullWidth
                    label="อีเมล"
                    value={po.vendor.email}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    label="ผู้ติดต่อ"
                    value={po.vendor.contactPerson || '-'}
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    fullWidth
                    label="เบอร์โทร"
                    value={po.vendor.phone || '-'}
                    InputProps={{ readOnly: true }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  รายการสินค้า
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size={isMobile ? 'small' : 'medium'}>
                    <TableHead>
                      <TableRow>
                        <TableCell>รายการ</TableCell>
                        <TableCell align="center">จำนวน</TableCell>
                        <TableCell align="center">หน่วย</TableCell>
                        {!maskValue(0, 'unitPrice', userRole) && (
                          <TableCell align="right">ราคาต่อหน่วย</TableCell>
                        )}
                        {!maskValue(0, 'totalPrice', userRole) && (
                          <TableCell align="right">รวม</TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {po.items.map((item, index) => (
                        <TableRow key={item.id || index}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {item.productName}
                              </Typography>
                              {item.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {item.description}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="center">{item.unit}</TableCell>
                          {!maskValue(0, 'unitPrice', userRole) && (
                            <TableCell align="right">
                              {formatCurrency(item.unitPrice, po.currency)}
                            </TableCell>
                          )}
                          {!maskValue(0, 'totalPrice', userRole) && (
                            <TableCell align="right">
                              {formatCurrency(item.totalPrice, po.currency)}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {!maskValue(0, 'totalAmount', userRole) && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Typography variant="h6">
                      ยอดรวมทั้งสิ้น: {formatCurrency(po.totalAmount, po.currency)}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
        </Box>
      </form>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: null, title: '', message: '' })}
        onConfirm={() => {
          if (confirmDialog.type === 'save') {
            handleSubmit(handleSave)();
          } else if (confirmDialog.type === 'email') {
            handleSendEmail();
          }
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        loading={updateMutation.isPending || sendEmailMutation.isPending}
        error={updateMutation.error?.message || sendEmailMutation.error?.message}
      />
    </Box>
  );
}
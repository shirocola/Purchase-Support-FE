'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { PurchaseOrder } from '@/lib/types/po';

interface EmailDialogProps {
  open: boolean;
  onClose: () => void;
  po: PurchaseOrder | null;
  onSendSuccess: (po: PurchaseOrder, sentAt: string) => void;
}

interface EmailRecipient {
  email: string;
  type: 'TO' | 'CC';
}

interface EmailFormData {
  recipients: EmailRecipient[];
  subject: string;
  message: string;
}

const DEFAULT_EMAIL_TEMPLATE = (poNumber: string, title: string) => `
เรียน คุณผู้รับ

บริษัทฯ ขอส่งใบสั่งซื้อ (Purchase Order) เลขที่ ${poNumber} เพื่อให้ท่านพิจารณา

รายละเอียด:
- เลขที่ PO: ${poNumber}
- ชื่อ PO: ${title}

กรุณาตรวจสอบรายละเอียดและยืนยันการรับทราบผ่านระบบ

ขอบคุณสำหรับความร่วมมือ

ฝ่ายจัดซื้อ
`.trim();

export function POEmailDialog({ open, onClose, po, onSendSuccess }: EmailDialogProps) {
  const [formData, setFormData] = useState<EmailFormData>({
    recipients: [],
    subject: '',
    message: '',
  });
  const [newEmail, setNewEmail] = useState('');
  const [emailType, setEmailType] = useState<'TO' | 'CC'>('TO');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailErrors, setEmailErrors] = useState<Record<number, string>>({});

  // Initialize form data when PO changes
  useEffect(() => {
    if (po) {
      setFormData({
        recipients: [
          { email: po.vendor.email, type: 'TO' }
        ],
        subject: `Purchase Order ${po.poNumber} - ${po.title}`,
        message: DEFAULT_EMAIL_TEMPLATE(po.poNumber, po.title),
      });
      setNewEmail('');
      setEmailType('TO');
      setError(null);
      setEmailErrors({});
    }
  }, [po]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;
    
    if (!validateEmail(newEmail)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }

    // Check for duplicate emails
    const isDuplicate = formData.recipients.some(r => r.email.toLowerCase() === newEmail.toLowerCase());
    if (isDuplicate) {
      setError('อีเมลนี้มีอยู่ในรายการแล้ว');
      return;
    }

    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, { email: newEmail, type: emailType }]
    }));
    setNewEmail('');
    setError(null);
  };

  const handleRemoveEmail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
    // Remove any validation errors for this email
    setEmailErrors(prev => {
      const { [index]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleEmailChange = (index: number, newEmail: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.map((recipient, i) => 
        i === index ? { ...recipient, email: newEmail } : recipient
      )
    }));

    // Validate the email and update errors
    if (newEmail && !validateEmail(newEmail)) {
      setEmailErrors(prev => ({ ...prev, [index]: 'รูปแบบอีเมลไม่ถูกต้อง' }));
    } else {
      setEmailErrors(prev => {
        const { [index]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleTypeChange = (index: number, newType: 'TO' | 'CC') => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.map((recipient, i) => 
        i === index ? { ...recipient, type: newType } : recipient
      )
    }));
  };

  const validateForm = (): boolean => {
    // Check if there are TO recipients
    const hasToRecipients = formData.recipients.some(r => r.type === 'TO');
    if (!hasToRecipients) {
      setError('กรุณาระบุผู้รับอีเมลอย่างน้อย 1 คน');
      return false;
    }

    // Check if all emails are valid
    const hasInvalidEmails = formData.recipients.some(r => !validateEmail(r.email));
    if (hasInvalidEmails) {
      setError('กรุณาตรวจสอบรูปแบบอีเมลให้ถูกต้อง');
      return false;
    }

    // Check subject and message
    if (!formData.subject.trim()) {
      setError('กรุณาระบุหัวข้ออีเมล');
      return false;
    }

    if (!formData.message.trim()) {
      setError('กรุณาระบุข้อความ');
      return false;
    }

    return true;
  };

  const handleSend = async () => {
    if (!po || !validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call to send email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful response
      const sentAt = new Date().toISOString();
      
      // Call success callback
      onSendSuccess(po, sentAt);
      
      // Close dialog
      onClose();
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!po) return null;

  const toRecipients = formData.recipients.filter(r => r.type === 'TO');
  const ccRecipients = formData.recipients.filter(r => r.type === 'CC');

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon color="primary" />
            <Typography variant="h6">ส่งอีเมล PO</Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={isLoading}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary">
          PO: {po.poNumber} - {po.title}
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Email Recipients Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            ผู้รับอีเมล
          </Typography>
          
          {/* Current Recipients */}
          {formData.recipients.length > 0 && (
            <Box sx={{ mb: 3 }}>
              {toRecipients.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>TO:</Typography>
                  <Stack spacing={1}>
                    {toRecipients.map((recipient, index) => {
                      const globalIndex = formData.recipients.findIndex(r => r === recipient);
                      return (
                        <Box key={globalIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            size="small"
                            value={recipient.email}
                            onChange={(e) => handleEmailChange(globalIndex, e.target.value)}
                            error={!!emailErrors[globalIndex]}
                            helperText={emailErrors[globalIndex]}
                            sx={{ flex: 1 }}
                            disabled={isLoading}
                          />
                          <Button
                            size="small"
                            onClick={() => handleTypeChange(globalIndex, 'CC')}
                            disabled={isLoading}
                          >
                            → CC
                          </Button>
                          <IconButton 
                            size="small" 
                            onClick={() => handleRemoveEmail(globalIndex)}
                            disabled={isLoading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              )}

              {ccRecipients.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>CC:</Typography>
                  <Stack spacing={1}>
                    {ccRecipients.map((recipient, index) => {
                      const globalIndex = formData.recipients.findIndex(r => r === recipient);
                      return (
                        <Box key={globalIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            size="small"
                            value={recipient.email}
                            onChange={(e) => handleEmailChange(globalIndex, e.target.value)}
                            error={!!emailErrors[globalIndex]}
                            helperText={emailErrors[globalIndex]}
                            sx={{ flex: 1 }}
                            disabled={isLoading}
                          />
                          <Button
                            size="small"
                            onClick={() => handleTypeChange(globalIndex, 'TO')}
                            disabled={isLoading}
                          >
                            → TO
                          </Button>
                          <IconButton 
                            size="small" 
                            onClick={() => handleRemoveEmail(globalIndex)}
                            disabled={isLoading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              )}
            </Box>
          )}

          {/* Add New Email */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              size="small"
              label="เพิ่มอีเมล"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
              sx={{ flex: 1 }}
              disabled={isLoading}
            />
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <InputLabel>ประเภท</InputLabel>
              <TextField
                select
                size="small"
                value={emailType}
                onChange={(e) => setEmailType(e.target.value as 'TO' | 'CC')}
                SelectProps={{ native: true }}
                disabled={isLoading}
              >
                <option value="TO">TO</option>
                <option value="CC">CC</option>
              </TextField>
            </FormControl>
            <Button
              variant="outlined"
              onClick={handleAddEmail}
              startIcon={<AddIcon />}
              disabled={isLoading}
            >
              เพิ่ม
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Email Content */}
        <Box>
          <Typography variant="h6" gutterBottom>
            เนื้อหาอีเมล
          </Typography>
          
          <TextField
            fullWidth
            label="หัวข้อ"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            sx={{ mb: 2 }}
            disabled={isLoading}
          />
          
          <TextField
            fullWidth
            label="ข้อความ"
            multiline
            rows={8}
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            disabled={isLoading}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleClose} 
          disabled={isLoading}
        >
          ยกเลิก
        </Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={isLoading || formData.recipients.length === 0}
          startIcon={isLoading ? <CircularProgress size={16} /> : <SendIcon />}
        >
          {isLoading ? 'กำลังส่ง...' : 'ส่งอีเมล'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default POEmailDialog;

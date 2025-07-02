'use client';

import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Email as EmailIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';
import { useAuth } from '@/lib/contexts/auth-context';
import { mockPOList } from '@/lib/mockData';
import { POStatus } from '@/lib/types/po';
import { getRolePermissions } from '@/lib/utils/permissions';
import POEmailDialog from '@/components/po/POEmailDialog';

const statusConfig = {
  [POStatus.DRAFT]: { label: 'แบบร่าง', color: 'default' as const },
  [POStatus.PENDING_APPROVAL]: { label: 'รออนุมัติ', color: 'warning' as const },
  [POStatus.APPROVED]: { label: 'อนุมัติแล้ว', color: 'success' as const },
  [POStatus.SENT]: { label: 'ส่งแล้ว', color: 'info' as const },
  [POStatus.ACKNOWLEDGED]: { label: 'รับทราบแล้ว', color: 'success' as const },
  [POStatus.REJECTED]: { label: 'ปฏิเสธ', color: 'error' as const },
  [POStatus.CANCELLED]: { label: 'ยกเลิก', color: 'error' as const },
};

export default function EmailDemoPage() {
  const { user } = useAuth();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [sentEmails, setSentEmails] = useState<Record<string, string>>({});

  // Get only POs that can send email (APPROVED or SENT status)
  const emailablePOs = mockPOList.filter(po => 
    [POStatus.APPROVED, POStatus.SENT].includes(po.status)
  );

  const permissions = user ? getRolePermissions(user.role) : null;
  const canSendEmail = permissions?.canSendEmail || false;

  const handleSendEmail = (po: any) => {
    setSelectedPO(po);
    setEmailDialogOpen(true);
  };

  const handleEmailSendSuccess = (po: any, sentAt: string) => {
    setSentEmails(prev => ({
      ...prev,
      [po.id]: sentAt
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          กรุณาเข้าสู่ระบบเพื่อทดสอบฟีเจอร์การส่งอีเมล
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          📧 การส่งอีเมล PO Demo
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          ทดสอบฟีเจอร์การส่งอีเมล Purchase Order ให้ Vendor
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          <Chip 
            label={`บทบาท: ${user.role}`} 
            color={canSendEmail ? 'success' : 'default'}
          />
          <Chip 
            label={canSendEmail ? 'สามารถส่งอีเมลได้' : 'ไม่สามารถส่งอีเมลได้'} 
            color={canSendEmail ? 'success' : 'error'}
          />
        </Box>
      </Box>

      {!canSendEmail && (
        <Alert severity="info" sx={{ mb: 4 }}>
          บทบาท {user.role} ไม่สามารถส่งอีเมลได้ กรุณาเปลี่ยนเป็น MaterialControl หรือ Admin
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            PO ที่สามารถส่งอีเมลได้ (สถานะ: อนุมัติแล้ว / ส่งแล้ว)
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>เลขที่ PO</TableCell>
                  <TableCell>ชื่อ PO</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell align="center">Email Sent?</TableCell>
                  <TableCell align="center">การดำเนินการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emailablePOs.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {po.poNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {po.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusConfig[po.status]?.label || po.status}
                        color={statusConfig[po.status]?.color || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {po.vendor.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {sentEmails[po.id] || po.emailSentAt ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <CheckIcon color="success" fontSize="small" />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(sentEmails[po.id] || po.emailSentAt!)}
                          </Typography>
                        </Box>
                      ) : (
                        <PendingIcon color="disabled" fontSize="small" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={canSendEmail ? "ส่งอีเมล" : "ไม่มีสิทธิ์ส่งอีเมล"}>
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleSendEmail(po)}
                            disabled={!canSendEmail}
                            sx={{ color: canSendEmail ? 'primary.main' : 'disabled' }}
                          >
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4 }}>
        <Alert severity="info">
          <Typography variant="subtitle2" gutterBottom>
            วิธีการทดสอบ:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
            <li>คลิกไอคอนอีเมลสีน้ำเงิน เพื่อเปิด Email Dialog</li>
            <li>ตรวจสอบและแก้ไขผู้รับอีเมล (TO และ CC)</li>
            <li>ปรับแต่งหัวข้อและข้อความอีเมล</li>
            <li>คลิก "ส่งอีเมล" เพื่อส่งอีเมล</li>
            <li>ระบบจะอัปเดตสถานะ "Email Sent?" พร้อมเวลาที่ส่ง</li>
          </Typography>
        </Alert>
      </Box>

      {/* Navigation Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="outlined" href="/po/list">
          ไปที่รายการ PO ทั้งหมด
        </Button>
        <Button variant="outlined" href="/">
          กลับหน้าแรก
        </Button>
      </Box>

      {/* Email Dialog */}
      <POEmailDialog
        open={emailDialogOpen}
        onClose={() => {
          setEmailDialogOpen(false);
          setSelectedPO(null);
        }}
        po={selectedPO}
        onSendSuccess={handleEmailSendSuccess}
      />
    </Container>
  );
}

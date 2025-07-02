'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
  Stack,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  TrackChanges as TrackIcon,
  Sort as SortIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

import { PurchaseOrder, POStatus, UserRole, POListParams, POListSortOptions } from '@/lib/types/po';
import { usePOList } from '@/lib/hooks/usePO';
import { useAuth } from '@/lib/contexts/auth-context';
import { getRolePermissions } from '@/lib/utils/permissions';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import POFilter, { POFilterValues } from './POFilter';
import POEmailDialog from './POEmailDialog';
import { mockVendors, mockUsers } from '@/lib/mockData';

interface POListProps {
  className?: string;
}

const statusConfig = {
  [POStatus.DRAFT]: { label: 'แบบร่าง', color: 'default' as const },
  [POStatus.PENDING_APPROVAL]: { label: 'รออนุมัติ', color: 'warning' as const },
  [POStatus.APPROVED]: { label: 'อนุมัติแล้ว', color: 'success' as const },
  [POStatus.SENT]: { label: 'ส่งแล้ว', color: 'info' as const },
  [POStatus.ACKNOWLEDGED]: { label: 'รับทราบแล้ว', color: 'success' as const },
  [POStatus.REJECTED]: { label: 'ปฏิเสธ', color: 'error' as const },
  [POStatus.CANCELLED]: { label: 'ยกเลิก', color: 'error' as const },
};

export function POList({ className }: POListProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  // Client-side mount state to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // State for pagination, filtering, and sorting
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<POFilterValues>({});
  const [sort, setSort] = useState<POListSortOptions>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Email dialog state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedPOForEmail, setSelectedPOForEmail] = useState<PurchaseOrder | null>(null);
  
  // Track sent emails (in real app, this would come from the API)
  const [sentEmails, setSentEmails] = useState<Record<string, string>>({});

  // Get user permissions
  const permissions = useMemo(() => {
    return user ? getRolePermissions(user.role) : null;
  }, [user]);

  // Build query parameters
  const queryParams: POListParams = useMemo(() => ({
    page: page + 1, // API uses 1-based pagination
    limit: rowsPerPage,
    filter: filters,
    sort,
  }), [page, rowsPerPage, filters, sort]);

  // Fetch PO list
  const { data, isLoading, error, refetch } = usePOList(queryParams);

  // Event handlers
  const handleFilterChange = useCallback((newFilters: POFilterValues) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filtering
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilters({});
    setPage(0);
  }, []);

  const handleSort = useCallback((field: POListSortOptions['sortBy']) => {
    setSort(prev => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handlePageChange = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleView = useCallback((po: PurchaseOrder) => {
    router.push(`/po/${po.id}/edit`);
  }, [router]);

  const handleEdit = useCallback((po: PurchaseOrder) => {
    router.push(`/po/${po.id}/edit`);
  }, [router]);

  const handleSendEmail = useCallback((po: PurchaseOrder) => {
    setSelectedPOForEmail(po);
    setEmailDialogOpen(true);
  }, []);

  const handleEmailSendSuccess = useCallback((po: PurchaseOrder, sentAt: string) => {
    // Update sent emails tracking
    setSentEmails(prev => ({
      ...prev,
      [po.id]: sentAt
    }));
    
    // In real app, you would also call API to update the PO status
    // and refresh the data
    console.log(`Email sent for PO ${po.poNumber} at ${sentAt}`);
  }, []);

  const handleTrackAcknowledge = useCallback((po: PurchaseOrder) => {
    router.push(`/po/${po.id}/acknowledge-status`);
  }, [router]);

  const handleCreateNew = useCallback(() => {
    // POs come from SAP, so we don't allow manual creation
    // This function is kept for future reference but not used
    console.log('PO creation is handled by SAP system');
  }, []);

  const formatCurrency = useCallback((amount: number, currency: string = 'THB') => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, []);

  const formatDateTime = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const maskValue = useCallback((value: string | number, shouldMask: boolean): string => {
    if (!shouldMask) return value.toString();
    return '****';
  }, []);

  // Prevent hydration mismatch by waiting for client-side mount
  if (!isMounted) {
    return <LoadingState message="กำลังโหลดหน้า..." />;
  }

  // Render loading state
  if (isLoading) {
    return <LoadingState message="กำลังโหลดรายการ PO..." />;
  }

  // Render error state
  if (error) {
    return (
      <ErrorState
        message="เกิดข้อผิดพลาดในการโหลดรายการ PO"
        onRetry={() => refetch()}
      />
    );
  }

  // Render empty state
  if (!data || data.items.length === 0) {
    return (
      <Box className={className}>
        <POFilter
          onFilter={handleFilterChange}
          onReset={handleFilterReset}
          vendors={mockVendors}
          users={mockUsers}
          collapsible
        />
        <EmptyState
          message="ไม่พบรายการ Purchase Order"
          description="PO จะถูกสร้างผ่านระบบ SAP โปรดลองปรับเงื่อนไขการค้นหา"
        />
      </Box>
    );
  }

  const shouldMaskPrices = permissions?.maskedFields.includes('totalAmount') || false;

  return (
    <Box className={className}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          รายการ Purchase Order
        </Typography>
        <Typography variant="body2" color="text.secondary">
          PO จากระบบ SAP
        </Typography>
      </Box>

      {/* Filter */}
      <POFilter
        onFilter={handleFilterChange}
        onReset={handleFilterReset}
        vendors={mockVendors}
        users={mockUsers}
        collapsible
      />

      {/* Results Summary */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            แสดง {data.items.length} จาก {data.total} รายการ (หน้า {data.page}/{data.totalPages})
          </Typography>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                       onClick={() => handleSort('poNumber')}>
                    เลขที่ PO
                    <SortIcon fontSize="small" sx={{ ml: 0.5 }} />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                       onClick={() => handleSort('title')}>
                    ชื่อ PO
                    <SortIcon fontSize="small" sx={{ ml: 0.5 }} />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                       onClick={() => handleSort('status')}>
                    สถานะ
                    <SortIcon fontSize="small" sx={{ ml: 0.5 }} />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                       onClick={() => handleSort('vendor')}>
                    ผู้ขาย
                    <SortIcon fontSize="small" sx={{ ml: 0.5 }} />
                  </Box>
                </TableCell>
                {!shouldMaskPrices && (
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', justifyContent: 'flex-end' }}
                         onClick={() => handleSort('totalAmount')}>
                      มูลค่า
                      <SortIcon fontSize="small" sx={{ ml: 0.5 }} />
                    </Box>
                  </TableCell>
                )}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                       onClick={() => handleSort('createdAt')}>
                    วันที่สร้าง
                    <SortIcon fontSize="small" sx={{ ml: 0.5 }} />
                  </Box>
                </TableCell>
                <TableCell align="center">Sent?</TableCell>
                <TableCell align="center">การดำเนินการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.map((po) => (
                <TableRow
                  key={po.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleView(po)}
                >
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                        {po.vendor.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">
                        {po.vendor.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  {!shouldMaskPrices && (
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(po.totalAmount, po.currency)}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(po.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {sentEmails[po.id] || po.emailSentAt ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CheckIcon color="success" fontSize="small" />
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(sentEmails[po.id] || po.emailSentAt!)}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="ดูรายละเอียด">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(po);
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {permissions?.canSave && (
                        <Tooltip title="แก้ไข">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(po);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {permissions?.canSendEmail && [POStatus.APPROVED, POStatus.SENT].includes(po.status) && (
                        <Tooltip title="ส่งอีเมล">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendEmail(po);
                            }}
                            sx={{ color: 'primary.main' }}
                          >
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {permissions?.canViewAcknowledgeStatus && (
                        <Tooltip title="ติดตาม Vendor Acknowledge">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrackAcknowledge(po);
                            }}
                          >
                            <TrackIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          component="div"
          count={data.total}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="แสดงต่อหน้า:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}–${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
          }
          sx={{
            borderTop: 1,
            borderColor: 'divider',
          }}
        />
      </Card>

      {/* Email Dialog */}
      <POEmailDialog
        open={emailDialogOpen}
        onClose={() => {
          setEmailDialogOpen(false);
          setSelectedPOForEmail(null);
        }}
        po={selectedPOForEmail}
        onSendSuccess={handleEmailSendSuccess}
      />
    </Box>
  );
}

export default POList;

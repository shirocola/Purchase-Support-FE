'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
  GridActionsCellItem,
  GridRowParams,
} from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { usePOList, useSendPOEmail } from '@/hooks/usePO';
import { POListParams, POStatus, Permission } from '@/types/po';
import {
  formatDate,
  formatCurrency,
  getStatusColor,
  getStatusText,
  canEditPO,
  canDeletePO,
  canSendPOEmail,
} from '@/utils/helpers';

interface POListProps {
  userPermissions?: Permission[];
}

const POList: React.FC<POListProps> = ({ userPermissions = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for filters and pagination
  const [params, setParams] = useState<POListParams>({
    page: 1,
    pageSize: 25,
    sortBy: 'createdDate',
    sortOrder: 'desc',
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<POStatus[]>([]);

  // Data fetching
  const { data, isLoading, error, refetch } = usePOList(params);
  const sendEmailMutation = useSendPOEmail();

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setParams(prev => ({
        ...prev,
        search: searchTerm || undefined,
        page: 1, // Reset to first page when searching
      }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle status filter change
  const handleStatusFilterChange = (selectedStatuses: POStatus[]) => {
    setStatusFilter(selectedStatuses);
    setParams(prev => ({
      ...prev,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      page: 1,
    }));
  };

  // Handle pagination change
  const handlePaginationChange = (model: GridPaginationModel) => {
    setParams(prev => ({
      ...prev,
      page: model.page + 1, // MUI DataGrid is 0-based, our API is 1-based
      pageSize: model.pageSize,
    }));
  };

  // Handle sorting change
  const handleSortChange = (model: GridSortModel) => {
    if (model.length > 0) {
      const sort = model[0];
      const validSortFields = ['createdDate', 'poNumber', 'totalAmount', 'status'] as const;
      const sortField = validSortFields.includes(sort.field as typeof validSortFields[number]) 
        ? sort.field as typeof params.sortBy 
        : 'createdDate';
      
      setParams(prev => ({
        ...prev,
        sortBy: sortField,
        sortOrder: sort.sort || 'asc',
      }));
    }
  };

  // Handle actions
  const handleView = (id: string) => {
    // Navigate to PO detail page
    window.location.href = `/po/${id}`;
  };

  const handleEdit = (id: string) => {
    // Navigate to PO edit page
    window.location.href = `/po/${id}/edit`;
  };

  const handleDelete = (id: string) => {
    // Show confirmation dialog and delete
    if (window.confirm('คุณต้องการลบ PO นี้หรือไม่?')) {
      // TODO: Implement delete functionality
      console.log('Delete PO:', id);
    }
  };

  const handleSendEmail = async (id: string) => {
    try {
      await sendEmailMutation.mutateAsync(id);
      alert('ส่งอีเมลสำเร็จ');
    } catch {
      alert('เกิดข้อผิดพลาดในการส่งอีเมล');
    }
  };

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: 'poNumber',
      headerName: 'เลข PO',
      width: 150,
      renderCell: (params) => (
        <Button
          variant="text"
          color="primary"
          onClick={() => handleView(params.row.id)}
          sx={{ textTransform: 'none', padding: 0, minWidth: 'auto' }}
        >
          {params.value}
        </Button>
      ),
    },
    {
      field: 'createdDate',
      headerName: 'วันที่สร้าง',
      width: 120,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: 'vendor',
      headerName: 'ผู้ขาย',
      width: 200,
      renderCell: (params) => params.value?.name || '-',
    },
    {
      field: 'status',
      headerName: 'สถานะ',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={getStatusText(params.value)}
          size="small"
          sx={{
            backgroundColor: getStatusColor(params.value),
            color: 'white',
            fontWeight: 'bold',
          }}
        />
      ),
    },
    {
      field: 'totalAmount',
      headerName: 'จำนวนเงิน',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => formatCurrency(params.value, params.row.currency),
    },
    {
      field: 'requesterName',
      headerName: 'ผู้ขอ',
      width: 150,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'การดำเนินการ',
      width: 150,
      getActions: (params: GridRowParams) => {
        const actions = [
          <GridActionsCellItem
            icon={<ViewIcon />}
            label="ดูรายละเอียด"
            onClick={() => handleView(params.id as string)}
            key="view"
          />,
        ];

        if (canEditPO(userPermissions)) {
          actions.push(
            <GridActionsCellItem
              icon={<EditIcon />}
              label="แก้ไข"
              onClick={() => handleEdit(params.id as string)}
              key="edit"
            />
          );
        }

        if (canSendPOEmail(userPermissions)) {
          actions.push(
            <GridActionsCellItem
              icon={<EmailIcon />}
              label="ส่งอีเมล"
              onClick={() => handleSendEmail(params.id as string)}
              disabled={sendEmailMutation.isPending}
              key="email"
            />
          );
        }

        if (canDeletePO(userPermissions)) {
          actions.push(
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="ลบ"
              onClick={() => handleDelete(params.id as string)}
              key="delete"
            />
          );
        }

        return actions;
      },
    },
  ];

  // Mobile responsive columns
  const mobileColumns = columns.filter(col => 
    ['poNumber', 'vendor', 'status', 'actions'].includes(col.field)
  );

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          เกิดข้อผิดพลาด: {error.message}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
        >
          ลองใหม่
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        รายการ Purchase Order
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
        }}>
          <TextField
            label="ค้นหา PO"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
            sx={{ minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>สถานะ</InputLabel>
            <Select
              multiple
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value as POStatus[])}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={getStatusText(value)} 
                      size="small" 
                    />
                  ))}
                </Box>
              )}
            >
              {Object.values(POStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {getStatusText(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            รีเฟรช
          </Button>
        </Box>
      </Paper>

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={data?.data || []}
            columns={isMobile ? mobileColumns : columns}
            paginationMode="server"
            sortingMode="server"
            paginationModel={{
              page: (data?.currentPage || 1) - 1, // Convert to 0-based for MUI
              pageSize: data?.pageSize || 25,
            }}
            rowCount={data?.totalCount || 0}
            onPaginationModelChange={handlePaginationChange}
            onSortModelChange={handleSortChange}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
            slots={{
              noRowsOverlay: () => (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%' 
                }}>
                  <Typography variant="h6" color="text.secondary">
                    ไม่พบรายการ Purchase Order
                  </Typography>
                </Box>
              ),
            }}
          />
        )}
      </Paper>
    </Box>
  );
};

export default POList;
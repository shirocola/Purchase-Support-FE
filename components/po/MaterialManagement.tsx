'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  TableSortLabel,
  useTheme,
  useMediaQuery,
  Stack,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Security as SecurityIcon,
  Label as LabelIcon,
  Visibility as VisibilityIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { MaterialFilter } from './MaterialFilter';
import { useMaterialList, useUpdateMaterial } from '@/lib/hooks/useMaterial';
import { 
  MaterialFilter as MaterialFilterType, 
  MaterialSortOptions, 
  Material,
  MaterialUpdateData,
  UserRole
} from '@/lib/types/po';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import { useAuth } from '@/lib/contexts/auth-context';
import { canUserEditMaterial, maskMaterialValue } from '@/lib/utils/permissions';

interface EditDialogState {
  open: boolean;
  material: Material | null;
  aliasName: string;
}

export function MaterialManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  // State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<MaterialFilterType>({});
  const [sort, setSort] = useState<MaterialSortOptions>({
    sortBy: 'materialCode',
    sortOrder: 'asc',
  });
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    material: null,
    aliasName: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // API calls
  const { 
    data: materialsResponse, 
    isLoading, 
    error, 
    refetch 
  } = useMaterialList({
    page: page + 1,
    limit: rowsPerPage,
    filter: filters,
    sort,
  });

  const updateMaterialMutation = useUpdateMaterial();

  const materials = materialsResponse?.items || [];
  const totalCount = materialsResponse?.total || 0;

  // Permission checks
  const canEdit = user ? canUserEditMaterial(user.role) : false;
  const isVendor = user ? user.role === UserRole.VENDOR : false;

  // Event handlers
  const handleFilterChange = useCallback((newFilters: MaterialFilterType) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilters({});
    setPage(0);
  }, []);

  const handleSort = useCallback((field: MaterialSortOptions['sortBy']) => {
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

  const handleEditClick = useCallback((material: Material) => {
    setEditDialog({
      open: true,
      material,
      aliasName: material.aliasName || '',
    });
  }, []);

  const handleDialogClose = useCallback(() => {
    setEditDialog({
      open: false,
      material: null,
      aliasName: '',
    });
  }, []);

  const handleSaveAlias = useCallback(async () => {
    if (!editDialog.material) return;

    try {
      const updateData: MaterialUpdateData = {
        aliasName: editDialog.aliasName.trim() || undefined,
      };

      await updateMaterialMutation.mutateAsync({
        id: editDialog.material.id,
        data: updateData,
      });

      setSnackbar({
        open: true,
        message: 'บันทึกชื่อเทียบเท่าเรียบร้อยแล้ว',
        severity: 'success',
      });

      handleDialogClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการบันทึก',
        severity: 'error',
      });
    }
  }, [editDialog, updateMaterialMutation]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Memoized table columns based on permissions
  const columns = useMemo(() => {
    const baseColumns = [
      { id: 'materialCode', label: 'รหัสวัสดุ', sortable: true },
      { id: 'materialName', label: 'ชื่อวัสดุ', sortable: true },
      { id: 'category', label: 'หมวดหมู่', sortable: true },
    ];

    if (!isVendor) {
      baseColumns.push(
        { id: 'isConfidential', label: 'สถานะความลับ', sortable: false },
        { id: 'aliasName', label: 'ชื่อเทียบเท่า', sortable: true }
      );
    }

    baseColumns.push({ id: 'actions', label: 'การจัดการ', sortable: false });

    return baseColumns;
  }, [isVendor]);

  if (isLoading) {
    return <LoadingState message="กำลังโหลดข้อมูลวัสดุ..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message="เกิดข้อผิดพลาดในการโหลดข้อมูลวัสดุ"
        onRetry={refetch}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          จัดการข้อมูลวัสดุ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ระบบจัดการชื่อเทียบเท่าสำหรับวัสดุที่เป็นความลับ
        </Typography>
      </Box>

      {/* Filter Section */}
      <MaterialFilter
        onFilter={handleFilterChange}
        onReset={handleFilterReset}
        collapsible={true}
        loading={isLoading}
      />

      {/* Results Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          พบ {totalCount.toLocaleString()} รายการ
        </Typography>
      </Box>

      {/* Table */}
      {materials.length === 0 ? (
        <EmptyState 
          message="ไม่พบข้อมูลวัสดุที่ตรงกับเงื่อนไขการค้นหา"
          action={
            <Button variant="outlined" onClick={handleFilterReset}>
              ล้างตัวกรอง
            </Button>
          }
        />
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {column.sortable ? (
                      <TableSortLabel
                        active={sort.sortBy === column.id}
                        direction={sort.sortBy === column.id ? sort.sortOrder : 'asc'}
                        onClick={() => handleSort(column.id as MaterialSortOptions['sortBy'])}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id} hover>
                  {/* Material Code */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {material.materialCode}
                    </Typography>
                  </TableCell>

                  {/* Material Name */}
                  <TableCell>
                    <Typography variant="body2">
                      {user ? maskMaterialValue(material.materialName, user.role, material.isConfidential) : material.materialName}
                    </Typography>
                    {material.description && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {user ? maskMaterialValue(material.description, user.role, material.isConfidential) : material.description}
                      </Typography>
                    )}
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Chip
                      label={material.category}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  {/* Confidential Status (hidden from vendors) */}
                  {!isVendor && (
                    <TableCell>
                      <Chip
                        icon={material.isConfidential ? <SecurityIcon /> : <VisibilityIcon />}
                        label={material.isConfidential ? 'ความลับ' : 'ทั่วไป'}
                        color={material.isConfidential ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  )}

                  {/* Alias Name (hidden from vendors) */}
                  {!isVendor && (
                    <TableCell>
                      {material.aliasName ? (
                        <Chip
                          icon={<LabelIcon />}
                          label={material.aliasName}
                          color="info"
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  )}

                  {/* Actions */}
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {canEdit && material.isConfidential && (
                        <Tooltip title="แก้ไขชื่อเทียบเท่า">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(material)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="แถวต่อหน้า:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`
            }
          />
        </TableContainer>
      )}

      {/* Edit Alias Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          แก้ไขชื่อเทียบเท่า
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              รหัสวัสดุ: {editDialog.material?.materialCode}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ชื่อวัสดุ: {editDialog.material?.materialName}
            </Typography>
            
            <TextField
              fullWidth
              label="ชื่อเทียบเท่า"
              value={editDialog.aliasName}
              onChange={(e) => setEditDialog(prev => ({ ...prev, aliasName: e.target.value }))}
              placeholder="ระบุชื่อเทียบเท่าสำหรับวัสดุลับนี้"
              helperText="ชื่อนี้จะใช้แสดงแทนชื่อจริงในเอกสารที่ไม่เป็นความลับ"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} startIcon={<CancelIcon />}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSaveAlias}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={updateMaterialMutation.isPending}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
  Stack,
  Chip,
  Autocomplete,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { POStatus } from '@/lib/types/po';

export interface POFilterValues {
  search?: string;
  status?: POStatus[];
  vendorId?: string;
  dateFrom?: string;
  dateTo?: string;
  createdBy?: string;
}

interface POFilterProps {
  initialValues?: Partial<POFilterValues>;
  onFilter: (filters: POFilterValues) => void;
  onReset: () => void;
  vendors?: Array<{ id: string; name: string }>;
  users?: Array<{ id: string; name: string }>;
  loading?: boolean;
  collapsible?: boolean;
  className?: string;
}

const statusOptions = [
  { value: POStatus.DRAFT, label: 'แบบร่าง', color: 'default' as const },
  { value: POStatus.PENDING_APPROVAL, label: 'รออนุมัติ', color: 'warning' as const },
  { value: POStatus.APPROVED, label: 'อนุมัติแล้ว', color: 'success' as const },
  { value: POStatus.SENT, label: 'ส่งแล้ว', color: 'info' as const },
  { value: POStatus.ACKNOWLEDGED, label: 'รับทราบแล้ว', color: 'success' as const },
  { value: POStatus.REJECTED, label: 'ปฏิเสธ', color: 'error' as const },
  { value: POStatus.CANCELLED, label: 'ยกเลิก', color: 'error' as const },
];

export function POFilter({
  initialValues = {},
  onFilter,
  onReset,
  vendors = [],
  users = [],
  loading = false,
  collapsible = false,
  className,
}: POFilterProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [expanded, setExpanded] = useState(!collapsible);
  const [filters, setFilters] = useState<POFilterValues>({
    search: initialValues.search || '',
    status: initialValues.status || [],
    vendorId: initialValues.vendorId || '',
    dateFrom: initialValues.dateFrom || '',
    dateTo: initialValues.dateTo || '',
    createdBy: initialValues.createdBy || '',
  });

  const handleInputChange = useCallback((field: keyof POFilterValues, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleStatusChange = useCallback((event: any, newValue: POStatus[]) => {
    handleInputChange('status', newValue);
  }, [handleInputChange]);

  const handleVendorChange = useCallback((event: SelectChangeEvent<string>) => {
    handleInputChange('vendorId', event.target.value);
  }, [handleInputChange]);

  const handleUserChange = useCallback((event: SelectChangeEvent<string>) => {
    handleInputChange('createdBy', event.target.value);
  }, [handleInputChange]);

  const handleSearch = useCallback(() => {
    // Clean up empty values
    const cleanFilters: POFilterValues = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        if (Array.isArray(value) && value.length > 0) {
          (cleanFilters as any)[key] = value;
        } else if (!Array.isArray(value)) {
          (cleanFilters as any)[key] = value;
        }
      }
    });
    
    onFilter(cleanFilters);
  }, [filters, onFilter]);

  const handleReset = useCallback(() => {
    const resetFilters: POFilterValues = {
      search: '',
      status: [],
      vendorId: '',
      dateFrom: '',
      dateTo: '',
      createdBy: '',
    };
    setFilters(resetFilters);
    onReset();
  }, [onReset]);

  const handleToggleExpanded = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const hasActiveFilters = useCallback(() => {
    return !!(
      filters.search ||
      (filters.status && filters.status.length > 0) ||
      filters.vendorId ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.createdBy
    );
  }, [filters]);

  const filterContent = (
    <CardContent>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobile 
            ? '1fr' 
            : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 2,
          mb: 3,
        }}
      >
        {/* Search */}
        <TextField
          fullWidth
          label="ค้นหา"
          placeholder="ค้นหาเลขที่ PO, ชื่อ, หรือ vendor..."
          value={filters.search}
          onChange={(e) => handleInputChange('search', e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
        />

        {/* Status */}
        <Autocomplete
          multiple
          size="small"
          options={statusOptions.map(opt => opt.value)}
          value={filters.status || []}
          onChange={handleStatusChange}
          getOptionLabel={(option) => statusOptions.find(s => s.value === option)?.label || option}
          renderInput={(params) => (
            <TextField {...params} label="สถานะ" placeholder="เลือกสถานะ..." />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const statusOption = statusOptions.find(s => s.value === option);
              return (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={statusOption?.label || option}
                  color={statusOption?.color || 'default'}
                  size="small"
                />
              );
            })
          }
        />

        {/* Vendor */}
        {vendors.length > 0 && (
          <FormControl fullWidth size="small">
            <InputLabel>ผู้ขาย</InputLabel>
            <Select
              value={filters.vendorId || ''}
              label="ผู้ขาย"
              onChange={handleVendorChange}
            >
              <MenuItem value="">
                <em>ทั้งหมด</em>
              </MenuItem>
              {vendors.map((vendor) => (
                <MenuItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Date From */}
        <TextField
          fullWidth
          label="วันที่เริ่มต้น"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleInputChange('dateFrom', e.target.value)}
          variant="outlined"
          size="small"
          InputLabelProps={{
            shrink: true,
          }}
        />

        {/* Date To */}
        <TextField
          fullWidth
          label="วันที่สิ้นสุด"
          type="date"
          value={filters.dateTo}
          onChange={(e) => handleInputChange('dateTo', e.target.value)}
          variant="outlined"
          size="small"
          InputLabelProps={{
            shrink: true,
          }}
        />

        {/* Created By */}
        {users.length > 0 && (
          <FormControl fullWidth size="small">
            <InputLabel>ผู้สร้าง</InputLabel>
            <Select
              value={filters.createdBy || ''}
              label="ผู้สร้าง"
              onChange={handleUserChange}
            >
              <MenuItem value="">
                <em>ทั้งหมด</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Action Buttons */}
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={2}
        alignItems={isMobile ? 'stretch' : 'center'}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={loading}
          startIcon={<SearchIcon />}
          sx={{ minWidth: 120 }}
        >
          ค้นหา
        </Button>
        
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleReset}
          disabled={loading}
          startIcon={<ClearIcon />}
          sx={{ minWidth: 120 }}
        >
          ล้างค่า
        </Button>
        
        {hasActiveFilters() && (
          <Typography
            variant="body2"
            color="primary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 500,
            }}
          >
            มีการกรองข้อมูลอยู่
          </Typography>
        )}
      </Stack>
    </CardContent>
  );

  if (collapsible) {
    return (
      <Card className={className} sx={{ mb: 2 }}>
        {/* Header with toggle */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
            backgroundColor: theme.palette.grey[50],
            borderBottom: 1,
            borderColor: 'divider',
            cursor: 'pointer',
          }}
          onClick={handleToggleExpanded}
        >
          <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ตัวกรองข้อมูล
          </Typography>
          
          {hasActiveFilters() && (
            <Typography
              variant="caption"
              color="primary"
              sx={{
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                mr: 1,
                fontWeight: 500,
              }}
            >
              กรองแล้ว
            </Typography>
          )}
          
          <IconButton
            size="small"
            sx={{
              transform: expanded ? 'rotate(0deg)' : 'rotate(0deg)',
              transition: theme.transitions.create('transform', {
                duration: theme.transitions.duration.shortest,
              }),
            }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {/* Collapsible content */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {filterContent}
        </Collapse>
      </Card>
    );
  }

  return (
    <Card className={className} sx={{ mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1,
          backgroundColor: theme.palette.grey[50],
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="h6">ตัวกรองข้อมูล</Typography>
      </Box>
      {filterContent}
    </Card>
  );
}

export default POFilter;

'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

export interface POFilterValues {
  poNumber: string;
  poDate: string;
  deliveryDate: string;
  materialCode: string;
}

interface POFilterProps {
  initialValues?: Partial<POFilterValues>;
  onFilter: (filters: POFilterValues) => void;
  onReset: () => void;
  materialCodes?: string[];
  loading?: boolean;
  collapsible?: boolean;
  className?: string;
}

const defaultMaterialCodes = [
  'MAT-001',
  'MAT-002', 
  'MAT-003',
  'MAT-004',
  'MAT-005',
  'ELE-001',
  'ELE-002',
  'MEC-001',
  'MEC-002',
  'CHE-001',
];

export function POFilter({
  initialValues = {},
  onFilter,
  onReset,
  materialCodes = defaultMaterialCodes,
  loading = false,
  collapsible = false,
  className,
}: POFilterProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [expanded, setExpanded] = useState(!collapsible);
  const [filters, setFilters] = useState<POFilterValues>({
    poNumber: initialValues.poNumber || '',
    poDate: initialValues.poDate || '',
    deliveryDate: initialValues.deliveryDate || '',
    materialCode: initialValues.materialCode || '',
  });

  const handleInputChange = (field: keyof POFilterValues, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMaterialCodeChange = (event: SelectChangeEvent<string>) => {
    handleInputChange('materialCode', event.target.value);
  };

  const handleSearch = () => {
    onFilter(filters);
  };

  const handleReset = () => {
    const resetFilters: POFilterValues = {
      poNumber: '',
      poDate: '',
      deliveryDate: '',
      materialCode: '',
    };
    setFilters(resetFilters);
    onReset();
  };

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  const hasActiveFilters = () => {
    return !!(
      filters.poNumber ||
      filters.poDate ||
      filters.deliveryDate ||
      filters.materialCode
    );
  };

  const filterContent = (
    <CardContent>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobile 
            ? '1fr' 
            : 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 2,
          mb: 3,
        }}
      >
        {/* PO Number */}
        <TextField
          fullWidth
          label="เลขที่ PO"
          placeholder="ค้นหาเลขที่ PO..."
          value={filters.poNumber}
          onChange={(e) => handleInputChange('poNumber', e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
        />

        {/* PO Date */}
        <TextField
          fullWidth
          label="วันที่ PO"
          type="date"
          value={filters.poDate}
          onChange={(e) => handleInputChange('poDate', e.target.value)}
          variant="outlined"
          size="small"
          InputLabelProps={{
            shrink: true,
          }}
        />

        {/* Delivery Date */}
        <TextField
          fullWidth
          label="วันที่จัดส่ง"
          type="date"
          value={filters.deliveryDate}
          onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
          variant="outlined"
          size="small"
          InputLabelProps={{
            shrink: true,
          }}
        />

        {/* Material Code */}
        <FormControl fullWidth size="small">
          <InputLabel>รหัสวัสดุ</InputLabel>
          <Select
            value={filters.materialCode}
            label="รหัสวัสดุ"
            onChange={handleMaterialCodeChange}
          >
            <MenuItem value="">
              <em>ทั้งหมด</em>
            </MenuItem>
            {materialCodes.map((code) => (
              <MenuItem key={code} value={code}>
                {code}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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

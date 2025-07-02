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
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { MaterialFilter as MaterialFilterType, Material } from '@/lib/types/po';
import { useMaterialCategories, useMaterialSearch } from '@/lib/hooks/useMaterial';

export interface MaterialFilterValues extends MaterialFilterType {
  // Extends MaterialFilterType from types
}

interface MaterialFilterProps {
  initialValues?: Partial<MaterialFilterValues>;
  onFilter: (filters: MaterialFilterValues) => void;
  onReset: () => void;
  loading?: boolean;
  collapsible?: boolean;
  className?: string;
}

export function MaterialFilter({
  initialValues = {},
  onFilter,
  onReset,
  loading = false,
  collapsible = false,
  className,
}: MaterialFilterProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [expanded, setExpanded] = useState(!collapsible);
  const [filters, setFilters] = useState<MaterialFilterValues>({
    search: initialValues.search || '',
    category: initialValues.category || '',
    isConfidential: initialValues.isConfidential,
    hasAlias: initialValues.hasAlias,
  });

  // Hooks for data
  const { data: categories = [] } = useMaterialCategories();
  const { data: searchResults = [], isLoading: searchLoading } = useMaterialSearch(
    filters.search || '', 
    5
  );

  const handleInputChange = useCallback((field: keyof MaterialFilterValues, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleCategoryChange = useCallback((event: SelectChangeEvent<string>) => {
    handleInputChange('category', event.target.value);
  }, [handleInputChange]);

  const handleConfidentialChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked ? true : undefined;
    handleInputChange('isConfidential', value);
  }, [handleInputChange]);

  const handleAliasChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked ? true : undefined;
    handleInputChange('hasAlias', value);
  }, [handleInputChange]);

  const handleSearch = useCallback(() => {
    // Clean up empty values
    const cleanFilters: MaterialFilterValues = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        (cleanFilters as any)[key] = value;
      }
    });
    
    onFilter(cleanFilters);
  }, [filters, onFilter]);

  const handleReset = useCallback(() => {
    const resetFilters: MaterialFilterValues = {
      search: '',
      category: '',
      isConfidential: undefined,
      hasAlias: undefined,
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
      filters.category ||
      filters.isConfidential !== undefined ||
      filters.hasAlias !== undefined
    );
  }, [filters]);

  const handleMaterialSelect = useCallback((material: Material | null) => {
    if (material) {
      handleInputChange('search', material.materialName);
    }
  }, [handleInputChange]);

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
        {/* Search with Autocomplete */}
        <Autocomplete
          freeSolo
          size="small"
          options={searchResults}
          value={filters.search}
          loading={searchLoading}
          getOptionLabel={(option) => {
            if (typeof option === 'string') return option;
            return `${option.materialCode} - ${option.materialName}`;
          }}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {option.materialCode}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.materialName}
                </Typography>
              </Box>
            </Box>
          )}
          onChange={(_, value) => {
            if (typeof value === 'string') {
              handleInputChange('search', value);
            } else if (value) {
              handleMaterialSelect(value);
            }
          }}
          onInputChange={(_, value) => {
            handleInputChange('search', value);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="ค้นหาวัสดุ"
              placeholder="ค้นหารหัส หรือชื่อวัสดุ..."
              variant="outlined"
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
          )}
        />

        {/* Category */}
        <FormControl size="small" fullWidth>
          <InputLabel>หมวดหมู่</InputLabel>
          <Select
            value={filters.category || ''}
            onChange={handleCategoryChange}
            label="หมวดหมู่"
          >
            <MenuItem value="">ทั้งหมด</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Filter Switches */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={filters.isConfidential === true}
                onChange={handleConfidentialChange}
                size="small"
              />
            }
            label={
              <Typography variant="body2">
                เฉพาะวัสดุลับ
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={filters.hasAlias === true}
                onChange={handleAliasChange}
                size="small"
              />
            }
            label={
              <Typography variant="body2">
                มีชื่อเทียบเท่า
              </Typography>
            }
          />
        </Box>
      </Box>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={handleReset}
          startIcon={<ClearIcon />}
          disabled={loading || !hasActiveFilters()}
        >
          ล้างตัวกรอง
        </Button>
        <Button
          variant="contained"
          onClick={handleSearch}
          startIcon={<SearchIcon />}
          disabled={loading}
        >
          ค้นหา
        </Button>
      </Stack>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            ตัวกรองที่ใช้งาน:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {filters.search && (
              <Chip
                label={`ค้นหา: ${filters.search}`}
                onDelete={() => handleInputChange('search', '')}
                size="small"
                variant="outlined"
              />
            )}
            {filters.category && (
              <Chip
                label={`หมวดหมู่: ${filters.category}`}
                onDelete={() => handleInputChange('category', '')}
                size="small"
                variant="outlined"
              />
            )}
            {filters.isConfidential === true && (
              <Chip
                label="วัสดุลับ"
                onDelete={() => handleInputChange('isConfidential', undefined)}
                size="small"
                variant="outlined"
                color="error"
              />
            )}
            {filters.hasAlias === true && (
              <Chip
                label="มีชื่อเทียบเท่า"
                onDelete={() => handleInputChange('hasAlias', undefined)}
                size="small"
                variant="outlined"
                color="info"
              />
            )}
          </Stack>
        </Box>
      )}
    </CardContent>
  );

  if (collapsible) {
    return (
      <Card className={className} sx={{ mb: 2 }}>
        <Box
          onClick={handleToggleExpanded}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            <Typography variant="h6">
              ตัวกรองการค้นหา
            </Typography>
            {hasActiveFilters() && (
              <Chip
                label={`${Object.values(filters).filter(v => v !== '' && v !== undefined).length} ตัวกรอง`}
                size="small"
                color="primary"
                variant="filled"
              />
            )}
          </Box>
          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={expanded}>
          {filterContent}
        </Collapse>
      </Card>
    );
  }

  return (
    <Card className={className} sx={{ mb: 2 }}>
      {filterContent}
    </Card>
  );
}

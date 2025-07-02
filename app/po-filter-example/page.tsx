'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { POFilter, POFilterValues } from '@/components/po/POFilterSimple';

// Mock PO data
const mockPOData = [
  {
    id: 'PO-001',
    poNumber: 'PO-2024-001',
    poDate: '2024-01-15',
    deliveryDate: '2024-02-15',
    materialCode: 'MAT-001',
    vendor: 'ABC Company',
    status: 'APPROVED',
    amount: 15000,
  },
  {
    id: 'PO-002',
    poNumber: 'PO-2024-002',
    poDate: '2024-01-20',
    deliveryDate: '2024-02-20',
    materialCode: 'ELE-001',
    vendor: 'XYZ Electronics',
    status: 'PENDING',
    amount: 25000,
  },
  {
    id: 'PO-003',
    poNumber: 'PO-2024-003',
    poDate: '2024-01-25',
    deliveryDate: '2024-02-25',
    materialCode: 'MEC-001',
    vendor: 'Mechanical Parts Ltd',
    status: 'DRAFT',
    amount: 18000,
  },
  {
    id: 'PO-004',
    poNumber: 'PO-2024-004',
    poDate: '2024-02-01',
    deliveryDate: '2024-03-01',
    materialCode: 'MAT-002',
    vendor: 'DEF Materials',
    status: 'SENT',
    amount: 32000,
  },
];

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  DRAFT: 'default',
  PENDING: 'warning',
  APPROVED: 'info',
  SENT: 'primary',
  ACKNOWLEDGED: 'success',
  REJECTED: 'error',
};

export default function POFilterExamplePage() {
  const [filteredData, setFilteredData] = useState(mockPOData);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilter = (filters: POFilterValues) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let filtered = mockPOData;

      // Filter by PO Number
      if (filters.poNumber) {
        filtered = filtered.filter(po => 
          po.poNumber.toLowerCase().includes(filters.poNumber.toLowerCase())
        );
      }

      // Filter by PO Date
      if (filters.poDate) {
        filtered = filtered.filter(po => po.poDate === filters.poDate);
      }

      // Filter by Delivery Date
      if (filters.deliveryDate) {
        filtered = filtered.filter(po => po.deliveryDate === filters.deliveryDate);
      }

      // Filter by Material Code
      if (filters.materialCode) {
        filtered = filtered.filter(po => po.materialCode === filters.materialCode);
      }

      setFilteredData(filtered);
      setIsLoading(false);
    }, 500);
  };

  const handleReset = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setFilteredData(mockPOData);
      setIsLoading(false);
    }, 300);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        ตัวอย่างการใช้งาน PO Filter
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        ใช้ตัวกรองด้านล่างเพื่อค้นหาข้อมูล Purchase Order
      </Typography>

      {/* Filter Component */}
      <POFilter
        onFilter={handleFilter}
        onReset={handleReset}
        loading={isLoading}
        collapsible={true}
        materialCodes={['MAT-001', 'MAT-002', 'ELE-001', 'MEC-001', 'CHE-001']}
      />

      {/* Results */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">
          ผลการค้นหา ({filteredData.length} รายการ)
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell><strong>เลขที่ PO</strong></TableCell>
              <TableCell><strong>วันที่ PO</strong></TableCell>
              <TableCell><strong>วันที่จัดส่ง</strong></TableCell>
              <TableCell><strong>รหัสวัสดุ</strong></TableCell>
              <TableCell><strong>ผู้ขาย</strong></TableCell>
              <TableCell><strong>สถานะ</strong></TableCell>
              <TableCell align="right"><strong>จำนวนเงิน</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((po) => (
                <TableRow key={po.id} hover>
                  <TableCell>{po.poNumber}</TableCell>
                  <TableCell>{new Date(po.poDate).toLocaleDateString('th-TH')}</TableCell>
                  <TableCell>{new Date(po.deliveryDate).toLocaleDateString('th-TH')}</TableCell>
                  <TableCell>{po.materialCode}</TableCell>
                  <TableCell>{po.vendor}</TableCell>
                  <TableCell>
                    <Chip
                      label={po.status}
                      color={statusColors[po.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    ฿{po.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

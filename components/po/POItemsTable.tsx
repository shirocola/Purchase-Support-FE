'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Chip,
  Alert,
} from '@mui/material';
import { POItem } from '@/lib/types/po';

interface POItemsTableProps {
  items: POItem[];
  totalAmount: number;
  currency?: string;
  canViewFinancialData?: boolean;
}

export function POItemsTable({ 
  items, 
  totalAmount, 
  currency = 'THB',
  canViewFinancialData = true 
}: POItemsTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const formatPrice = (price: number) => {
    if (!canViewFinancialData) {
      return '***';
    }
    return `฿${price.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
  };

  const formatTotalAmount = (amount: number) => {
    if (!canViewFinancialData) {
      return '***';
    }
    return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
  };

  if (isMobile) {
    // Mobile card layout
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Items
        </Typography>
        
        {!canViewFinancialData && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Financial information is hidden based on your permission level.
          </Alert>
        )}

        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No items found.
          </Typography>
        ) : (
          items.map((item, index) => (
            <Paper key={item.id} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {item.productName}
              </Typography>
              
              {item.description && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {item.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Quantity
                  </Typography>
                  <Typography variant="body1">
                    {item.quantity.toLocaleString()} {item.unit}
                  </Typography>
                </Box>
                
                {canViewFinancialData && (
                  <>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Unit Price
                      </Typography>
                      <Typography variant="body1">
                        {formatPrice(item.unitPrice)}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatPrice(item.totalPrice)}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Paper>
          ))
        )}
        
        {canViewFinancialData && (
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Total Amount:
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {formatTotalAmount(totalAmount)}
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    );
  }

  // Desktop table layout
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Items
      </Typography>
      
      {!canViewFinancialData && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Financial information is hidden based on your permission level.
        </Alert>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="center">Unit</TableCell>
              {canViewFinancialData && (
                <>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {item.productName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {item.description || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {item.quantity.toLocaleString()}
                </TableCell>
                <TableCell align="center">
                  <Chip label={item.unit} size="small" variant="outlined" />
                </TableCell>
                {canViewFinancialData && (
                  <>
                    <TableCell align="right">
                      {formatPrice(item.unitPrice)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">
                        {formatPrice(item.totalPrice)}
                      </Typography>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            
            {/* Total row */}
            {canViewFinancialData && (
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell colSpan={5} align="right">
                  <Typography variant="h6" fontWeight="bold">
                    Total Amount:
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {formatTotalAmount(totalAmount)}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default POItemsTable;
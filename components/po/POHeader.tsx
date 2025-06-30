'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Business,
  Email,
  Phone,
  LocationOn,
  AttachFile,
} from '@mui/icons-material';
import { PurchaseOrder } from '@/lib/types/po';
import { formatDate } from '@/lib/utils/permissions';

interface POHeaderProps {
  po: PurchaseOrder;
}

export function POHeader({ po }: POHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Purchase Order {po.poNumber}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {po.title}
          </Typography>
        </Box>

        {/* Vendor Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business color="primary" />
            Vendor Information
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 3,
              mt: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {po.vendor.name}
              </Typography>
              {po.vendor.contactPerson && (
                <Typography variant="body2" color="text.secondary">
                  Contact: {po.vendor.contactPerson}
                </Typography>
              )}
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Email fontSize="small" color="action" />
                <Typography variant="body2">{po.vendor.email}</Typography>
              </Box>
              {po.vendor.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2">{po.vendor.phone}</Typography>
                </Box>
              )}
              {po.vendor.address && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2">{po.vendor.address}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* PO Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Order Details
          </Typography>
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: 2,
              mt: 2,
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                Created Date
              </Typography>
              <Typography variant="body1">
                {formatDate(po.createdAt)}
              </Typography>
            </Box>
            
            {po.requiredDate && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Required Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(po.requiredDate)}
                </Typography>
              </Box>
            )}
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="h6" color="primary">
                {po.totalAmount.toLocaleString()} {po.currency}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip 
                label={po.status.replace('_', ' ')} 
                color="primary" 
                variant="outlined"
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
        </Box>

        {/* Description and Remarks */}
        {(po.description || po.remarks) && (
          <Box sx={{ mb: 3 }}>
            {po.description && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {po.description}
                </Typography>
              </Box>
            )}
            
            {po.remarks && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Remarks
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {po.remarks}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Attachments */}
        {(po as any).attachments && (po as any).attachments.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachFile fontSize="small" />
              Attachments
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {(po as any).attachments.map((attachment: any, index: number) => (
                <Chip
                  key={index}
                  label={`📎 ${attachment.name}`}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default POHeader;
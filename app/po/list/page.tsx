import React from 'react';
import { Container, Box } from '@mui/material';
import { RoleGuard } from '@/components/guards/RoleGuard';
import POList from '@/components/po/POList';

export default function POListPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <RoleGuard requiredRole="AppUser">
          <POList />
        </RoleGuard>
      </Box>
    </Container>
  );
}

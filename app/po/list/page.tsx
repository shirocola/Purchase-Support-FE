import React from 'react';
import { Container, Box } from '@mui/material';
import POList from '@/components/po/POList';

export default function POListPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <POList />
      </Box>
    </Container>
  );
}

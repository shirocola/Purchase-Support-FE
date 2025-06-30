'use client';

import React from 'react';
import { Box, Container, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import POAcknowledgeStatus from '@/components/po/POAcknowledgeStatus';
import { UserRole } from '@/lib/types/po';

export default function POAcknowledgeStatusPage() {
  const router = useRouter();
  const params = useParams();
  const poId = params.id as string;

  // For demo purposes, using ADMIN role. In real app, this would come from auth context
  const userRole = UserRole.ADMIN;

  const handleBack = () => {
    router.back();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          variant="outlined"
          size="small"
        >
          กลับ
        </Button>
      </Box>
      
      <POAcknowledgeStatus poId={poId} userRole={userRole} />
    </Container>
  );
}
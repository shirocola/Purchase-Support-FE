'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { POEmailForm } from '@/components/po/POEmailForm';
import { UserRole } from '@/lib/types/po';

// Mock user context - in real app this would come from auth context
const mockUser = {
  role: UserRole.MATERIAL_CONTROL, // This would be dynamic based on logged in user
};

export default function POEmailFormPage() {
  const params = useParams();
  const router = useRouter();
  const poId = params?.id as string;

  if (!poId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">PO ID is required</p>
      </div>
    );
  }

  const handleBack = () => {
    router.push(`/po/${poId}/edit`);
  };

  const handleSuccess = () => {
    // Navigate back to edit page after successful email send
    router.push(`/po/${poId}/edit`);
  };

  return (
    <POEmailForm
      poId={poId}
      userRole={mockUser.role}
      onBack={handleBack}
      onSuccess={handleSuccess}
    />
  );
}
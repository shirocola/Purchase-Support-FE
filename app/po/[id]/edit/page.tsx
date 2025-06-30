'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { POEditPreview } from '@/components/po/POEditPreview';
import { UserRole } from '@/lib/types/po';

// Mock user context - in real app this would come from auth context
const mockUser = {
  role: UserRole.MATERIAL_CONTROL, // This would be dynamic based on logged in user
};

export default function POEditPreviewPage() {
  const params = useParams();
  const poId = params?.id as string;

  if (!poId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">PO ID is required</p>
      </div>
    );
  }

  return (
    <POEditPreview
      poId={poId}
      userRole={mockUser.role}
    />
  );
}
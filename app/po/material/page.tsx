'use client';

import React from 'react';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { MaterialManagement } from '@/components/po/MaterialManagement';

export default function MaterialPage() {
  return (
    <RoleGuard requiredRole="MaterialControl">
      <MaterialManagement />
    </RoleGuard>
  );
}

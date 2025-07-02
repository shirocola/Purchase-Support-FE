import { UserRole, RolePermissions } from '@/lib/types/po';

/**
 * Get permissions for a user role when editing PO
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  switch (role) {
    case UserRole.ADMIN:
      return {
        canEditBasicInfo: true,
        canEditItems: true,
        canEditVendor: true,
        canEditRemarks: true,
        canSendEmail: true,
        canSave: true,
        canApprove: true,
        canCancel: true,
        canViewAcknowledgeStatus: true,
        canResendEmail: true,
        canCopyAcknowledgeLink: true,
        maskedFields: []
      };

    case UserRole.MATERIAL_CONTROL:
      return {
        canEditBasicInfo: true,
        canEditItems: true,
        canEditVendor: false, // Can't change vendor
        canEditRemarks: true,
        canSendEmail: true,
        canSave: true,
        canApprove: false,
        canCancel: false,
        canViewAcknowledgeStatus: true,
        canResendEmail: true,
        canCopyAcknowledgeLink: true,
        maskedFields: []
      };

    case UserRole.APP_USER:
      return {
        canEditBasicInfo: false,
        canEditItems: false,
        canEditVendor: false,
        canEditRemarks: true, // Can only edit remarks
        canSendEmail: false,
        canSave: true,
        canApprove: false,
        canCancel: false,
        canViewAcknowledgeStatus: true,
        canResendEmail: false,
        canCopyAcknowledgeLink: false,
        maskedFields: ['unitPrice', 'totalPrice', 'totalAmount'] // Mask price info
      };

    case UserRole.VENDOR:
      return {
        canEditBasicInfo: false,
        canEditItems: false,
        canEditVendor: false,
        canEditRemarks: false,
        canSendEmail: false,
        canSave: false,
        canApprove: false,
        canCancel: false,
        canViewAcknowledgeStatus: false, // Vendors shouldn't see internal tracking
        canResendEmail: false,
        canCopyAcknowledgeLink: false,
        maskedFields: ['unitPrice', 'totalPrice', 'totalAmount', 'createdBy']
      };

    default:
      return {
        canEditBasicInfo: false,
        canEditItems: false,
        canEditVendor: false,
        canEditRemarks: false,
        canSendEmail: false,
        canSave: false,
        canApprove: false,
        canCancel: false,
        canViewAcknowledgeStatus: false,
        canResendEmail: false,
        canCopyAcknowledgeLink: false,
        maskedFields: []
      };
  }
}

/**
 * Check if a field should be masked for a user role
 */
export function shouldMaskField(fieldName: string, role: UserRole): boolean {
  const permissions = getRolePermissions(role);
  return permissions.maskedFields.includes(fieldName);
}

/**
 * Mask sensitive data based on user role
 */
export function maskValue(value: unknown, fieldName: string, role: UserRole): unknown {
  if (shouldMaskField(fieldName, role)) {
    if (typeof value === 'number') {
      return '***';
    }
    if (typeof value === 'string') {
      return '***';
    }
    return '***';
  }
  return value;
}

/**
 * Format currency value with masking support
 */
export function formatCurrency(amount: number, currency: string = 'THB', role?: UserRole, fieldName?: string): string {
  if (role && fieldName && shouldMaskField(fieldName, role)) {
    return '***';
  }
  
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Format date string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get status color for PO status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'default';
    case 'PENDING_APPROVAL':
      return 'warning';
    case 'APPROVED':
      return 'info';
    case 'SENT':
      return 'primary';
    case 'ACKNOWLEDGED':
      return 'success';
    case 'REJECTED':
      return 'error';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
}

/**
 * Check if a user can edit material alias names
 */
export function canUserEditMaterial(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.MATERIAL_CONTROL;
}

/**
 * Mask sensitive material data based on user role and confidentiality
 */
export function maskMaterialValue(value: string, role: UserRole, isConfidential: boolean): string {
  // Only vendors see masked confidential material data
  if (role === UserRole.VENDOR && isConfidential) {
    return '***';
  }
  return value;
}
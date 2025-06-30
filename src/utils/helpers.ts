import { format, parseISO } from 'date-fns';
import { POStatus, Permission, UserRole } from '@/types/po';

export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy');
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm');
  } catch {
    return dateString;
  }
};

export const formatCurrency = (amount: number, currency: string = 'THB'): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const getStatusColor = (status: POStatus): string => {
  const statusColors: Record<POStatus, string> = {
    [POStatus.DRAFT]: '#9e9e9e',
    [POStatus.PENDING_APPROVAL]: '#ff9800',
    [POStatus.APPROVED]: '#2196f3',
    [POStatus.SENT_TO_VENDOR]: '#9c27b0',
    [POStatus.ACKNOWLEDGED]: '#4caf50',
    [POStatus.COMPLETED]: '#8bc34a',
    [POStatus.CANCELLED]: '#f44336',
  };
  return statusColors[status] || '#9e9e9e';
};

export const getStatusText = (status: POStatus): string => {
  const statusTexts: Record<POStatus, string> = {
    [POStatus.DRAFT]: 'ร่าง',
    [POStatus.PENDING_APPROVAL]: 'รออนุมัติ',
    [POStatus.APPROVED]: 'อนุมัติแล้ว',
    [POStatus.SENT_TO_VENDOR]: 'ส่งให้ผู้ขายแล้ว',
    [POStatus.ACKNOWLEDGED]: 'ผู้ขายยืนยันแล้ว',
    [POStatus.COMPLETED]: 'เสร็จสิ้น',
    [POStatus.CANCELLED]: 'ยกเลิก',
  };
  return statusTexts[status] || status;
};

export const hasPermission = (userPermissions: Permission[], requiredPermission: Permission): boolean => {
  return userPermissions.includes(requiredPermission);
};

export const canViewPO = (userRole: UserRole, userPermissions: Permission[]): boolean => {
  return hasPermission(userPermissions, Permission.VIEW_ALL_PO) || 
         hasPermission(userPermissions, Permission.VIEW_OWN_PO);
};

export const canEditPO = (userPermissions: Permission[]): boolean => {
  return hasPermission(userPermissions, Permission.EDIT_PO);
};

export const canDeletePO = (userPermissions: Permission[]): boolean => {
  return hasPermission(userPermissions, Permission.DELETE_PO);
};

export const canSendPOEmail = (userPermissions: Permission[]): boolean => {
  return hasPermission(userPermissions, Permission.SEND_PO_EMAIL);
};

export const canApprovePO = (userPermissions: Permission[]): boolean => {
  return hasPermission(userPermissions, Permission.APPROVE_PO);
};
// Purchase Order types and interfaces

export interface POItem {
  id: string;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  title: string;
  status: POStatus;
  vendor: Vendor;
  items: POItem[];
  totalAmount: number;
  currency: string;
  requestedDate: string;
  requiredDate?: string;
  description?: string;
  remarks?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  emailSentAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  // Metadata for tracking
  auditLog?: AuditLogEntry[];
}

export interface AuditLogEntry {
  id: string;
  action: string;
  fieldName?: string;
  oldValue?: unknown;
  newValue?: unknown;
  timestamp: string;
  userId: string;
  userName: string;
}

export enum POStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  SENT = 'SENT',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum UserRole {
  APP_USER = 'AppUser',
  MATERIAL_CONTROL = 'MaterialControl',
  ADMIN = 'Admin',
  VENDOR = 'Vendor'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: string[];
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// Form types for editing PO
export interface POEditFormData {
  title: string;
  description?: string;
  remarks?: string;
  requiredDate?: string;
  items: POItem[];
  vendor: Vendor;
}

// Permission mapping for different roles
export interface RolePermissions {
  canEditBasicInfo: boolean;
  canEditItems: boolean;
  canEditVendor: boolean;
  canEditRemarks: boolean;
  canSendEmail: boolean;
  canSave: boolean;
  canApprove: boolean;
  canCancel: boolean;
  maskedFields: string[];
}
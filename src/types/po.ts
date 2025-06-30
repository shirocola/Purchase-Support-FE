export interface PurchaseOrder {
  id: string;
  poNumber: string;
  createdDate: string;
  vendor: {
    id: string;
    name: string;
    email?: string;
  };
  status: POStatus;
  totalAmount: number;
  currency: string;
  description?: string;
  requesterName: string;
  departmentName: string;
  approvedDate?: string;
  sentDate?: string;
  acknowledgedDate?: string;
  items: POItem[];
}

export interface POItem {
  id: string;
  itemCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
}

export enum POStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  SENT_TO_VENDOR = 'SENT_TO_VENDOR',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface POListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: POStatus[];
  vendorId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdDate' | 'poNumber' | 'totalAmount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface POListResponse {
  data: PurchaseOrder[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MATERIAL_CONTROL = 'MATERIAL_CONTROL',
  APP_USER = 'APP_USER',
  VENDOR = 'VENDOR'
}

export enum Permission {
  VIEW_ALL_PO = 'VIEW_ALL_PO',
  VIEW_OWN_PO = 'VIEW_OWN_PO',
  CREATE_PO = 'CREATE_PO',
  EDIT_PO = 'EDIT_PO',
  DELETE_PO = 'DELETE_PO',
  APPROVE_PO = 'APPROVE_PO',
  SEND_PO_EMAIL = 'SEND_PO_EMAIL',
  ACKNOWLEDGE_PO = 'ACKNOWLEDGE_PO'
}
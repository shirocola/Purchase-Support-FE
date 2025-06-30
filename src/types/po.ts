export interface POItem {
  id: string
  name: string
  description?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  unit: string
}

export interface Vendor {
  id: string
  name: string
  email: string
  address?: string
  phone?: string
}

export interface POStatus {
  id: string
  status: 'draft' | 'pending' | 'sent' | 'acknowledged' | 'completed' | 'cancelled'
  statusDate: string
  description?: string
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  date: string
  vendor: Vendor
  items: POItem[]
  totalAmount: number
  currentStatus: POStatus
  statusHistory: POStatus[]
  notes?: string
  attachments?: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface AuditLogEntry {
  id: string
  poId: string
  action: string
  description: string
  userId: string
  userName: string
  timestamp: string
  oldValue?: any
  newValue?: any
  metadata?: Record<string, any>
}

export interface User {
  id: string
  name: string
  email: string
  role: 'AppUser' | 'MaterialControl' | 'Admin' | 'Vendor'
}

export interface Permission {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canSendEmail: boolean
  canViewAuditLog: boolean
  canViewFinancialData: boolean
}
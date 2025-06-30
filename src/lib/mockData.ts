import { PurchaseOrder, AuditLogEntry, Permission, User } from '@/types/po'

export const mockPO: PurchaseOrder = {
  id: '1',
  poNumber: 'PO-001',
  date: '2024-06-30',
  vendor: {
    id: 'vendor-1',
    name: 'ABC Supplies Co., Ltd.',
    email: 'contact@abcsupplies.com',
    address: '123 Industrial Road, Bangkok 10400',
    phone: '+66-2-123-4567',
  },
  items: [
    {
      id: 'item-1',
      name: 'Steel Pipes',
      description: 'Stainless steel pipes 4 inch diameter',
      quantity: 50,
      unitPrice: 1250.00,
      totalPrice: 62500.00,
      unit: 'pcs',
    },
    {
      id: 'item-2',
      name: 'Industrial Bolts',
      description: 'M12 x 80mm galvanized bolts',
      quantity: 200,
      unitPrice: 25.00,
      totalPrice: 5000.00,
      unit: 'pcs',
    },
    {
      id: 'item-3',
      name: 'Safety Equipment',
      description: 'Hard hats and safety vests',
      quantity: 20,
      unitPrice: 350.00,
      totalPrice: 7000.00,
      unit: 'sets',
    },
  ],
  totalAmount: 74500.00,
  currentStatus: {
    id: 'status-3',
    status: 'sent',
    statusDate: '2024-06-30T10:30:00Z',
    description: 'PO sent to vendor for acknowledgment',
  },
  statusHistory: [
    {
      id: 'status-1',
      status: 'draft',
      statusDate: '2024-06-29T14:00:00Z',
      description: 'PO created as draft',
    },
    {
      id: 'status-2',
      status: 'pending',
      statusDate: '2024-06-30T09:00:00Z',
      description: 'PO submitted for approval',
    },
    {
      id: 'status-3',
      status: 'sent',
      statusDate: '2024-06-30T10:30:00Z',
      description: 'PO sent to vendor for acknowledgment',
    },
  ],
  notes: 'Urgent delivery required. Please confirm delivery date within 24 hours.',
  attachments: ['technical-specs.pdf', 'delivery-instructions.pdf'],
  createdBy: 'user-1',
  createdAt: '2024-06-29T14:00:00Z',
  updatedAt: '2024-06-30T10:30:00Z',
}

export const mockAuditLog: AuditLogEntry[] = [
  {
    id: 'audit-1',
    poId: '1',
    action: 'CREATE',
    description: 'Purchase Order created',
    userId: 'user-1',
    userName: 'John Smith',
    timestamp: '2024-06-29T14:00:00Z',
    metadata: { source: 'web_app' },
  },
  {
    id: 'audit-2',
    poId: '1',
    action: 'UPDATE',
    description: 'Added delivery notes',
    userId: 'user-1',
    userName: 'John Smith',
    timestamp: '2024-06-29T16:30:00Z',
    oldValue: { notes: '' },
    newValue: { notes: 'Urgent delivery required. Please confirm delivery date within 24 hours.' },
  },
  {
    id: 'audit-3',
    poId: '1',
    action: 'STATUS_CHANGE',
    description: 'Status changed from draft to pending',
    userId: 'user-1',
    userName: 'John Smith',
    timestamp: '2024-06-30T09:00:00Z',
    oldValue: { status: 'draft' },
    newValue: { status: 'pending' },
  },
  {
    id: 'audit-4',
    poId: '1',
    action: 'EMAIL_SENT',
    description: 'PO sent to vendor via email',
    userId: 'user-2',
    userName: 'Jane Doe',
    timestamp: '2024-06-30T10:30:00Z',
    metadata: { 
      recipientEmail: 'contact@abcsupplies.com',
      emailSubject: 'Purchase Order PO-001 - ABC Supplies Co., Ltd.',
    },
  },
]

export const mockPermissions: Permission = {
  canView: true,
  canEdit: true,
  canDelete: false,
  canSendEmail: true,
  canViewAuditLog: true,
  canViewFinancialData: true,
}

export const mockUser: User = {
  id: 'user-1',
  name: 'John Smith',
  email: 'john.smith@company.com',
  role: 'MaterialControl',
}
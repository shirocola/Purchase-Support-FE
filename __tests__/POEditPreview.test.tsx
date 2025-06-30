import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { POEditPreview } from '@/components/po/POEditPreview';
import { UserRole, POStatus, PurchaseOrder } from '@/lib/types/po';
import * as POHooks from '@/lib/hooks/usePO';

// Mock the hooks
jest.mock('@/lib/hooks/usePO');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

const mockPO: PurchaseOrder = {
  id: 'po-001',
  poNumber: 'PO-2024-001',
  title: 'Test Purchase Order',
  status: POStatus.DRAFT,
  vendor: {
    id: 'vendor-001',
    name: 'Test Vendor Co., Ltd.',
    email: 'vendor@test.com',
    contactPerson: 'John Doe',
    phone: '02-123-4567',
    address: '123 Test Street, Bangkok',
  },
  items: [
    {
      id: 'item-001',
      productName: 'Test Product 1',
      description: 'Test description',
      quantity: 10,
      unitPrice: 100,
      totalPrice: 1000,
      unit: 'pcs',
    },
    {
      id: 'item-002',
      productName: 'Test Product 2',
      quantity: 5,
      unitPrice: 200,
      totalPrice: 1000,
      unit: 'kg',
    },
  ],
  totalAmount: 2000,
  currency: 'THB',
  requestedDate: '2024-01-01',
  requiredDate: '2024-01-15',
  description: 'Test PO description',
  remarks: 'Test remarks',
  createdBy: 'user-001',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const theme = createTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe('POEditPreview Component', () => {
  const mockUsePO = jest.mocked(POHooks.usePO);
  const mockUseUpdatePO = jest.mocked(POHooks.useUpdatePO);
  const mockUseSendPOEmail = jest.mocked(POHooks.useSendPOEmail);

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUsePO.mockReturnValue({
      data: mockPO,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    mockUseUpdatePO.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
    } as any);

    mockUseSendPOEmail.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
    } as any);
  });

  describe('Basic Rendering', () => {
    it('renders PO information correctly', () => {
      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      expect(screen.getByText('ตัวอย่าง PO')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Purchase Order')).toBeInTheDocument();
      expect(screen.getByDisplayValue('PO-2024-001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Vendor Co., Ltd.')).toBeInTheDocument();
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      mockUsePO.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      expect(screen.getByText('กำลังโหลดข้อมูล PO...')).toBeInTheDocument();
    });

    it('shows error state when fetch fails', () => {
      mockUsePO.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch'),
        refetch: jest.fn(),
      } as any);

      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  describe('Role-based Permissions', () => {
    it('shows edit button for MaterialControl role', () => {
      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      expect(screen.getByText('แก้ไข')).toBeInTheDocument();
      expect(screen.getByText('ส่งอีเมล')).toBeInTheDocument();
    });

    it('hides price information for AppUser role', () => {
      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.APP_USER} />
        </TestWrapper>
      );

      // Price columns should not be visible
      expect(screen.queryByText('ราคาต่อหน่วย')).not.toBeInTheDocument();
      expect(screen.queryByText('รวม')).not.toBeInTheDocument();
    });

    it('shows all information for Admin role', () => {
      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.ADMIN} />
        </TestWrapper>
      );

      expect(screen.getByText('แก้ไข')).toBeInTheDocument();
      expect(screen.getByText('ส่งอีเมล')).toBeInTheDocument();
      expect(screen.getByText('ราคาต่อหน่วย')).toBeInTheDocument();
      expect(screen.getByText('รวม')).toBeInTheDocument();
    });

    it('limits editing capabilities for AppUser role', () => {
      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.APP_USER} />
        </TestWrapper>
      );

      // Should not show edit button for basic info
      expect(screen.queryByText('แก้ไข')).not.toBeInTheDocument();
      expect(screen.queryByText('ส่งอีเมล')).not.toBeInTheDocument();
    });
  });

  describe('Edit Functionality', () => {
    it('enters edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      const editButton = screen.getByText('แก้ไข');
      await user.click(editButton);

      expect(screen.getByText('แก้ไข PO')).toBeInTheDocument();
      expect(screen.getByText('บันทึก')).toBeInTheDocument();
      expect(screen.getByText('ยกเลิก')).toBeInTheDocument();
    });

    it('cancels edit mode and resets form', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      // Enter edit mode
      await user.click(screen.getByText('แก้ไข'));

      // Modify a field
      const titleField = screen.getByDisplayValue('Test Purchase Order');
      await user.clear(titleField);
      await user.type(titleField, 'Modified Title');

      // Cancel
      await user.click(screen.getByText('ยกเลิก'));

      expect(screen.getByText('ตัวอย่าง PO')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Purchase Order')).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      // Enter edit mode
      await user.click(screen.getByText('แก้ไข'));

      // Clear required field
      const titleField = screen.getByDisplayValue('Test Purchase Order');
      await user.clear(titleField);

      // Try to save
      await user.click(screen.getByText('บันทึก'));

      await waitFor(() => {
        expect(screen.getByText('กรุณาระบุชื่อ PO')).toBeInTheDocument();
      });
    });
  });

  describe('Save Functionality', () => {
    it('shows confirmation dialog when saving', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      // Enter edit mode and modify
      await user.click(screen.getByText('แก้ไข'));
      const titleField = screen.getByDisplayValue('Test Purchase Order');
      await user.clear(titleField);
      await user.type(titleField, 'Modified Title');

      // Click save
      await user.click(screen.getByText('บันทึก'));

      expect(screen.getByText('ยืนยันการบันทึก')).toBeInTheDocument();
      expect(screen.getByText('คุณต้องการบันทึกการเปลี่ยนแปลงหรือไม่?')).toBeInTheDocument();
    });

    it('calls update API when confirmed', async () => {
      const mockMutateAsync = jest.fn().mockResolvedValue(mockPO);
      mockUseUpdatePO.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
      } as any);

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      // Enter edit mode and modify
      await user.click(screen.getByText('แก้ไข'));
      const titleField = screen.getByDisplayValue('Test Purchase Order');
      await user.clear(titleField);
      await user.type(titleField, 'Modified Title');

      // Save and confirm
      await user.click(screen.getByText('บันทึก'));
      await user.click(screen.getByText('ยืนยัน'));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          id: 'po-001',
          data: expect.objectContaining({
            title: 'Modified Title',
          }),
        });
      });
    });
  });

  describe('Email Functionality', () => {
    it('shows send email button for approved PO', () => {
      mockUsePO.mockReturnValue({
        data: { ...mockPO, status: POStatus.APPROVED },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      expect(screen.getByText('ส่งอีเมล')).toBeInTheDocument();
    });

    it('shows confirmation dialog when sending email', async () => {
      mockUsePO.mockReturnValue({
        data: { ...mockPO, status: POStatus.APPROVED },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      await user.click(screen.getByText('ส่งอีเมล'));

      expect(screen.getByText('ยืนยันการส่งอีเมล')).toBeInTheDocument();
      expect(screen.getByText(/คุณต้องการส่งอีเมล PO ให้กับ Test Vendor Co\., Ltd\. หรือไม่/)).toBeInTheDocument();
    });

    it('calls send email API when confirmed', async () => {
      const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
      mockUseSendPOEmail.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        isError: false,
        isSuccess: false,
        error: null,
      } as any);

      mockUsePO.mockReturnValue({
        data: { ...mockPO, status: POStatus.APPROVED },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      await user.click(screen.getByText('ส่งอีเมล'));
      await user.click(screen.getByText('ยืนยัน'));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith('po-001');
      });
    });
  });

  describe('Responsive Design', () => {
    it('renders without errors on mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      expect(screen.getByText('Test Purchase Order')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error when save fails', async () => {
      const mockMutateAsync = jest.fn().mockRejectedValue(new Error('Save failed'));
      mockUseUpdatePO.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        isError: true,
        isSuccess: false,
        error: new Error('Save failed'),
      } as any);

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      // Enter edit mode and try to save
      await user.click(screen.getByText('แก้ไข'));
      await user.click(screen.getByText('บันทึก'));
      await user.click(screen.getByText('ยืนยัน'));

      await waitFor(() => {
        expect(screen.getByText('Save failed')).toBeInTheDocument();
      });
    });

    it('displays error when email sending fails', async () => {
      const mockMutateAsync = jest.fn().mockRejectedValue(new Error('Email failed'));
      mockUseSendPOEmail.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        isError: true,
        isSuccess: false,
        error: new Error('Email failed'),
      } as any);

      mockUsePO.mockReturnValue({
        data: { ...mockPO, status: POStatus.APPROVED },
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEditPreview poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      await user.click(screen.getByText('ส่งอีเมล'));
      await user.click(screen.getByText('ยืนยัน'));

      await waitFor(() => {
        expect(screen.getByText('Email failed')).toBeInTheDocument();
      });
    });
  });
});
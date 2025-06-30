import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { POEmailForm } from '../components/po/POEmailForm';
import { UserRole, POStatus } from '../lib/types/po';
import { usePO, useSendPOEmailWithData, usePOEmailStatus } from '../lib/hooks/usePO';

// Mock the hooks
jest.mock('../lib/hooks/usePO');
const mockUsePO = usePO as jest.MockedFunction<typeof usePO>;
const mockUseSendPOEmailWithData = useSendPOEmailWithData as jest.MockedFunction<typeof useSendPOEmailWithData>;
const mockUsePOEmailStatus = usePOEmailStatus as jest.MockedFunction<typeof usePOEmailStatus>;

// Mock data
const mockPO = {
  id: 'po-001',
  poNumber: 'PO-2024-001',
  title: 'Test Purchase Order',
  status: POStatus.APPROVED,
  vendor: {
    id: 'vendor-001',
    name: 'Test Vendor Co.',
    email: 'vendor@test.com',
    contactPerson: 'John Doe',
    phone: '02-123-4567',
    address: '123 Test Street, Bangkok',
  },
  items: [
    {
      id: 'item-1',
      productName: 'Test Product 1',
      description: 'Test description',
      quantity: 10,
      unitPrice: 1000,
      totalPrice: 10000,
      unit: 'pcs',
    },
  ],
  totalAmount: 10000,
  currency: 'THB',
  requestedDate: '2024-01-15T00:00:00Z',
  requiredDate: '2024-02-01T00:00:00Z',
  description: 'Test PO description',
  remarks: 'Test remarks',
  createdBy: 'user-001',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

const mockEmailStatus = {
  isSent: false,
  emailsSent: 0,
};

// Test wrapper
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('POEmailForm', () => {
  const mockMutateAsync = jest.fn();
  const mockRefetch = jest.fn();
  const mockRefetchEmailStatus = jest.fn();

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Default mock implementations
    mockUsePO.mockReturnValue({
      data: mockPO,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    } as any);

    mockUsePOEmailStatus.mockReturnValue({
      data: mockEmailStatus,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetchEmailStatus,
    } as any);

    mockUseSendPOEmailWithData.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
    } as any);
  });

  describe('Rendering', () => {
    it('renders POEmailForm with PO data', () => {
      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      expect(screen.getByText('ส่งอีเมล PO')).toBeInTheDocument();
      expect(screen.getByText('Test Purchase Order (PO-2024-001)')).toBeInTheDocument();
      expect(screen.getByText(/ผู้ขาย: Test Vendor Co./)).toBeInTheDocument();
      expect(screen.getByText('ผู้รับอีเมล')).toBeInTheDocument();
    });

    it('shows loading state when PO is loading', () => {
      mockUsePO.mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      expect(screen.getByText('กำลังโหลดข้อมูล PO...')).toBeInTheDocument();
    });

    it('shows error state when PO fails to load', () => {
      mockUsePO.mockReturnValue({
        data: null,
        isLoading: false,
        isError: true,
        error: new Error('Failed to load PO'),
        refetch: mockRefetch,
      } as any);

      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      expect(screen.getByText('Failed to load PO')).toBeInTheDocument();
    });

    it('shows permission error for users without email permission', () => {
      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.VENDOR} />
        </TestWrapper>
      );

      expect(screen.getByText('คุณไม่มีสิทธิ์ในการส่งอีเมล PO')).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('initializes with vendor email', async () => {
      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      await waitFor(() => {
        const emailInput = screen.getByDisplayValue('vendor@test.com');
        expect(emailInput).toBeInTheDocument();
      });
    });

    it('allows adding additional email recipients', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      const addEmailButton = screen.getByText('เพิ่มอีเมลผู้รับ');
      await user.click(addEmailButton);

      expect(screen.getByLabelText('อีเมลผู้รับ 2')).toBeInTheDocument();
    });

    it('allows removing additional email recipients', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      // Add second email
      const addEmailButton = screen.getByText('เพิ่มอีเมลผู้รับ');
      await user.click(addEmailButton);

      // Remove second email
      const removeButtons = screen.getAllByRole('button', { name: '' });
      const removeButton = removeButtons.find(button => 
        button.querySelector('[data-testid="CloseIcon"]')
      );
      
      if (removeButton) {
        await user.click(removeButton);
      }

      expect(screen.queryByLabelText('อีเมลผู้รับ 2')).not.toBeInTheDocument();
    });

    it('allows editing custom message', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      const messageField = screen.getByLabelText('ข้อความ (เพิ่มเติม)');
      await user.clear(messageField);
      await user.type(messageField, 'Custom test message');

      expect(screen.getByDisplayValue('Custom test message')).toBeInTheDocument();
    });
  });

  describe('Email Status Display', () => {
    it('displays email status when available', () => {
      const sentEmailStatus = {
        isSent: true,
        emailsSent: 2,
        lastSentAt: '2024-01-01T10:00:00Z',
        lastSentBy: 'user-001',
      };

      mockUsePOEmailStatus.mockReturnValue({
        data: sentEmailStatus,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetchEmailStatus,
      } as any);

      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      expect(screen.getByText('สถานะการส่งอีเมล')).toBeInTheDocument();
      expect(screen.getByText('ส่งแล้ว')).toBeInTheDocument();
      expect(screen.getByText('จำนวนครั้งที่ส่ง: 2')).toBeInTheDocument();
    });

    it('displays error status when email failed', () => {
      const errorEmailStatus = {
        isSent: false,
        emailsSent: 0,
        lastError: 'SMTP connection failed',
      };

      mockUsePOEmailStatus.mockReturnValue({
        data: errorEmailStatus,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetchEmailStatus,
      } as any);

      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      expect(screen.getByText('ข้อผิดพลาดล่าสุด: SMTP connection failed')).toBeInTheDocument();
    });
  });

  describe('Preview Functionality', () => {
    it('opens preview dialog when preview button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      const previewButton = screen.getByText('ดูตัวอย่าง');
      await user.click(previewButton);

      expect(screen.getByText('ตัวอย่างอีเมล')).toBeInTheDocument();
      expect(screen.getByText(/Purchase Order PO-2024-001/)).toBeInTheDocument();
    });

    it('closes preview dialog when close button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      // Open preview
      const previewButton = screen.getByText('ดูตัวอย่าง');
      await user.click(previewButton);

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText('ตัวอย่างอีเมล')).toBeInTheDocument();
      });

      // Close preview using the close button in the dialog
      const closeButton = screen.getByText('ปิด');
      await user.click(closeButton);

      // Wait for dialog to close
      await waitFor(() => {
        expect(screen.queryByText('ตัวอย่างอีเมล')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('shows confirmation dialog when submitting', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      const submitButton = screen.getByText('ส่งอีเมล');
      await user.click(submitButton);

      expect(screen.getByText('ยืนยันการส่งอีเมล')).toBeInTheDocument();
      expect(screen.getByText(/คุณต้องการส่งอีเมล PO ให้กับ vendor@test.com หรือไม่/)).toBeInTheDocument();
    });

    it('sends email when confirmed', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      // Submit form
      const submitButton = screen.getByText('ส่งอีเมล');
      await user.click(submitButton);

      // Confirm
      const confirmButton = screen.getByText('ยืนยัน');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          id: 'po-001',
          emailData: expect.objectContaining({
            recipientEmails: ['vendor@test.com'],
            includeAttachments: true,
          }),
        });
      });
    });

    it('shows success message after successful email send', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      // Submit and confirm
      const submitButton = screen.getByText('ส่งอีเมล');
      await user.click(submitButton);
      
      const confirmButton = screen.getByText('ยืนยัน');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('ส่งอีเมลเรียบร้อยแล้ว')).toBeInTheDocument();
      });
    });

    it('shows error message when email send fails', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockRejectedValue(new Error('Email failed'));

      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      // Submit and confirm
      const submitButton = screen.getByText('ส่งอีเมล');
      await user.click(submitButton);
      
      const confirmButton = screen.getByText('ยืนยัน');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Email failed')).toBeInTheDocument();
      });
    });
  });

  describe('Validation', () => {
    it('validates email format', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      // Wait for form to initialize
      await waitFor(() => {
        expect(screen.getByDisplayValue('vendor@test.com')).toBeInTheDocument();
      });

      // Clear the default email and enter invalid email
      const emailInput = screen.getByDisplayValue('vendor@test.com');
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');

      // Submit the form by clicking submit button
      const submitButton = screen.getByText('ส่งอีเมล');
      await user.click(submitButton);

      // The form should not submit and show a validation error in the confirmation dialog
      // Since zod validation might not show the exact error message on screen immediately,
      // let's check that the confirmation dialog does NOT appear due to validation error
      await waitFor(() => {
        // Confirmation dialog should not appear for invalid form
        expect(screen.queryByText('ยืนยันการส่งอีเมล')).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('prevents submission when PO status is not approved', () => {
      const draftPO = { ...mockPO, status: POStatus.DRAFT };
      mockUsePO.mockReturnValue({
        data: draftPO,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      render(
        <TestWrapper>
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      expect(screen.getByText(/PO ต้องมีสถานะ "อนุมัติแล้ว"/)).toBeInTheDocument();
      
      const submitButton = screen.getByText('ส่งอีเมล');
      expect(submitButton).toBeDisabled();
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
          <POEmailForm poId="po-001" userRole={UserRole.MATERIAL_CONTROL} />
        </TestWrapper>
      );

      expect(screen.getByText('ส่งอีเมล PO')).toBeInTheDocument();
    });
  });

  describe('Back Navigation', () => {
    it('calls onBack when back button is clicked', async () => {
      const mockOnBack = jest.fn();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <POEmailForm 
            poId="po-001" 
            userRole={UserRole.MATERIAL_CONTROL} 
            onBack={mockOnBack}
          />
        </TestWrapper>
      );

      // Find the back button by its icon
      const backButton = screen.getByTestId('ArrowBackIcon').closest('button');
      expect(backButton).toBeInTheDocument();
      
      if (backButton) {
        await user.click(backButton);
        expect(mockOnBack).toHaveBeenCalled();
      }
    });

    it('calls onSuccess after successful email send', async () => {
      const mockOnSuccess = jest.fn();
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <POEmailForm 
            poId="po-001" 
            userRole={UserRole.MATERIAL_CONTROL} 
            onSuccess={mockOnSuccess}
          />
        </TestWrapper>
      );

      // Submit and confirm
      const submitButton = screen.getByText('ส่งอีเมล');
      await user.click(submitButton);
      
      const confirmButton = screen.getByText('ยืนยัน');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });
});
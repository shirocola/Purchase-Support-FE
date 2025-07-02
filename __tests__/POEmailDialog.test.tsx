import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { POEmailDialog } from '@/components/po/POEmailDialog';
import { mockPO } from '@/lib/mockData';

// Mock Material-UI components that need special handling
jest.mock('@mui/material/Dialog', () => {
  return function MockDialog({ children, open, ...props }: any) {
    return open ? <div data-testid="email-dialog" {...props}>{children}</div> : null;
  };
});

describe('POEmailDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSendSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when open with PO data', () => {
    render(
      <POEmailDialog
        open={true}
        onClose={mockOnClose}
        po={mockPO}
        onSendSuccess={mockOnSendSuccess}
      />
    );

    expect(screen.getByTestId('email-dialog')).toBeInTheDocument();
    expect(screen.getByText('ส่งอีเมล PO')).toBeInTheDocument();
    expect(screen.getByText(`PO: ${mockPO.poNumber} - ${mockPO.title}`)).toBeInTheDocument();
  });

  it('initializes with vendor email as TO recipient', () => {
    render(
      <POEmailDialog
        open={true}
        onClose={mockOnClose}
        po={mockPO}
        onSendSuccess={mockOnSendSuccess}
      />
    );

    expect(screen.getByDisplayValue(mockPO.vendor.email)).toBeInTheDocument();
    expect(screen.getByText('TO:')).toBeInTheDocument();
  });

  it('allows adding new email recipients', async () => {
    const user = userEvent.setup();
    
    render(
      <POEmailDialog
        open={true}
        onClose={mockOnClose}
        po={mockPO}
        onSendSuccess={mockOnSendSuccess}
      />
    );

    const emailInput = screen.getByLabelText('เพิ่มอีเมล');
    const addButton = screen.getByText('เพิ่ม');

    await user.type(emailInput, 'test@example.com');
    await user.click(addButton);

    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    
    render(
      <POEmailDialog
        open={true}
        onClose={mockOnClose}
        po={mockPO}
        onSendSuccess={mockOnSendSuccess}
      />
    );

    const emailInput = screen.getByLabelText('เพิ่มอีเมล');
    const addButton = screen.getByText('เพิ่ม');

    await user.type(emailInput, 'invalid-email');
    await user.click(addButton);

    expect(screen.getByText('รูปแบบอีเมลไม่ถูกต้อง')).toBeInTheDocument();
  });

  it('prevents duplicate emails', async () => {
    const user = userEvent.setup();
    
    render(
      <POEmailDialog
        open={true}
        onClose={mockOnClose}
        po={mockPO}
        onSendSuccess={mockOnSendSuccess}
      />
    );

    const emailInput = screen.getByLabelText('เพิ่มอีเมล');
    const addButton = screen.getByText('เพิ่ม');

    // Try to add the same email as vendor
    await user.type(emailInput, mockPO.vendor.email);
    await user.click(addButton);

    expect(screen.getByText('อีเมลนี้มีอยู่ในรายการแล้ว')).toBeInTheDocument();
  });

  it('allows editing existing email recipients', async () => {
    const user = userEvent.setup();
    
    render(
      <POEmailDialog
        open={true}
        onClose={mockOnClose}
        po={mockPO}
        onSendSuccess={mockOnSendSuccess}
      />
    );

    const vendorEmailField = screen.getByDisplayValue(mockPO.vendor.email);
    
    await user.clear(vendorEmailField);
    await user.type(vendorEmailField, 'updated@vendor.com');

    expect(screen.getByDisplayValue('updated@vendor.com')).toBeInTheDocument();
  });

  it('can switch recipient type between TO and CC', async () => {
    const user = userEvent.setup();
    
    render(
      <POEmailDialog
        open={true}
        onClose={mockOnClose}
        po={mockPO}
        onSendSuccess={mockOnSendSuccess}
      />
    );

    const toCcButton = screen.getByText('→ CC');
    await user.click(toCcButton);

    expect(screen.getByText('CC:')).toBeInTheDocument();
  });

  it('validates form before sending', async () => {
    const user = userEvent.setup();
    
    render(
      <POEmailDialog
        open={true}
        onClose={mockOnClose}
        po={mockPO}
        onSendSuccess={mockOnSendSuccess}
      />
    );

    // Remove the vendor email (TO recipient)
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    const sendButton = screen.getByText('ส่งอีเมล');
    await user.click(sendButton);

    expect(screen.getByText('กรุณาระบุผู้รับอีเมลอย่างน้อย 1 คน')).toBeInTheDocument();
  });

  it('sends email successfully', async () => {
    const user = userEvent.setup();
    
    render(
      <POEmailDialog
        open={true}
        onClose={mockOnClose}
        po={mockPO}
        onSendSuccess={mockOnSendSuccess}
      />
    );

    const sendButton = screen.getByText('ส่งอีเมล');
    await user.click(sendButton);

    // Should show loading state
    expect(screen.getByText('กำลังส่ง...')).toBeInTheDocument();

    // Wait for success
    await waitFor(() => {
      expect(mockOnSendSuccess).toHaveBeenCalledWith(mockPO, expect.any(String));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('does not render when po is null', () => {
    render(
      <POEmailDialog
        open={true}
        onClose={mockOnClose}
        po={null}
        onSendSuccess={mockOnSendSuccess}
      />
    );

    expect(screen.queryByTestId('email-dialog')).not.toBeInTheDocument();
  });
});

describe('POEmailDialog Integration', () => {
  it('populates email template correctly', () => {
    render(
      <POEmailDialog
        open={true}
        onClose={jest.fn()}
        po={mockPO}
        onSendSuccess={jest.fn()}
      />
    );

    expect(screen.getByDisplayValue(`Purchase Order ${mockPO.poNumber} - ${mockPO.title}`)).toBeInTheDocument();
    
    const messageField = screen.getByLabelText('ข้อความ');
    expect(messageField).toHaveValue(expect.stringContaining(mockPO.poNumber));
    expect(messageField).toHaveValue(expect.stringContaining(mockPO.title));
  });
});

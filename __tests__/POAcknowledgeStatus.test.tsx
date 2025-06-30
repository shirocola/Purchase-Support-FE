import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import POAcknowledgeStatus from '../components/po/POAcknowledgeStatus';
import { POAcknowledgeStatus as AckStatus, UserRole } from '../lib/types/po';
import * as usePOHooks from '../lib/hooks/usePO';

// Mock the hooks
jest.mock('../lib/hooks/usePO');

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

const mockUsePOAcknowledgeStatus = usePOHooks.usePOAcknowledgeStatus as jest.MockedFunction<typeof usePOHooks.usePOAcknowledgeStatus>;
const mockUseResendPOEmail = usePOHooks.useResendPOEmail as jest.MockedFunction<typeof usePOHooks.useResendPOEmail>;
const mockUsePOAcknowledgeLink = usePOHooks.usePOAcknowledgeLink as jest.MockedFunction<typeof usePOHooks.usePOAcknowledgeLink>;

// Mock data
const mockAcknowledgeData = {
  status: AckStatus.SENT_PENDING,
  emailSentAt: '2024-01-15T10:00:00Z',
  emailSentBy: 'admin@company.com',
  vendorEmail: 'vendor@example.com',
  vendorName: 'ABC Supplier Co., Ltd.',
  emailsSent: 1,
  lastEmailSentAt: '2024-01-15T10:00:00Z',
};

const mockAcknowledgedData = {
  ...mockAcknowledgeData,
  status: AckStatus.ACKNOWLEDGED,
  acknowledgedAt: '2024-01-15T14:30:00Z',
  acknowledgedBy: 'vendor@example.com',
};

const mockRejectedData = {
  ...mockAcknowledgeData,
  status: AckStatus.REJECTED,
  rejectedAt: '2024-01-15T16:00:00Z',
  rejectionReason: 'ราคาไม่เหมาะสม',
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  const theme = createTheme();
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('POAcknowledgeStatus', () => {
  const mockProps = {
    poId: 'po-001',
    userRole: UserRole.ADMIN,
  };

  const mockResendMutation = {
    mutateAsync: jest.fn(),
    isPending: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseResendPOEmail.mockReturnValue(mockResendMutation as any);
    mockUsePOAcknowledgeLink.mockReturnValue({
      data: 'https://example.com/acknowledge/12345',
      refetch: jest.fn(),
    } as any);
  });

  describe('Loading and Error States', () => {
    it('shows loading state when data is loading', () => {
      mockUsePOAcknowledgeStatus.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<POAcknowledgeStatus {...mockProps} />, { wrapper: createWrapper() });

      expect(screen.getByText('กำลังโหลดสถานะการรับทราบ...')).toBeInTheDocument();
    });

    it('shows error state when data loading fails', () => {
      const mockRefetch = jest.fn();
      mockUsePOAcknowledgeStatus.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
        refetch: mockRefetch,
      } as any);

      render(<POAcknowledgeStatus {...mockProps} />, { wrapper: createWrapper() });

      expect(screen.getByText('Network error')).toBeInTheDocument();
      
      const retryButton = screen.getByText('ลองใหม่');
      fireEvent.click(retryButton);
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('shows permission error for users without access', () => {
      mockUsePOAcknowledgeStatus.mockReturnValue({
        data: mockAcknowledgeData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(
        <POAcknowledgeStatus {...mockProps} userRole={UserRole.VENDOR} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('คุณไม่มีสิทธิ์ในการดูสถานะการรับทราบ PO')).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('displays pending status correctly', () => {
      mockUsePOAcknowledgeStatus.mockReturnValue({
        data: mockAcknowledgeData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<POAcknowledgeStatus {...mockProps} />, { wrapper: createWrapper() });

      expect(screen.getByText('รอ vendor ยืนยัน')).toBeInTheDocument();
      expect(screen.getByText('อีเมลถูกส่งให้ vendor แล้ว กำลังรอการยืนยันจาก vendor')).toBeInTheDocument();
      expect(screen.getByText('ABC Supplier Co., Ltd.')).toBeInTheDocument();
      expect(screen.getByText('vendor@example.com')).toBeInTheDocument();
    });

    it('displays acknowledged status correctly', () => {
      mockUsePOAcknowledgeStatus.mockReturnValue({
        data: mockAcknowledgedData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<POAcknowledgeStatus {...mockProps} />, { wrapper: createWrapper() });

      expect(screen.getByText('vendor รับทราบแล้ว')).toBeInTheDocument();
      expect(screen.getByText('vendor ได้รับทราบและยืนยัน PO แล้ว')).toBeInTheDocument();
    });

    it('displays rejected status correctly', () => {
      mockUsePOAcknowledgeStatus.mockReturnValue({
        data: mockRejectedData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<POAcknowledgeStatus {...mockProps} />, { wrapper: createWrapper() });

      expect(screen.getByText('vendor ปฏิเสธ')).toBeInTheDocument();
      expect(screen.getByText('vendor ปฏิเสธ PO นี้')).toBeInTheDocument();
      expect(screen.getByText(/เหตุผล: ราคาไม่เหมาะสม/)).toBeInTheDocument();
    });
  });

  describe('Email Timeline', () => {
    it('displays email timeline information', () => {
      mockUsePOAcknowledgeStatus.mockReturnValue({
        data: mockAcknowledgeData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<POAcknowledgeStatus {...mockProps} />, { wrapper: createWrapper() });

      expect(screen.getByText('จำนวนครั้งที่ส่ง: 1 ครั้ง')).toBeInTheDocument();
      expect(screen.getByText(/ส่งโดย: admin@company.com/)).toBeInTheDocument();
    });

    it('displays error message when present', () => {
      const dataWithError = {
        ...mockAcknowledgeData,
        lastError: 'อีเมลเซิร์ฟเวอร์ไม่ตอบสนอง',
      };

      mockUsePOAcknowledgeStatus.mockReturnValue({
        data: dataWithError,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<POAcknowledgeStatus {...mockProps} />, { wrapper: createWrapper() });

      expect(screen.getByText('ข้อผิดพลาดล่าสุด: อีเมลเซิร์ฟเวอร์ไม่ตอบสนอง')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    beforeEach(() => {
      mockUsePOAcknowledgeStatus.mockReturnValue({
        data: mockAcknowledgeData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);
    });

    it('shows action buttons for users with permissions', () => {
      render(<POAcknowledgeStatus {...mockProps} />, { wrapper: createWrapper() });

      expect(screen.getByText('ส่งอีเมลซ้ำ')).toBeInTheDocument();
      expect(screen.getByText('คัดลอกลิงก์ยืนยัน')).toBeInTheDocument();
    });

    it('hides action buttons for users without permissions', () => {
      render(
        <POAcknowledgeStatus {...mockProps} userRole={UserRole.APP_USER} />,
        { wrapper: createWrapper() }
      );

      expect(screen.queryByText('ส่งอีเมลซ้ำ')).not.toBeInTheDocument();
      expect(screen.queryByText('คัดลอกลิงก์ยืนยัน')).not.toBeInTheDocument();
    });

    it('handles resend email with confirmation', async () => {
      render(<POAcknowledgeStatus {...mockProps} />, { wrapper: createWrapper() });

      const resendButton = screen.getByText('ส่งอีเมลซ้ำ');
      fireEvent.click(resendButton);

      expect(screen.getByText('ยืนยันการส่งอีเมลซ้ำ')).toBeInTheDocument();
      expect(screen.getByText('คุณต้องการส่งอีเมล PO ให้ vendor ซ้ำอีกครั้งหรือไม่?')).toBeInTheDocument();

      const confirmButton = screen.getByText('ยืนยัน');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockResendMutation.mutateAsync).toHaveBeenCalledWith('po-001');
      });
    });

    it('handles copy link action', async () => {
      const mockClipboard = navigator.clipboard.writeText as jest.MockedFunction<typeof navigator.clipboard.writeText>;
      mockClipboard.mockResolvedValueOnce();

      render(<POAcknowledgeStatus {...mockProps} />, { wrapper: createWrapper() });

      const copyButton = screen.getByText('คัดลอกลิงก์ยืนยัน');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockClipboard).toHaveBeenCalledWith('https://example.com/acknowledge/12345');
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('refreshes data when refresh button is clicked', () => {
      const mockRefetch = jest.fn();
      mockUsePOAcknowledgeStatus.mockReturnValue({
        data: mockAcknowledgeData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
      } as any);

      render(<POAcknowledgeStatus {...mockProps} />, { wrapper: createWrapper() });

      const refreshButton = screen.getByRole('button', { name: /รีเฟรชข้อมูล/i });
      fireEvent.click(refreshButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Design', () => {
    // Mock matchMedia for mobile testing
    beforeAll(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('max-width: 900px'), // Mock mobile
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    });

    it('renders correctly on mobile devices', () => {
      mockUsePOAcknowledgeStatus.mockReturnValue({
        data: mockAcknowledgeData,
        isLoading: false,
        isError: false,
        error: null,
        refetch: jest.fn(),
      } as any);

      render(<POAcknowledgeStatus {...mockProps} />, { wrapper: createWrapper() });

      // Component should still render all content
      expect(screen.getByText('สถานะการรับทราบ PO')).toBeInTheDocument();
      expect(screen.getByText('รอ vendor ยืนยัน')).toBeInTheDocument();
    });
  });
});
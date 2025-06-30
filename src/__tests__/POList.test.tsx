import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import POList from '@/components/POList';
import { Permission, POStatus } from '@/types/po';
import * as poService from '@/services/poService';

// Mock the poService
jest.mock('@/services/poService');
const mockedPoService = poService as jest.Mocked<typeof poService>;

// Mock window.alert
global.alert = jest.fn();

// Mock data
const mockPOData = {
  data: [
    {
      id: '1',
      poNumber: 'PO-2024-001',
      createdDate: '2024-01-15T10:00:00Z',
      vendor: {
        id: 'vendor1',
        name: 'ABC Supplier Co., Ltd.',
        email: 'contact@abc-supplier.com',
      },
      status: POStatus.APPROVED,
      totalAmount: 50000,
      currency: 'THB',
      description: 'Office supplies',
      requesterName: 'John Doe',
      departmentName: 'IT Department',
      items: [],
    },
    {
      id: '2',
      poNumber: 'PO-2024-002',
      createdDate: '2024-01-16T14:30:00Z',
      vendor: {
        id: 'vendor2',
        name: 'XYZ Trading Ltd.',
        email: 'sales@xyz-trading.com',
      },
      status: POStatus.SENT_TO_VENDOR,
      totalAmount: 75000,
      currency: 'THB',
      description: 'Computer equipment',
      requesterName: 'Jane Smith',
      departmentName: 'HR Department',
      items: [],
    },
  ],
  totalCount: 2,
  totalPages: 1,
  currentPage: 1,
  pageSize: 25,
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
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
};

describe('POList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedPoService.default = {
      getPOList: jest.fn().mockResolvedValue(mockPOData),
      getPOById: jest.fn(),
      sendPOEmail: jest.fn().mockResolvedValue(undefined),
      getAcknowledgmentStatus: jest.fn(),
    };
  });

  it('renders the PO list with data', async () => {
    render(
      <TestWrapper>
        <POList userPermissions={[Permission.VIEW_ALL_PO]} />
      </TestWrapper>
    );

    // Check if the title is rendered
    expect(screen.getByText('รายการ Purchase Order')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('PO-2024-001')).toBeInTheDocument();
    });

    expect(screen.getByText('PO-2024-002')).toBeInTheDocument();
    expect(screen.getByText('ABC Supplier Co., Ltd.')).toBeInTheDocument();
    expect(screen.getByText('XYZ Trading Ltd.')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(
      <TestWrapper>
        <POList userPermissions={[Permission.VIEW_ALL_PO]} />
      </TestWrapper>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows empty state when no data', async () => {
    mockedPoService.default.getPOList = jest.fn().mockResolvedValue({
      ...mockPOData,
      data: [],
      totalCount: 0,
    });

    render(
      <TestWrapper>
        <POList userPermissions={[Permission.VIEW_ALL_PO]} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('ไม่พบรายการ Purchase Order')).toBeInTheDocument();
    });
  });

  it('handles search functionality', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <POList userPermissions={[Permission.VIEW_ALL_PO]} />
      </TestWrapper>
    );

    const searchInput = screen.getByLabelText('ค้นหา PO');
    await user.type(searchInput, 'PO-2024-001');

    // Wait for debounced search
    await waitFor(
      () => {
        expect(mockedPoService.default.getPOList).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'PO-2024-001',
            page: 1,
          })
        );
      },
      { timeout: 1000 }
    );
  });

  it('handles status filter', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <POList userPermissions={[Permission.VIEW_ALL_PO]} />
      </TestWrapper>
    );

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByText('PO-2024-001')).toBeInTheDocument();
    });

    // Find the status filter specifically (the first combobox that's not part of the data grid)
    const statusDropdowns = screen.getAllByRole('combobox');
    const statusDropdown = statusDropdowns[0]; // The status filter should be the first one
    await user.click(statusDropdown);

    // Wait for the dropdown to open and find the menu option (not the chip)
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'อนุมัติแล้ว' })).toBeInTheDocument();
    });

    // Select APPROVED status - use the option role to be specific
    const approvedOption = screen.getByRole('option', { name: 'อนุมัติแล้ว' });
    await user.click(approvedOption);

    await waitFor(() => {
      expect(mockedPoService.default.getPOList).toHaveBeenCalledWith(
        expect.objectContaining({
          status: [POStatus.APPROVED],
          page: 1,
        })
      );
    });
  });

  it('shows action buttons based on permissions', async () => {
    const permissions = [
      Permission.VIEW_ALL_PO,
      Permission.EDIT_PO,
      Permission.SEND_PO_EMAIL,
      Permission.DELETE_PO,
    ];

    render(
      <TestWrapper>
        <POList userPermissions={permissions} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('PO-2024-001')).toBeInTheDocument();
    });

    // Check if action buttons are present
    expect(screen.getAllByLabelText('ดูรายละเอียด')).toHaveLength(2);
    expect(screen.getAllByLabelText('แก้ไข')).toHaveLength(2);
    expect(screen.getAllByLabelText('ส่งอีเมล')).toHaveLength(2);
    expect(screen.getAllByLabelText('ลบ')).toHaveLength(2);
  });

  it('hides action buttons when permissions are not granted', async () => {
    render(
      <TestWrapper>
        <POList userPermissions={[Permission.VIEW_ALL_PO]} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('PO-2024-001')).toBeInTheDocument();
    });

    // Should only show view buttons
    expect(screen.getAllByLabelText('ดูรายละเอียด')).toHaveLength(2);
    expect(screen.queryByLabelText('แก้ไข')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('ส่งอีเมล')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('ลบ')).not.toBeInTheDocument();
  });

  it('handles send email action', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <POList userPermissions={[Permission.VIEW_ALL_PO, Permission.SEND_PO_EMAIL]} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('PO-2024-001')).toBeInTheDocument();
    });

    // Mock window.alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    const emailButtons = screen.getAllByLabelText('ส่งอีเมล');
    await user.click(emailButtons[0]);

    await waitFor(() => {
      expect(mockedPoService.default.sendPOEmail).toHaveBeenCalledWith('1');
    });

    expect(alertSpy).toHaveBeenCalledWith('ส่งอีเมลสำเร็จ');

    alertSpy.mockRestore();
  });

  it('handles error state', async () => {
    mockedPoService.default.getPOList = jest.fn().mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <POList userPermissions={[Permission.VIEW_ALL_PO]} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/เกิดข้อผิดพลาด/)).toBeInTheDocument();
    });

    expect(screen.getByText('ลองใหม่')).toBeInTheDocument();
  });

  it('handles refresh action', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <POList userPermissions={[Permission.VIEW_ALL_PO]} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('PO-2024-001')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('รีเฟรช');
    await user.click(refreshButton);

    // Should call the API again
    expect(mockedPoService.default.getPOList).toHaveBeenCalledTimes(2);
  });

  it('formats currency correctly', async () => {
    render(
      <TestWrapper>
        <POList userPermissions={[Permission.VIEW_ALL_PO]} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('฿50,000.00')).toBeInTheDocument();
      expect(screen.getByText('฿75,000.00')).toBeInTheDocument();
    });
  });

  it('formats status correctly', async () => {
    render(
      <TestWrapper>
        <POList userPermissions={[Permission.VIEW_ALL_PO]} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('อนุมัติแล้ว')).toBeInTheDocument();
      expect(screen.getByText('ส่งให้ผู้ขายแล้ว')).toBeInTheDocument();
    });
  });
});
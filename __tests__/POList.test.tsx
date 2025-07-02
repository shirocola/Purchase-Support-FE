import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import POList from '@/components/po/POList';
import * as POHooks from '@/lib/hooks/usePO';

// Mock the hooks
jest.mock('@/lib/hooks/usePO');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/lib/contexts/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user',
      username: 'testuser',
      email: 'test@example.com',
      role: 'MaterialControl',
      permissions: [],
    },
  }),
}));

const theme = createTheme();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('POList Component', () => {
  const mockUsePOList = POHooks.usePOList as jest.MockedFunction<typeof POHooks.usePOList>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUsePOList.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    } as any);
  });

  test('renders loading state initially', () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <POList />
      </Wrapper>
    );

    expect(screen.getByText('กำลังโหลดรายการ PO...')).toBeInTheDocument();
  });

  test('renders with mock data when loaded', () => {
    const mockData = {
      items: [
        {
          id: 'po-001',
          poNumber: 'PO-2024-001',
          title: 'Test PO',
          status: 'DRAFT',
          vendor: { name: 'Test Vendor', id: 'v1', email: 'test@test.com' },
          totalAmount: 1000,
          currency: 'THB',
          createdAt: '2024-01-01T00:00:00Z',
          createdBy: 'user1',
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    mockUsePOList.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <POList />
      </Wrapper>
    );

    expect(screen.getByText('รายการ Purchase Order')).toBeInTheDocument();
    expect(screen.getByText('PO-2024-001')).toBeInTheDocument();
    expect(screen.getByText('Test PO')).toBeInTheDocument();
  });

  test('renders empty state when no data', () => {
    const mockData = {
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };

    mockUsePOList.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <POList />
      </Wrapper>
    );

    expect(screen.getByText('ไม่พบรายการ Purchase Order')).toBeInTheDocument();
  });
});

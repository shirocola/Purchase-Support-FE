import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { RoleGuard, AccessDeniedScreen } from '../components/guards/RoleGuard';
import { useAuth } from '../lib/contexts/auth-context';
import { RoleManager } from '../lib/utils/role-management';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('../lib/contexts/auth-context');
jest.mock('../lib/utils/role-management');

const mockRouter = {
  push: jest.fn(),
};

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('RoleGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
    RoleManager.isValidRole = jest.fn().mockReturnValue(true);
  });

  describe('Loading State', () => {
    it('should show loading spinner when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        isLoading: true,
        isAuthenticated: false,
        user: null,
        setCurrentUser: jest.fn(),
        logout: jest.fn(),
      });

      render(
        <RoleGuard requiredRole="AppUser">
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('กำลังตรวจสอบสิทธิ์...')).toBeInTheDocument();
    });
  });

  describe('Authentication', () => {
    it('should redirect to login when not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        setCurrentUser: jest.fn(),
        logout: jest.fn(),
      });

      render(
        <RoleGuard requiredRole="AppUser">
          <div>Protected Content</div>
        </RoleGuard>
      );

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
      });
    });

    it('should return null when user is null', () => {
      mockUseAuth.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        user: null,
        setCurrentUser: jest.fn(),
        logout: jest.fn(),
      });

      const { container } = render(
        <RoleGuard requiredRole="AppUser">
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Role Authorization', () => {
    it('should render children when user has required role', () => {
      mockUseAuth.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        user: { role: 'AppUser' } as any,
        setCurrentUser: jest.fn(),
        logout: jest.fn(),
      });

      render(
        <RoleGuard requiredRole="AppUser">
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should render children when user has one of multiple required roles', () => {
      mockUseAuth.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        user: { role: 'MaterialControl' } as any,
        setCurrentUser: jest.fn(),
        logout: jest.fn(),
      });

      render(
        <RoleGuard requiredRole={['AppUser', 'MaterialControl']}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should show access denied when user lacks required role', () => {
      mockUseAuth.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        user: { role: 'AppUser' } as any,
        setCurrentUser: jest.fn(),
        logout: jest.fn(),
      });

      render(
        <RoleGuard requiredRole="MaterialControl">
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('ไม่มีสิทธิ์เข้าถึง')).toBeInTheDocument();
      expect(screen.getByText(/ต้องการสิทธิ์: MaterialControl/)).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided and access denied', () => {
      mockUseAuth.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        user: { role: 'AppUser' } as any,
        setCurrentUser: jest.fn(),
        logout: jest.fn(),
      });

      const CustomFallback = () => <div>Custom Access Denied</div>;

      render(
        <RoleGuard requiredRole="MaterialControl" fallback={<CustomFallback />}>
          <div>Protected Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Custom Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('ไม่มีสิทธิ์เข้าถึง')).not.toBeInTheDocument();
    });
  });
});

describe('AccessDeniedScreen', () => {
  it('should display correct role information', () => {
    const mockOnGoHome = jest.fn();

    render(
      <AccessDeniedScreen
        currentRole="AppUser"
        allowedRoles={['MaterialControl']}
        onGoHome={mockOnGoHome}
      />
    );

    expect(screen.getByText('ไม่มีสิทธิ์เข้าถึง')).toBeInTheDocument();
    expect(screen.getByText(/ต้องการสิทธิ์: MaterialControl/)).toBeInTheDocument();
  });

  it('should call onGoHome when home button clicked', async () => {
    const mockOnGoHome = jest.fn();
    const user = userEvent.setup();

    render(
      <AccessDeniedScreen
        currentRole="AppUser"
        allowedRoles={['MaterialControl']}
        onGoHome={mockOnGoHome}
      />
    );

    await user.click(screen.getByText('กลับหน้าแรก'));
    expect(mockOnGoHome).toHaveBeenCalledTimes(1);
  });

  it('should show debug info in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <AccessDeniedScreen
        currentRole="AppUser"
        allowedRoles={['MaterialControl']}
        onGoHome={jest.fn()}
      />
    );

    expect(screen.getByText('🔍 Debug Info:')).toBeInTheDocument();
    expect(screen.getByText(/Current Role:/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});
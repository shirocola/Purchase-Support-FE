import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { AuthGuard, withAuthGuard, useRequireAuth } from '@/components/auth/AuthGuard';
import { UserRole } from '@/lib/types/po';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

const theme = createTheme();

const mockPush = jest.fn();
const mockPathname = '/protected-page';

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
  });
  (usePathname as jest.Mock).mockReturnValue(mockPathname);
});

// Test components
const ProtectedContent = () => <div data-testid="protected-content">Protected Content</div>;

const TestComponentWithHook = () => {
  const { isAuthenticated, isLoading } = useRequireAuth();
  
  if (isLoading) return <div data-testid="hook-loading">Loading...</div>;
  if (!isAuthenticated) return <div data-testid="hook-unauthorized">Unauthorized</div>;
  
  return <div data-testid="hook-authorized">Authorized Content</div>;
};

const renderWithAuth = (
  component: React.ReactElement,
  isAuthenticated = true,
  enableMockAuth = true,
  defaultRole: UserRole = UserRole.MATERIAL_CONTROL
) => {
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider 
        enableMockAuth={enableMockAuth} 
        defaultRole={isAuthenticated ? defaultRole : undefined}
      >
        {component}
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('AuthGuard', () => {
  describe('Authenticated User', () => {
    it('should render children when user is authenticated', async () => {
      renderWithAuth(
        <AuthGuard>
          <ProtectedContent />
        </AuthGuard>,
        true
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should redirect authenticated user from login page', async () => {
      renderWithAuth(
        <AuthGuard requireAuth={false}>
          <div data-testid="login-form">Login Form</div>
        </AuthGuard>,
        true
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Unauthenticated User', () => {
    it('should redirect to login when user is not authenticated', async () => {
      // Mock unauthenticated state
      const UnauthenticatedProvider = ({ children }: { children: React.ReactNode }) => {
        return (
          <AuthProvider enableMockAuth={false}>
            {children}
          </AuthProvider>
        );
      };

      render(
        <ThemeProvider theme={theme}>
          <UnauthenticatedProvider>
            <AuthGuard>
              <ProtectedContent />
            </AuthGuard>
          </UnauthenticatedProvider>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=%2Fprotected-page');
      });
    });

    it('should render children for non-authenticated pages', async () => {
      const UnauthenticatedProvider = ({ children }: { children: React.ReactNode }) => {
        return (
          <AuthProvider enableMockAuth={false}>
            {children}
          </AuthProvider>
        );
      };

      render(
        <ThemeProvider theme={theme}>
          <UnauthenticatedProvider>
            <AuthGuard requireAuth={false}>
              <div data-testid="public-content">Public Content</div>
            </AuthGuard>
          </UnauthenticatedProvider>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('public-content')).toBeInTheDocument();
      });
    });

    it('should use custom redirect URL', async () => {
      const UnauthenticatedProvider = ({ children }: { children: React.ReactNode }) => {
        return (
          <AuthProvider enableMockAuth={false}>
            {children}
          </AuthProvider>
        );
      };

      render(
        <ThemeProvider theme={theme}>
          <UnauthenticatedProvider>
            <AuthGuard redirectTo="/custom-login">
              <ProtectedContent />
            </AuthGuard>
          </UnauthenticatedProvider>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/custom-login');
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading fallback during auth check', () => {
      const LoadingAuthProvider = ({ children }: { children: React.ReactNode }) => {
        const [isLoading] = React.useState(true);
        
        // Mock loading state
        const mockAuthContext = {
          user: null,
          isLoading: true,
          isAuthenticated: false,
          login: jest.fn(),
          logout: jest.fn(),
          switchRole: jest.fn(),
          refreshUser: jest.fn(),
        };

        return (
          <div>
            {isLoading ? (
              <AuthGuard>
                <ProtectedContent />
              </AuthGuard>
            ) : children}
          </div>
        );
      };

      render(
        <ThemeProvider theme={theme}>
          <LoadingAuthProvider>
            <div>Not shown</div>
          </LoadingAuthProvider>
        </ThemeProvider>
      );

      // Should show default loading state
      expect(screen.getByText('กำลังตรวจสอบสิทธิ์การเข้าใช้...')).toBeInTheDocument();
    });

    it('should use custom fallback component', () => {
      const LoadingAuthProvider = ({ children }: { children: React.ReactNode }) => {
        return (
          <AuthProvider enableMockAuth={false}>
            {children}
          </AuthProvider>
        );
      };

      const customFallback = <div data-testid="custom-fallback">Custom Loading</div>;

      render(
        <ThemeProvider theme={theme}>
          <LoadingAuthProvider>
            <AuthGuard fallback={customFallback}>
              <ProtectedContent />
            </AuthGuard>
          </LoadingAuthProvider>
        </ThemeProvider>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    });
  });

  describe('withAuthGuard HOC', () => {
    it('should wrap component with auth guard', async () => {
      const GuardedComponent = withAuthGuard(ProtectedContent);

      renderWithAuth(<GuardedComponent />, true);

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should apply custom options to auth guard', async () => {
      const GuardedComponent = withAuthGuard(ProtectedContent, {
        requireAuth: false,
      });

      renderWithAuth(<GuardedComponent />, false);

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should preserve component display name', () => {
      const TestComponent = () => <div>Test</div>;
      TestComponent.displayName = 'TestComponent';
      
      const GuardedComponent = withAuthGuard(TestComponent);
      
      expect(GuardedComponent.displayName).toBe('withAuthGuard(TestComponent)');
    });
  });

  describe('useRequireAuth Hook', () => {
    it('should work with authenticated user', async () => {
      renderWithAuth(<TestComponentWithHook />, true);

      await waitFor(() => {
        expect(screen.getByTestId('hook-authorized')).toBeInTheDocument();
      });
    });

    it('should redirect unauthenticated user', async () => {
      const UnauthenticatedProvider = ({ children }: { children: React.ReactNode }) => {
        return (
          <AuthProvider enableMockAuth={false}>
            {children}
          </AuthProvider>
        );
      };

      render(
        <ThemeProvider theme={theme}>
          <UnauthenticatedProvider>
            <TestComponentWithHook />
          </UnauthenticatedProvider>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=%2Fprotected-page');
      });
    });

    it('should use custom redirect URL', async () => {
      const TestComponentWithCustomRedirect = () => {
        useRequireAuth('/custom-auth');
        return <div data-testid="custom-content">Content</div>;
      };

      const UnauthenticatedProvider = ({ children }: { children: React.ReactNode }) => {
        return (
          <AuthProvider enableMockAuth={false}>
            {children}
          </AuthProvider>
        );
      };

      render(
        <ThemeProvider theme={theme}>
          <UnauthenticatedProvider>
            <TestComponentWithCustomRedirect />
          </UnauthenticatedProvider>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/custom-auth');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle auth state changes gracefully', async () => {
      const { rerender } = renderWithAuth(
        <AuthGuard>
          <ProtectedContent />
        </AuthGuard>,
        true
      );

      // Initially authenticated
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      // Rerender with unauthenticated state
      rerender(
        <ThemeProvider theme={theme}>
          <AuthProvider enableMockAuth={false}>
            <AuthGuard>
              <ProtectedContent />
            </AuthGuard>
          </AuthProvider>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=%2Fprotected-page');
      });
    });
  });
});
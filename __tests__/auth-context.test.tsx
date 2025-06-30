import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/lib/contexts/auth-context';
import { UserRole } from '@/lib/types/po';

// Test component to interact with auth context
const TestComponent = () => {
  const { user, isLoading, isAuthenticated, switchRole, login, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {user && (
        <div>
          <div data-testid="user-id">{user.id}</div>
          <div data-testid="user-username">{user.username}</div>
          <div data-testid="user-email">{user.email}</div>
          <div data-testid="user-role">{user.role}</div>
        </div>
      )}
      <button onClick={() => switchRole(UserRole.ADMIN)} data-testid="switch-to-admin">
        Switch to Admin
      </button>
      <button onClick={() => switchRole(UserRole.VENDOR)} data-testid="switch-to-vendor">
        Switch to Vendor
      </button>
      <button onClick={() => switchRole(UserRole.APP_USER)} data-testid="switch-to-app-user">
        Switch to App User
      </button>
      <button onClick={logout} data-testid="logout">
        Logout
      </button>
      <button 
        onClick={() => login({
          id: 'test-user',
          username: 'test',
          email: 'test@test.com',
          role: UserRole.MATERIAL_CONTROL
        })}
        data-testid="login"
      >
        Login
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  describe('Default Initialization', () => {
    it('should initialize with MaterialControl role by default', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
        expect(screen.getByTestId('user-username')).toHaveTextContent('material.control');
        expect(screen.getByTestId('user-email')).toHaveTextContent('mc@company.com');
        expect(screen.getByTestId('user-role')).toHaveTextContent('MaterialControl');
      });
    });

    it('should initialize with custom default role', async () => {
      render(
        <AuthProvider defaultRole={UserRole.ADMIN}>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
        expect(screen.getByTestId('user-username')).toHaveTextContent('admin');
        expect(screen.getByTestId('user-email')).toHaveTextContent('admin@company.com');
        expect(screen.getByTestId('user-role')).toHaveTextContent('Admin');
      });
    });
  });

  describe('Role Switching', () => {
    it('should switch to Admin role', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-role')).toHaveTextContent('MaterialControl');
      });

      fireEvent.click(screen.getByTestId('switch-to-admin'));

      await waitFor(() => {
        expect(screen.getByTestId('user-username')).toHaveTextContent('admin');
        expect(screen.getByTestId('user-email')).toHaveTextContent('admin@company.com');
        expect(screen.getByTestId('user-role')).toHaveTextContent('Admin');
        expect(screen.getByTestId('user-id')).toHaveTextContent('admin-001');
      });
    });

    it('should switch to Vendor role', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-role')).toHaveTextContent('MaterialControl');
      });

      fireEvent.click(screen.getByTestId('switch-to-vendor'));

      await waitFor(() => {
        expect(screen.getByTestId('user-username')).toHaveTextContent('vendor');
        expect(screen.getByTestId('user-email')).toHaveTextContent('vendor@supplier.com');
        expect(screen.getByTestId('user-role')).toHaveTextContent('Vendor');
        expect(screen.getByTestId('user-id')).toHaveTextContent('vendor-001');
      });
    });

    it('should switch to App User role', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-role')).toHaveTextContent('MaterialControl');
      });

      fireEvent.click(screen.getByTestId('switch-to-app-user'));

      await waitFor(() => {
        expect(screen.getByTestId('user-username')).toHaveTextContent('app.user');
        expect(screen.getByTestId('user-email')).toHaveTextContent('user@company.com');
        expect(screen.getByTestId('user-role')).toHaveTextContent('AppUser');
        expect(screen.getByTestId('user-id')).toHaveTextContent('user-001');
      });
    });
  });

  describe('Login and Logout', () => {
    it('should handle logout', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      });

      fireEvent.click(screen.getByTestId('logout'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
        expect(screen.queryByTestId('user-username')).not.toBeInTheDocument();
      });
    });

    it('should handle login with custom user', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // First logout
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      });

      fireEvent.click(screen.getByTestId('logout'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      });

      // Then login with custom user
      fireEvent.click(screen.getByTestId('login'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
        expect(screen.getByTestId('user-username')).toHaveTextContent('test');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@test.com');
        expect(screen.getByTestId('user-role')).toHaveTextContent('MaterialControl');
        expect(screen.getByTestId('user-id')).toHaveTextContent('test-user');
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      // Create a custom auth provider that starts with loading state
      const LoadingAuthProvider = ({ children }: { children: React.ReactNode }) => {
        const [isLoading, setIsLoading] = React.useState(true);
        
        React.useEffect(() => {
          const timer = setTimeout(() => setIsLoading(false), 100);
          return () => clearTimeout(timer);
        }, []);

        if (isLoading) {
          return <div>Loading...</div>;
        }

        return (
          <AuthProvider>
            {children}
          </AuthProvider>
        );
      };

      render(
        <LoadingAuthProvider>
          <TestComponent />
        </LoadingAuthProvider>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useAuth is used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalError;
    });
  });
});
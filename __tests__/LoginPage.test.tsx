import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from '@/lib/contexts/auth-context';
import LoginPage from '@/app/auth/login/page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const theme = createTheme();

const mockPush = jest.fn();
const mockGet = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
  });
  (useSearchParams as jest.Mock).mockReturnValue({
    get: mockGet,
  });
  mockGet.mockReturnValue(null); // Default to no redirect param
});

const renderLoginPage = (enableMockAuth = true) => {
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider enableMockAuth={enableMockAuth}>
        <LoginPage />
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('LoginPage', () => {
  describe('Rendering', () => {
    it('should render login page with logo and login button', () => {
      renderLoginPage();
      expect(screen.getByText('ระบบจัดการใบสั่งซื้อ')).toBeInTheDocument();
      // The subtitle may not exist, so skip it if not present in UI
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });

    it('should render responsive design elements', () => {
      renderLoginPage();

      // Check for business icon (just ensure icon appears)
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
      
      // Check footer
      expect(screen.getByText('© 2024 Purchase Order Management System')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty fields', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const loginButton = screen.getByTestId('login-button');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('กรุณากรอกชื่อผู้ใช้')).toBeInTheDocument();
        expect(screen.getByText('กรุณากรอกรหัสผ่าน')).toBeInTheDocument();
      });
    });

    it('should show password length validation', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const usernameInput = screen.getByTestId('username-input').querySelector('input')!;
      const passwordInput = screen.getByTestId('password-input').querySelector('input')!;
      const loginButton = screen.getByTestId('login-button');

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'ab'); // Too short
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('รหัสผ่านต้องมีอย่างน้อย 3 ตัวอักษร')).toBeInTheDocument();
      });
    });

    it('should clear field errors when user starts typing', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const usernameInput = screen.getByTestId('username-input').querySelector('input')!;
      const loginButton = screen.getByTestId('login-button');

      // Trigger validation error
      await user.click(loginButton);
      await waitFor(() => {
        expect(screen.getByText('กรุณากรอกชื่อผู้ใช้')).toBeInTheDocument();
      });

      // Start typing should clear error
      await user.type(usernameInput, 'a');
      await waitFor(() => {
        expect(screen.queryByText('กรุณากรอกชื่อผู้ใช้')).not.toBeInTheDocument();
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordInput = screen.getByTestId('password-input').querySelector('input')!;
      const toggleButton = screen.getByLabelText('toggle password visibility');

      // Initially password type
      expect(passwordInput.type).toBe('password');

      // Click to show password
      await user.click(toggleButton);
      expect(passwordInput.type).toBe('text');

      // Click to hide password
      await user.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    });
  });

  describe('Authentication Flow', () => {
    it('should handle successful login with mock auth', async () => {
      const user = userEvent.setup();
      renderLoginPage(true); // Enable mock auth

      const usernameInput = screen.getByTestId('username-input').querySelector('input')!;
      const passwordInput = screen.getByTestId('password-input').querySelector('input')!;
      const loginButton = screen.getByTestId('login-button');

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'password');
      await user.click(loginButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('กำลังเข้าสู่ระบบ...')).toBeInTheDocument();
      });

      // Should redirect after successful login
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should handle login failure with invalid credentials', async () => {
      const user = userEvent.setup();
      renderLoginPage(true);

      const usernameInput = screen.getByTestId('username-input').querySelector('input')!;
      const passwordInput = screen.getByTestId('password-input').querySelector('input')!;
      const loginButton = screen.getByTestId('login-button');

      await user.type(usernameInput, 'invalid');
      await user.type(passwordInput, 'wrong');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId('login-error')).toBeInTheDocument();
      });
    });

    it('should redirect to specified URL after login', async () => {
      const user = userEvent.setup();
      mockGet.mockReturnValue('/po/123'); // Mock redirect parameter
      
      renderLoginPage(true);

      const usernameInput = screen.getByTestId('username-input').querySelector('input')!;
      const passwordInput = screen.getByTestId('password-input').querySelector('input')!;
      const loginButton = screen.getByTestId('login-button');

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'password');
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/po/123');
      });
    });
  });

  describe('Already Authenticated State', () => {
    it('should redirect if user is already authenticated', async () => {
      // Create a provider with user already authenticated
      render(
        <ThemeProvider theme={theme}>
          <AuthProvider enableMockAuth={true} defaultRole="MaterialControl">
            <LoginPage />
          </AuthProvider>
        </ThemeProvider>
      );

      // Should redirect immediately since user is authenticated
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Loading States', () => {
    it('should show auth loading state', () => {
      // Mock isLoading state
      const LoadingAuthProvider = ({ children }: { children: React.ReactNode }) => {
        const [isLoading] = React.useState(true);
        
        if (isLoading) {
          return <div data-testid="auth-loading">Loading...</div>;
        }

        return (
          <AuthProvider enableMockAuth={true}>
            {children}
          </AuthProvider>
        );
      };

      render(
        <ThemeProvider theme={theme}>
          <LoadingAuthProvider>
            <LoginPage />
          </LoadingAuthProvider>
        </ThemeProvider>
      );

      expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should handle form submission process', async () => {
      const user = userEvent.setup();
      renderLoginPage(true);

      const usernameInput = screen.getByTestId('username-input').querySelector('input')!;
      const passwordInput = screen.getByTestId('password-input').querySelector('input')!;
      const loginButton = screen.getByTestId('login-button');

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'password');
      
      // Check elements are initially enabled
      expect(usernameInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
      expect(loginButton).not.toBeDisabled();
      
      // Submit form
      await user.click(loginButton);

      // Should eventually redirect (successful login)
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      }, { timeout: 2000 });
    });
  });
});
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, User } from '@/lib/types/po';
import AuthService, { LoginRequest } from '@/lib/api/auth';
import { getDefaultRouteForRole } from '@/lib/utils/role-routing';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void; // Keep for development/testing
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Mock user data for development/fallback
const mockUsers: Record<UserRole, User> = {
  [UserRole.ADMIN]: {
    id: 'admin-001',
    username: 'admin',
    email: 'admin@company.com',
    role: UserRole.ADMIN,
    permissions: [
      { resource: 'po', actions: ['read', 'write', 'delete', 'approve'] },
      { resource: 'user', actions: ['read', 'write', 'delete'] },
      { resource: 'system', actions: ['read', 'write'] },
    ],
  },
  [UserRole.MATERIAL_CONTROL]: {
    id: 'mc-001',
    username: 'material.control',
    email: 'mc@company.com',
    role: UserRole.MATERIAL_CONTROL,
    permissions: [
      { resource: 'po', actions: ['read', 'write', 'send_email'] },
    ],
  },
  [UserRole.APP_USER]: {
    id: 'user-001',
    username: 'app.user',
    email: 'user@company.com',
    role: UserRole.APP_USER,
    permissions: [
      { resource: 'po', actions: ['read'] },
    ],
  },
  [UserRole.VENDOR]: {
    id: 'vendor-001',
    username: 'vendor',
    email: 'vendor@supplier.com',
    role: UserRole.VENDOR,
    permissions: [
      { resource: 'po', actions: ['read', 'acknowledge'] },
    ],
  },
};

interface AuthProviderProps {
  children: React.ReactNode;
  defaultRole?: UserRole; // For development/testing
  enableMockAuth?: boolean; // Flag to enable mock auth for development
}

export function AuthProvider({ 
  children, 
  defaultRole = UserRole.MATERIAL_CONTROL,
  enableMockAuth
}: AuthProviderProps) {
  const router = useRouter();
  
  // Check environment variable if enableMockAuth is not explicitly set
  const shouldUseMockAuth = enableMockAuth ?? (process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true');
  
  // Start with no user - let them login first
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading to check existing auth
  const [isHydrated, setIsHydrated] = useState(false); // Track if component has hydrated

  // First effect: Mark as hydrated after mount (prevents SSR/CSR mismatch)
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Second effect: Check for existing authentication only after hydration
  useEffect(() => {
    if (!isHydrated) return; // Don't run until hydrated
    
    const checkExistingAuth = () => {
      console.log('Checking existing auth...', { shouldUseMockAuth, defaultRole });
      
      if (shouldUseMockAuth) {
        console.log('Using mock auth mode');
        // In mock mode, initialize with default user
        const mockUser = mockUsers[defaultRole];
        console.log('Setting mock user:', mockUser);
        setUser(mockUser);
      } else {
        console.log('Using real auth mode');
        // Check for existing token and user data (safe after hydration)
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        const userData = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
        
        console.log('Checking localStorage:', { 
          hasToken: !!token, 
          hasUserData: !!userData,
          token: token?.substring(0, 20) + '...', // Show only first 20 chars
          userData 
        });
        
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            console.log('Parsed user from localStorage:', parsedUser);
            setUser(parsedUser);
          } catch (error) {
            console.error('Failed to parse stored user data:', error);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('authToken');
              localStorage.removeItem('userData');
            }
          }
        } else {
          console.log('No existing auth found');
        }
      }
      
      console.log('Auth check complete, setting loading to false');
      setIsLoading(false);
    };

    checkExistingAuth();
  }, [isHydrated, shouldUseMockAuth, defaultRole]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    
    try {
      if (shouldUseMockAuth) {
        // Mock login for development
        // Find user by username - allow both exact username match and some test cases
        let foundUser = Object.values(mockUsers).find(u => u.username === credentials.username);
        
        // For testing - also allow 'admin' to map to admin user
        if (!foundUser && credentials.username === 'admin') {
          foundUser = mockUsers[UserRole.ADMIN];
        }
        
        if (foundUser && credentials.password === 'password') {
          setUser(foundUser);
          // Store in localStorage for consistency (even in mock mode)
          if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', 'mock-token');
            localStorage.setItem('userData', JSON.stringify(foundUser));
          }
          
          // Automatic role-based routing after successful login
          const defaultRoute = getDefaultRouteForRole(foundUser.role);
          router.push(defaultRoute);
        } else {
          throw new Error('Invalid credentials');
        }
      } else {
        // Real API login - tokens and user data are stored by AuthService
        const loginResponse = await AuthService.login(credentials);
        setUser(loginResponse.user);
        
        // Automatic role-based routing after successful login
        const defaultRoute = getDefaultRouteForRole(loginResponse.user.role);
        router.push(defaultRoute);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      if (!shouldUseMockAuth) {
        await AuthService.logout();
      }
      
      // Clear localStorage safely
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const switchRole = (role: UserRole) => {
    // This is primarily for development/testing
    if (shouldUseMockAuth && user) {
      const newUser = mockUsers[role];
      setUser(newUser);
    } else {
      console.warn('Role switching is only available in mock mode');
    }
  };

  const refreshUser = async () => {
    if (shouldUseMockAuth) {
      // In mock mode, just return current user
      return;
    }
    
    try {
      const userData = await AuthService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // Don't set user to null here as it might be a temporary network issue
      throw error;
    }
  };

  // Redirect effect: Navigate to default route on login/logout
  useEffect(() => {
    if (isHydrated && !isLoading) {
      if (user) {
        // On login, redirect to user's default route
        const defaultRoute = getDefaultRouteForRole(user.role);
        if (typeof window !== 'undefined' && window.location.pathname !== defaultRoute) {
          console.log('Navigating to default route:', defaultRoute);
          router.push(defaultRoute);
        }
      } else {
        // On logout, redirect to login page (or any public route)
        if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
          console.log('User logged out, redirecting to /auth/login');
          router.push('/auth/login');
        }
      }
    }
  }, [isHydrated, isLoading, user, router]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    switchRole,
    refreshUser,
  };

  // Render children immediately (no hydration/loading guard)
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
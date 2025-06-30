'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/lib/types/po';
import AuthService, { LoginRequest } from '@/lib/api/auth';

interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

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
  },
  [UserRole.MATERIAL_CONTROL]: {
    id: 'mc-001',
    username: 'material.control',
    email: 'mc@company.com',
    role: UserRole.MATERIAL_CONTROL,
  },
  [UserRole.APP_USER]: {
    id: 'user-001',
    username: 'app.user',
    email: 'user@company.com',
    role: UserRole.APP_USER,
  },
  [UserRole.VENDOR]: {
    id: 'vendor-001',
    username: 'vendor',
    email: 'vendor@supplier.com',
    role: UserRole.VENDOR,
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
  enableMockAuth = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true'
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        if (enableMockAuth) {
          // Use mock data for development
          const initUser = mockUsers[defaultRole];
          setUser(initUser);
        } else {
          // Check if user is already authenticated
          if (AuthService.isAuthenticated()) {
            try {
              // Verify token is still valid and get fresh user data
              const userData = await AuthService.getProfile();
              setUser(userData);
            } catch (error) {
              // Token might be expired or invalid
              console.warn('Failed to verify existing token:', error);
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [defaultRole, enableMockAuth]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    
    try {
      if (enableMockAuth) {
        // Mock login for development
        // Find user by username - allow both exact username match and some test cases
        let foundUser = Object.values(mockUsers).find(u => u.username === credentials.username);
        
        // For testing - also allow 'admin' to map to admin user
        if (!foundUser && credentials.username === 'admin') {
          foundUser = mockUsers[UserRole.ADMIN];
        }
        
        if (foundUser && credentials.password === 'password') {
          setUser(foundUser);
        } else {
          throw new Error('Invalid credentials');
        }
      } else {
        // Real API login
        const loginResponse = await AuthService.login(credentials);
        setUser(loginResponse.user);
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
      if (!enableMockAuth) {
        await AuthService.logout();
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
    if (enableMockAuth && user) {
      const newUser = mockUsers[role];
      setUser(newUser);
    } else {
      console.warn('Role switching is only available in mock mode');
    }
  };

  const refreshUser = async () => {
    if (enableMockAuth) {
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

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    switchRole,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
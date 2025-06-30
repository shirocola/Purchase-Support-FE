'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/lib/types/po';

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
  login: (user: User) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Mock user data for development
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
  defaultRole?: UserRole;
}

export function AuthProvider({ children, defaultRole = UserRole.MATERIAL_CONTROL }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with default user for development
  useEffect(() => {
    const initUser = mockUsers[defaultRole];
    setUser(initUser);
    setIsLoading(false);
  }, [defaultRole]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      const newUser = mockUsers[role];
      setUser(newUser);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TokenManager } from '@/lib/api/auth';

export interface User {
  id: number;
  username: string;
  email: string;
  fullname: string;
  position?: string;
  roles: string[];
  accessToken: string;
  accessgroup: number;
  role?: string;
  // เพิ่ม optional fields เพื่อให้ flexible
  employee_id?: string;
  telephone?: string;
  department?: string;
  supervisor_id?: string;
  supervisor_name?: string;
  supervisor_mail?: string;
  supervisor_username?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  saveAuth: (auth: User | undefined) => void;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  getCurrentUserRole: () => string | null;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    try {
      // ✅ ใช้ TokenManager แทน localStorage โดยตรง
      const savedUser = TokenManager.getUserData();
      if (savedUser) {
        // ✅ ตรวจสอบและแปลง data format ให้ตรงกับ User interface
        const formattedUser: User = {
          id: savedUser.id || 0,
          username: savedUser.username || '',
          email: savedUser.email || '',
          fullname: savedUser.fullname || savedUser.displayName || '',
          position: savedUser.position || '',
          roles: savedUser.roles || [],
          accessToken: savedUser.accessToken || '',
          accessgroup: savedUser.accessgroup || 1,
          role: savedUser.role || 'AppUser',
          // Optional fields
          employee_id: savedUser.employee_id,
          telephone: savedUser.telephone,
          department: savedUser.department,
          supervisor_id: savedUser.supervisor_id,
          supervisor_name: savedUser.supervisor_name,
          supervisor_mail: savedUser.supervisor_mail,
          supervisor_username: savedUser.supervisor_username
        };
        setUser(formattedUser);
      }
    } catch (error) {
      console.error('Error loading auth from localStorage:', error);
      TokenManager.removeToken(); // ✅ ใช้ TokenManager.removeToken()
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAuth = (auth: User | undefined) => {
    if (auth) {
      setUser(auth);
      // ✅ ใช้ TokenManager.setAuthData แทน localStorage.setItem('auth')
      TokenManager.setAuthData(auth);
    } else {
      setUser(null);
      TokenManager.removeToken(); // ✅ ใช้ TokenManager.removeToken()
    }
  };

  const setCurrentUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      // ✅ ใช้ TokenManager.setAuthData แทน localStorage.setItem('auth')
      TokenManager.setAuthData(newUser);
    } else {
      TokenManager.removeToken(); // ✅ ใช้ TokenManager.removeToken()
    }
  };

  const logout = () => {
    setUser(null);
    TokenManager.removeToken(); // ✅ ใช้ TokenManager.removeToken()
    // Redirect to login page
    window.location.href = '/auth/login';
  };

  // ✅ เพิ่มฟังก์ชัน role management
  const getCurrentUserRole = (): string | null => {
    return TokenManager.getCurrentUserRole();
  };

  const hasRole = (role: string): boolean => {
    return TokenManager.hasRole(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return TokenManager.hasAnyRole(roles);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    saveAuth,
    setCurrentUser,
    logout,
    getCurrentUserRole,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/po';
import { TokenManager } from '../utils/token-manager'; // ✅ เพิ่ม import ที่หายไป

interface AuthContextType {
  user: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ เพิ่ม role utilities ไว้ในไฟล์เดียวกัน
export const ALLOWED_ROLES = ['AppUser', 'MaterialControl'] as const;
export type AllowedRole = typeof ALLOWED_ROLES[number];

/**
 * Check if role is valid
 */
export function isValidRole(role: string): role is AllowedRole {
  console.log(`🔍 [VALIDATION] isValidRole called with: "${role}"`);
  const normalizedRole = role?.trim();
  const isValid = ALLOWED_ROLES.includes(normalizedRole as AllowedRole);
  console.log(`🔍 [VALIDATION] Is valid: ${isValid}`);
  return isValid;
}

/**
 * Get default route for user role after login
 */
export function getDefaultRouteForRole(role: string): string {
  console.log(`🔍 [ROUTE] getDefaultRouteForRole called with: "${role}"`);
  
  const normalizedRole = role?.trim();
  
  switch (normalizedRole) {
    case 'AppUser':
      console.log(`✅ [ROUTE] AppUser detected → /po/list`);
      return '/po/list';
    
    case 'MaterialControl':
      console.log(`✅ [ROUTE] MaterialControl detected → /po/material`);
      return '/po/material';
    
    default:
      console.warn(`❌ [ROUTE] Unknown role: "${role}"`);
      return '/auth/unauthorized';
  }
}

/**
 * Map backend roles array to primary role
 */
export function mapRolesToPrimaryRole(roles: string[]): AllowedRole | null {
  console.log(`🔍 [ROLE_MAPPING] mapRolesToPrimaryRole called with:`, roles);
  
  // AppUser first (principle of least privilege)
  for (const allowedRole of ALLOWED_ROLES) {
    if (roles.includes(allowedRole)) {
      console.log(`✅ [ROLE_MAPPING] Found role: ${allowedRole}`);
      return allowedRole;
    }
  }
  
  console.warn(`❌ [ROLE_MAPPING] No valid role found`);
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = TokenManager.getUserData();
      if (savedUser) {
        console.log('✅ [AUTH_CONTEXT] User loaded from storage:', savedUser);
        setUser(savedUser);
      }
    } catch (error) {
      console.error('❌ [AUTH_CONTEXT] Error loading auth:', error);
      TokenManager.removeToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ❌ ลบ saveAuth function ที่ซ้ำซ้อนกับ setCurrentUser
  
  const setCurrentUser = (newUser: User | null) => {
    console.log('🔍 [AUTH_CONTEXT] setCurrentUser called with:', newUser);
    setUser(newUser);
    
    if (newUser) {
      TokenManager.setAuthData(newUser);
      console.log('✅ [AUTH_CONTEXT] User data saved');
    } else {
      TokenManager.removeToken();
      console.log('🔍 [AUTH_CONTEXT] Auth data cleared');
    }
  };

  const logout = () => {
    console.log('🔍 [AUTH_CONTEXT] Logout called');
    setUser(null);
    TokenManager.removeToken();
    window.location.href = '/auth/login';
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    setCurrentUser,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
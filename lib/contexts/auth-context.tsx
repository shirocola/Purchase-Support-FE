'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/po';
import { TokenManager } from '../utils/token-manager';

interface AuthContextType {
  user: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = TokenManager.getUserData();
      if (savedUser) {
        setUser(savedUser);
      }
    } catch (error) {
      console.error('Auth loading error:', error);
      TokenManager.removeToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setCurrentUser = (newUser: User | null) => {
    setUser(newUser);
    
    if (newUser) {
      TokenManager.setAuthData(newUser);
    } else {
      TokenManager.removeToken();
    }
  };

  const logout = () => {
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
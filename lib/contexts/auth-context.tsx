'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  fullname: string;
  position?: string;
  roles: string[];
  accessToken: string;
  accessgroup: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  saveAuth: (auth: User | undefined) => void;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
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
      const savedAuth = localStorage.getItem('auth');
      if (savedAuth) {
        const parsedAuth = JSON.parse(savedAuth);
        setUser(parsedAuth);
      }
    } catch (error) {
      console.error('Error loading auth from localStorage:', error);
      localStorage.removeItem('auth');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAuth = (auth: User | undefined) => {
    if (auth) {
      setUser(auth);
      localStorage.setItem('auth', JSON.stringify(auth));
    } else {
      setUser(null);
      localStorage.removeItem('auth');
      localStorage.removeItem('azure');
    }
  };

  const setCurrentUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('auth', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('auth');
      localStorage.removeItem('azure');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth');
    localStorage.removeItem('azure');
    // Redirect to login page
    window.location.href = '/auth/login';
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    saveAuth,
    setCurrentUser,
    logout
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
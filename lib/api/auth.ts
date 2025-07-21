import axios, { AxiosResponse } from 'axios';
import { User, APIResponse } from '@/lib/types/po';

// Auth-specific types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

// Environment variables - Updated to use backend only
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001/api';

// Configure axios instance for auth
const authApi = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 10000,
  withCredentials: true,
});

// Token management utilities
class TokenManager {
  private static AUTH_KEY = 'pro-auth';
  private static TOKEN_KEY = 'pro-auth-token';
  private static REFRESH_TOKEN_KEY = 'pro-auth-refresh';
  private static USER_KEY = 'pro-auth-user';
  
  // ✅ Fixed: Implement setUserData method
  static setUserData(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
  
  // ✅ Fixed: Implement setAuthData method
  static setAuthData(authData: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(authData));
    
    // Also store individual components for backward compatibility
    if (authData.accessToken) {
      this.setToken(authData.accessToken);
    }
    if (authData.refreshToken) {
      this.setRefreshToken(authData.refreshToken);
    }
    if (authData.user) {
      this.setUserData(authData.user);
    }
  }
  
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  
  static removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.AUTH_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    // Remove legacy keys
    localStorage.removeItem('auth');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('azure');
  }
  
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  
  static setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }
  
  static getUserData(): User | null {
    if (typeof window === 'undefined') return null;
    // Try to get from stored user data first
    const userData = localStorage.getItem(this.USER_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        // Fallback to auth data
      }
    }
    
    // Fallback to auth data
    const authData = this.getAuthData();
    return authData?.user || null;
  }
  
  static getAuthData(): any {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(this.AUTH_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static getCurrentUserRole(): string | null {
    const authData = this.getAuthData();
    const userData = this.getUserData();
    const userRoles = userData?.roles || authData?.user?.roles || authData?.roles || [];
    
    console.log('[TokenManager] userRoles:', userRoles);

    if (userRoles.includes('Admin') || userRoles.includes('administrator')) {
      return 'Admin';
    }
    if (userRoles.includes('MaterialControl')) {
      return 'MaterialControl';
    }
    if (userRoles.includes('Vendor')) {
      return 'Vendor';
    }
    if (userRoles.includes('AppUser')) {
      return 'AppUser';
    }
    // Default fallback
    return 'AppUser';
  }

  static hasRole(role: string): boolean {
    const userRoles = this.getAllUserRoles();
    return userRoles.includes(role);
  }

  static hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getAllUserRoles();
    return roles.some((role) => userRoles.includes(role));
  }

  static getAllUserRoles(): string[] {
    const authData = this.getAuthData();
    const userData = this.getUserData();
    return userData?.roles || authData?.user?.roles || authData?.roles || [];
  }

  static isAppUser(): boolean {
    return this.getCurrentUserRole() === 'AppUser';
  }

  static isMaterialControl(): boolean {
    return this.getCurrentUserRole() === 'MaterialControl';
  }

  static canAccessPOList(): boolean {
    return this.isAppUser();
  }

  static canAccessMaterialManagement(): boolean {
    return this.isMaterialControl();
  }
}

// Add token to requests
authApi.interceptors.request.use((config) => {
  const token = TokenManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (refreshToken) {
          const newToken = await AuthService.refreshToken(refreshToken);
          TokenManager.setToken(newToken.token);
          if (newToken.refreshToken) {
            TokenManager.setRefreshToken(newToken.refreshToken);
          }
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken.token}`;
          return authApi(originalRequest);
        }
      } catch (error) {
        // Refresh failed, redirect to login
        TokenManager.removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    }
    
    // If not 401 or refresh failed, just reject
    if (error.response?.status === 401) {
      TokenManager.removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export class AuthService {
  /**
   * Login user with username and password - Updated for backend API
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await authApi.post('/auth/login', credentials);
    
    // Backend returns different structure than expected APIResponse
    if (!response.data.user || !response.data.accessToken) {
      throw new Error(response.data.error || 'Login failed');
    }
    
    const loginData = {
      user: response.data.user,
      token: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      expiresIn: 900 // 15 minutes default
    };
    
    // Store tokens and user data
    TokenManager.setToken(loginData.token);
    if (loginData.refreshToken) {
      TokenManager.setRefreshToken(loginData.refreshToken);
    }
    TokenManager.setUserData(loginData.user);
    
    return loginData;
  }
  
  /**
   * Logout user and clear tokens
   */
  static async logout(): Promise<void> {
    try {
      await authApi.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      TokenManager.removeToken();
    }
  }
  
  /**
   * Get current user profile - Updated to use verify endpoint
   */
  static async getProfile(): Promise<User> {
    const response = await authApi.get('/auth/verify');
    
    if (!response.data.valid || !response.data.user) {
      throw new Error('Failed to fetch profile');
    }
    
    const user = response.data.user;
    TokenManager.setUserData(user);
    
    return user;
  }
  
  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await authApi.post('/auth/refresh', {
      refreshToken
    });
    
    if (!response.data.accessToken) {
      throw new Error(response.data.error || 'Token refresh failed');
    }
    
    return {
      token: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      expiresIn: 900 // 15 minutes default
    };
  }
  
  /**
   * Check if user is authenticated (has valid token)
   */
  static isAuthenticated(): boolean {
    const token = TokenManager.getToken();
    const userData = TokenManager.getUserData();
    return !!(token && userData);
  }
  
  /**
   * Get stored user data without API call
   */
  static getCurrentUser(): User | null {
    return TokenManager.getUserData();
  }

  /**
   * Get current user role
   */
  static getCurrentUserRole(): string | null {
    return TokenManager.getCurrentUserRole();
  }

  /**
   * Check if user has specific role
   */
  static hasRole(role: string): boolean {
    return TokenManager.hasRole(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  static hasAnyRole(roles: string[]): boolean {
    return TokenManager.hasAnyRole(roles);
  }
  
  /**
   * Check token expiry and refresh if needed
   */
  static async ensureValidToken(): Promise<boolean> {
    const token = TokenManager.getToken();
    if (!token) return false;
    
    try {
      await this.getProfile();
      return true;
    } catch (error) {
      const refreshToken = TokenManager.getRefreshToken();
      if (!refreshToken) return false;
      
      try {
        const newToken = await this.refreshToken(refreshToken);
        TokenManager.setToken(newToken.token);
        if (newToken.refreshToken) {
          TokenManager.setRefreshToken(newToken.refreshToken);
        }
        return true;
      } catch {
        TokenManager.removeToken();
        return false;
      }
    }
  }
}

// ✅ Updated getUserByToken to use backend API
export async function getUserByToken(accessToken: string) {
  const response = await axios.get(`${BACKEND_API_URL}/auth/verify`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response;
}

// ✅ Updated getUserByModule - simplified since backend handles AD integration
export async function getUserByModule(userId: number, moduleId: string) {
  // For now, return a simple check - you can expand this based on your needs
  // Since backend handles AD authentication, we can assume user has access
  return Promise.resolve({ data: { hasAccess: true } });
}

// ✅ Updated saveAuth function to work with backend response structure
export function saveAuth(authData: any): void {
  if (authData) {
    TokenManager.setAuthData(authData);
    
    // Store additional metadata if provided
    if (authData.azure !== undefined) {
      localStorage.setItem('azure', authData.azure.toString());
    }
    if (authData.loginMethod) {
      localStorage.setItem('loginMethod', authData.loginMethod);
    }
    if (authData.loginTimestamp) {
      localStorage.setItem('loginTimestamp', authData.loginTimestamp);
    }
  } else {
    TokenManager.removeToken();
  }
}

export { TokenManager };
export default AuthService;

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

// Environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
const SC_API_URL = process.env.NEXT_PUBLIC_SC_API_URL || 'https://api-dev.osotspa.com/securitycontrol/api';

// Configure axios instance for auth
const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Important for httpOnly cookies
});

// Token management utilities
class TokenManager {
  private static TOKEN_KEY = 'authToken';
  private static REFRESH_TOKEN_KEY = 'refreshToken';
  private static USER_KEY = 'userData';
  
  // For development/fallback - in production should use httpOnly cookies
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
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('auth');
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
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }
  
  static setUserData(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
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
   * Login user with username and password (Modern API)
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<APIResponse<LoginResponse>> = await authApi.post('/auth/login', credentials);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed');
    }
    
    const loginData = response.data.data!;
    
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
      // Even if API call fails, we should clear local tokens
      console.warn('Logout API call failed:', error);
    } finally {
      TokenManager.removeToken();
    }
  }
  
  /**
   * Get current user profile
   */
  static async getProfile(): Promise<User> {
    const response: AxiosResponse<APIResponse<User>> = await authApi.get('/user/profile');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch profile');
    }
    
    const user = response.data.data!;
    TokenManager.setUserData(user);
    
    return user;
  }
  
  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response: AxiosResponse<APIResponse<RefreshTokenResponse>> = await authApi.post('/auth/refresh', {
      refreshToken
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Token refresh failed');
    }
    
    return response.data.data!;
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
   * Check token expiry and refresh if needed
   */
  static async ensureValidToken(): Promise<boolean> {
    const token = TokenManager.getToken();
    if (!token) return false;
    
    try {
      // Try to get profile to validate token
      await this.getProfile();
      return true;
    } catch (error) {
      // Token might be expired, try refresh
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

// เพิ่มฟังก์ชันสำหรับขอ OAuth2 token
async function getOAuth2Token() {
  const scApiUrl = process.env.NEXT_PUBLIC_SC_API_URL;
  const clientId = process.env.NEXT_PUBLIC_APP_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_APP_CLIENT_SECRET;
  const grantType = process.env.NEXT_PUBLIC_APP_GRANT_TYPE;

  if (!scApiUrl || !clientId || !clientSecret || !grantType) {
    throw new Error('Missing required OAuth2 configuration');
  }

  const tokenParams = new URLSearchParams();
  tokenParams.append('client_id', clientId);
  tokenParams.append('client_secret', clientSecret);
  tokenParams.append('grant_type', grantType);
  
  const response = await fetch(`${scApiUrl}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenParams.toString()
  });

  if (!response.ok) {
    throw new Error(`Failed to get OAuth2 token: ${response.status}`);
  }

  const tokenData = await response.json();
  return tokenData.access_token;
}

// แก้ไขฟังก์ชัน getUserByToken
export async function getUserByToken(accessToken: string) {
  // ขอ OAuth2 token สำหรับ API authorization
  const oauthToken = await getOAuth2Token();
  
  return await axios.post(`${SC_API_URL}/auth/verify_token`, {
    accessToken
  }, {
    headers: {
      'Authorization': `Bearer ${oauthToken}`,  // ใช้ OAuth2 token
      'Content-Type': 'application/json'
    }
  });
}

// แก้ไขฟังก์ชัน getUserByModule
export async function getUserByModule(userId: number, moduleId: string) {
  // ขอ OAuth2 token สำหรับ API authorization
  const oauthToken = await getOAuth2Token();
  
  return await axios.post(`${SC_API_URL}/roles_modulesearch`, {
    userid: userId,
    module_id: moduleId
  }, {
    headers: {
      'Authorization': `Bearer ${oauthToken}`,  // ใช้ OAuth2 token
      'Content-Type': 'application/json'
    }
  })
  .then((response) => response.data)  // คืนค่า response.data แทน response object
  .then((response) => response.data); // และ response.data อีกครั้ง (ตามโปรเจกต์อื่น)
}

// Legacy login function (ใช้ตามเดิม - ไม่ต้อง OAuth2 token)
export async function login(username: string, password: string) {
  try {
    const response = await axios.post(`${SC_API_URL}/auth/signin`, {
      username,
      password
    });
    return response;
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
}

export { TokenManager };
export default AuthService;
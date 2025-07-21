import { User } from '../types/po';

/**
 * Token and authentication data management utility
 * Single source of truth for localStorage operations
 */
export class TokenManager {
  private static readonly AUTH_KEY = 'auth';
  private static readonly TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  /**
   * Get user data from localStorage
   */
  static getUserData(): User | null {
    try {
      const authData = localStorage.getItem(this.AUTH_KEY);
      if (!authData) {
        console.log('🔍 [TOKEN_MANAGER] No auth data found in localStorage');
        return null;
      }

      const parsed = JSON.parse(authData);
      console.log('🔍 [TOKEN_MANAGER] Auth data loaded:', parsed);

      if (parsed.user) {
        return parsed.user as User;
      }

      console.warn('❌ [TOKEN_MANAGER] No user object in auth data');
      return null;
    } catch (error) {
      console.error('❌ [TOKEN_MANAGER] Error parsing auth data:', error);
      this.removeToken();
      return null;
    }
  }

  /**
   * Set authentication data (user + tokens)
   */
  static setAuthData(userData: User | any): void {
    try {
      const authData = {
        user: userData,
        accessToken: userData.accessToken || '',
        refreshToken: userData.refreshToken || '',
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(this.AUTH_KEY, JSON.stringify(authData));
      
      // Also save individual tokens for backward compatibility
      if (userData.accessToken) {
        localStorage.setItem(this.TOKEN_KEY, userData.accessToken);
      }
      if (userData.refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, userData.refreshToken);
      }

      console.log('✅ [TOKEN_MANAGER] Auth data saved successfully');
    } catch (error) {
      console.error('❌ [TOKEN_MANAGER] Error saving auth data:', error);
    }
  }

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    try {
      // Try to get from auth data first
      const authData = localStorage.getItem(this.AUTH_KEY);
      if (authData) {
        const parsed = JSON.parse(authData);
        if (parsed.accessToken) {
          return parsed.accessToken;
        }
      }

      // Fallback to individual token key
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('❌ [TOKEN_MANAGER] Error getting access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    try {
      // Try to get from auth data first
      const authData = localStorage.getItem(this.AUTH_KEY);
      if (authData) {
        const parsed = JSON.parse(authData);
        if (parsed.refreshToken) {
          return parsed.refreshToken;
        }
      }

      // Fallback to individual token key
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('❌ [TOKEN_MANAGER] Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const user = this.getUserData();
    const accessToken = this.getAccessToken();
    
    const isAuth = !!(user && accessToken);
    console.log('🔍 [TOKEN_MANAGER] Authentication check:', {
      hasUser: !!user,
      hasToken: !!accessToken,
      isAuthenticated: isAuth
    });
    
    return isAuth;
  }

  /**
   * Remove all authentication data
   */
  static removeToken(): void {
    try {
      localStorage.removeItem(this.AUTH_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      console.log('✅ [TOKEN_MANAGER] All auth data removed');
    } catch (error) {
      console.error('❌ [TOKEN_MANAGER] Error removing tokens:', error);
    }
  }

  /**
   * Update user data without affecting tokens
   */
  static updateUserData(userData: Partial<User>): void {
    try {
      const currentUser = this.getUserData();
      if (!currentUser) {
        console.warn('❌ [TOKEN_MANAGER] No current user to update');
        return;
      }

      const updatedUser = { ...currentUser, ...userData };
      
      const authData = localStorage.getItem(this.AUTH_KEY);
      if (authData) {
        const parsed = JSON.parse(authData);
        parsed.user = updatedUser;
        localStorage.setItem(this.AUTH_KEY, JSON.stringify(parsed));
        console.log('✅ [TOKEN_MANAGER] User data updated');
      }
    } catch (error) {
      console.error('❌ [TOKEN_MANAGER] Error updating user data:', error);
    }
  }

  /**
   * Clear expired authentication data
   */
  static clearExpiredAuth(): void {
    try {
      const authData = localStorage.getItem(this.AUTH_KEY);
      if (!authData) return;

      const parsed = JSON.parse(authData);
      const timestamp = parsed.timestamp;
      
      if (timestamp) {
        const authTime = new Date(timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - authTime.getTime()) / (1000 * 60 * 60);
        
        // Clear if older than 24 hours
        if (hoursDiff > 24) {
          console.log('🔍 [TOKEN_MANAGER] Clearing expired auth data');
          this.removeToken();
        }
      }
    } catch (error) {
      console.error('❌ [TOKEN_MANAGER] Error checking auth expiration:', error);
      this.removeToken();
    }
  }
}
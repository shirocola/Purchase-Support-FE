'use client';
import { 
  Material, 
  MaterialListParams, 
  MaterialListResponse, 
  MaterialUpdateData,
  MaterialFilter,
} from '@/lib/types/po';

// Environment variables - Backend API URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001/api';

// Configure fetch with authentication
const createAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pro-auth-token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Handle authentication errors
const handleAuthError = (response: Response) => {
  if (response.status === 401) {
    // Token expired or invalid, redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pro-auth-token');
      localStorage.removeItem('pro-auth');
      window.location.href = '/auth/login';
    }
  }
};

export class MaterialService {
  /**
   * Get materials list with backend RBAC and data masking
   */
  static async getMaterials(params: MaterialListParams = {}): Promise<MaterialListResponse> {
    try {
      const response = await fetch(`${BACKEND_API_URL}/materials/list`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({
          filter: params.filter || {},
          page: params.page || 1,
          limit: params.limit || 50
        })
      });
      
      if (!response.ok) {
        handleAuthError(response);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch materials');
      }
      
      return {
        items: data.items || [],
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 50,
        totalPages: data.totalPages || 1
      };
    } catch (error: any) {
      console.error('Material API error:', error);
      
      // If it's a network error or API is down, return empty list
      if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        console.warn('Backend API unavailable, returning empty materials list');
        return {
          items: [],
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0
        };
      }
      
      throw new Error(error.message || 'Failed to fetch materials');
    }
  }

  /**
   * Apply material filters for search/filtering
   */
  static buildMaterialFilter(searchQuery?: string, category?: string, isConfidential?: boolean): MaterialFilter {
    const filter: MaterialFilter = {
      category: category || '',
      isConfidential
    };
    
    // Add searchQuery as a separate parameter if needed by backend
    return filter;
  }

  /**
   * Get single material by ID
   */
  static async getMaterial(id: string): Promise<Material | null> {
    try {
      const response = await fetch(`${BACKEND_API_URL}/materials/${id}`, {
        method: 'GET',
        headers: createAuthHeaders()
      });
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        handleAuthError(response);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        return null;
      }
      
      return data.data;
    } catch (error: any) {
      console.error('Material get error:', error);
      if (error.message.includes('404')) {
        return null;
      }
      throw new Error(error.message || 'Failed to fetch material');
    }
  }

  /**
   * Update material (for MaterialControl role)
   */
  static async updateMaterial(id: string, data: MaterialUpdateData): Promise<Material> {
    try {
      const response = await fetch(`${BACKEND_API_URL}/materials/${id}`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        handleAuthError(response);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.error || 'Failed to update material');
      }
      
      return responseData.data;
    } catch (error: any) {
      console.error('Material update error:', error);
      throw new Error(error.message || 'Failed to update material');
    }
  }

  /**
   * Get material categories (filtered by user role)
   */
  static async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${BACKEND_API_URL}/materials/categories`, {
        method: 'GET',
        headers: createAuthHeaders()
      });
      
      if (!response.ok) {
        handleAuthError(response);
        console.warn('Failed to fetch categories, returning empty array');
        return [];
      }
      
      const data = await response.json();
      
      if (!data.success) {
        console.warn('Categories API returned error, returning empty array');
        return [];
      }
      
      return data.data || [];
    } catch (error: any) {
      console.error('Material categories error:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Search materials for autocomplete (with RBAC)
   */
  static async searchMaterials(searchQuery: string, limit: number = 10): Promise<Material[]> {
    try {
      if (!searchQuery || searchQuery.length < 2) {
        return [];
      }

      const response = await fetch(`${BACKEND_API_URL}/materials/search`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({
          query: searchQuery,
          limit
        })
      });
      
      if (!response.ok) {
        handleAuthError(response);
        console.warn('Search failed, returning empty array');
        return [];
      }
      
      const data = await response.json();
      
      if (!data.success) {
        return [];
      }
      
      return data.data || [];
    } catch (error: any) {
      console.error('Material search error:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Check if user can access material management features
   */
  static canManageMaterials(): boolean {
    if (typeof window === 'undefined') return false;
    
    const authData = localStorage.getItem('pro-auth');
    if (!authData) return false;
    
    try {
      const auth = JSON.parse(authData);
      const userRoles = auth.user?.roles || auth.roles || [];
      return userRoles.includes('MaterialControl');
    } catch {
      return false;
    }
  }

  /**
   * Check if user can view confidential materials
   */
  static canViewConfidentialMaterials(): boolean {
    if (typeof window === 'undefined') return false;
    
    const authData = localStorage.getItem('pro-auth');
    if (!authData) return false;
    
    try {
      const auth = JSON.parse(authData);
      const userRoles = auth.user?.roles || auth.roles || [];
      return userRoles.includes('MaterialControl');
    } catch {
      return false;
    }
  }

  /**
   * Get current user role for UI decisions
   */
  static getCurrentUserRole(): string | null {
    if (typeof window === 'undefined') return null;
    
    const authData = localStorage.getItem('pro-auth');
    if (!authData) return null;
    
    try {
      const auth = JSON.parse(authData);
      const userRoles = auth.user?.roles || auth.roles || [];
      
      if (userRoles.includes('MaterialControl')) {
        return 'MaterialControl';
      }
      if (userRoles.includes('AppUser')) {
        return 'AppUser';
      }
      
      return 'AppUser'; // Default fallback
    } catch {
      return null;
    }
  }
}

export default MaterialService;

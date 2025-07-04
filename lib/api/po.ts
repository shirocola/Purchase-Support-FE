import axios, { AxiosResponse } from 'axios';
import { PurchaseOrder, APIResponse, POEditFormData, POEmailFormData, POEmailStatus, POAcknowledgeData, AuditLogEntry, POListParams, POListResponse } from '@/lib/types/po';

// Configure axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  // Get token from AuthService for better integration
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('authToken');
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors with proper auth integration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/auth/login')) {
          const currentPath = window.location.pathname + window.location.search;
          const redirectUrl = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
          window.location.href = redirectUrl;
        }
      }
    }
    return Promise.reject(error);
  }
);

export class POService {
  /**
   * Get PO list with filtering, sorting, and pagination
   */
  static async getPOList(params: POListParams = {}): Promise<POListResponse> {
    // Map your params to the external API's expected format if needed
    // Send only page and limit for backend compatibility test
    const payload: any = {
      page: params.page || 1,
      limit: params.limit || 10,
    };

    // The external API expects POST with filters in body
    // HARDCODED TOKEN FOR TESTING ONLY
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ik9zb3RzcGEiLCJpYXQiOjE3NTE2MjA1MDAsImV4cCI6MTc1MTYyMjMwMH0.Uhctxwi__mKCyj0YS6olS6U_4OVgOZ8hBIBSSZcQI3E";

    try {
      const response = await axios.post(
        'https://apiservice-ssb-api-uat.osotspa.com/api/warehouse/get_purchase_order',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Log the response for debugging
      console.log('PO API response:', response.data);

      const data = response.data;
      // Defensive: try to find the array of items in the response
      let items: any[] = [];
      if (Array.isArray(data.items)) {
        items = data.items;
      } else if (Array.isArray(data.data)) {
        items = data.data;
      } else if (Array.isArray(data.result)) {
        items = data.result;
      } else if (Array.isArray(data.purchaseOrders)) {
        items = data.purchaseOrders;
      }

      return {
        items,
        total: data.total || items.length || 0,
        page: data.page || payload.page,
        limit: data.limit || payload.limit,
        totalPages: data.totalPages || Math.ceil((data.total || items.length || 0) / (data.limit || payload.limit)),
      };
    } catch (error: any) {
      if (error.response) {
        console.error('PO API error:', error.response.status, error.response.data);
      } else {
        console.error('PO API error:', error);
      }
      throw error;
    }
  }

  /**
   * Get PO by ID
   */
  static async getPO(id: string): Promise<PurchaseOrder> {
    const response: AxiosResponse<APIResponse<PurchaseOrder>> = await api.get(`/po/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch PO');
    }
    return response.data.data!;
  }

  /**
   * Update PO
   */
  static async updatePO(id: string, data: Partial<POEditFormData>): Promise<PurchaseOrder> {
    const response: AxiosResponse<APIResponse<PurchaseOrder>> = await api.patch(`/po/${id}`, data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update PO');
    }
    return response.data.data!;
  }

  /**
   * Send PO email to vendor
   */
  static async sendPOEmail(id: string): Promise<void> {
    const response: AxiosResponse<APIResponse<void>> = await api.post(`/po/${id}/send-email`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to send email');
    }
  }

  /**
   * Send PO email with custom data
   */
  static async sendPOEmailWithData(id: string, emailData: POEmailFormData): Promise<void> {
    const response: AxiosResponse<APIResponse<void>> = await api.post(`/po/${id}/send-email`, emailData);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to send email');
    }
  }

  /**
   * Get PO email status
   */
  static async getPOEmailStatus(id: string): Promise<POEmailStatus> {
    const response: AxiosResponse<APIResponse<POEmailStatus>> = await api.get(`/po/${id}/email-status`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch email status');
    }
    return response.data.data!;
  }

  /**
   * Get PO audit log
   */
  static async getPOAuditLog(id: string): Promise<AuditLogEntry[]> {
    const response: AxiosResponse<APIResponse<AuditLogEntry[]>> = await api.get(`/po/${id}/audit-log`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch audit log');
    }
    return response.data.data!;
  }

  /**
   * Approve PO
   */
  static async approvePO(id: string): Promise<PurchaseOrder> {
    const response: AxiosResponse<APIResponse<PurchaseOrder>> = await api.post(`/po/${id}/approve`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to approve PO');
    }
    return response.data.data!;
  }

  /**
   * Cancel PO
   */
  static async cancelPO(id: string, reason?: string): Promise<PurchaseOrder> {
    const response: AxiosResponse<APIResponse<PurchaseOrder>> = await api.post(`/po/${id}/cancel`, { reason });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to cancel PO');
    }
    return response.data.data!;
  }

  /**
   * Get PO acknowledge status
   */
  static async getPOAcknowledgeStatus(id: string): Promise<POAcknowledgeData> {
    const response: AxiosResponse<APIResponse<POAcknowledgeData>> = await api.get(`/po/${id}/acknowledge-status`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch acknowledge status');
    }
    return response.data.data!;
  }

  /**
   * Resend PO email to vendor
   */
  static async resendPOEmail(id: string): Promise<void> {
    const response: AxiosResponse<APIResponse<void>> = await api.post(`/po/${id}/resend-email`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to resend email');
    }
  }

  /**
   * Get PO acknowledge link
   */
  static async getPOAcknowledgeLink(id: string): Promise<string> {
    const response: AxiosResponse<APIResponse<{ link: string }>> = await api.get(`/po/${id}/acknowledge-link`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get acknowledge link');
    }
    return response.data.data!.link;
  }
}

export default POService;
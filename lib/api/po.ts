import axios, { AxiosResponse } from 'axios';
import { PurchaseOrder, APIResponse, POEditFormData, POEmailFormData, POEmailStatus } from '@/lib/types/po';

// Configure axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class POService {
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
  static async getPOAuditLog(id: string): Promise<unknown[]> {
    const response: AxiosResponse<APIResponse<unknown[]>> = await api.get(`/po/${id}/audit-log`);
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
}

export default POService;
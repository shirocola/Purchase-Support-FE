import axios, { AxiosResponse } from 'axios';
import { 
  PurchaseOrder, 
  APIResponse, 
  POEditFormData, 
  POEmailFormData, 
  POEmailStatus, 
  POAcknowledgeData, 
  AuditLogEntry, 
  POListParams, 
  POListResponse,
  Vendor,
  POItem,
  POStatus
} from '@/lib/types/po';

// Configure axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 30000, // Increased timeout for SAP API calls
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  // ใช้ token key ที่ตรงกับระบบ auth ปัจจุบัน
  let token = null;
  if (typeof window !== 'undefined') {
    // ตรวจสอบ token key ที่ถูกต้อง
    token = localStorage.getItem('pro-auth-token') || localStorage.getItem('authToken');
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
      // เฉพาะเมื่อไม่มี auth หรือ token หมดอายุ
      if (typeof window !== 'undefined') {
        // Clear all auth tokens
        localStorage.removeItem('pro-auth-token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('pro-auth');
        localStorage.removeItem('userData');
        
        // ตรวจสอบว่าอยู่ในหน้าที่ต้องการ auth หรือไม่
        const protectedRoutes = ['/po/'];
        const currentPath = window.location.pathname;
        const isProtectedRoute = protectedRoutes.some(route => currentPath.includes(route));
        
        // Redirect เฉพาะเมื่ออยู่ในหน้าที่ต้องการ auth และยังไม่ได้อยู่ในหน้า login
        if (isProtectedRoute && !window.location.pathname.includes('/auth/login')) {
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
   * Now uses our backend Purchase Order API
   */
  static async getPOList(params: POListParams = {}): Promise<POListResponse> {
    try {
      // Build query parameters for our backend API
      const queryParams = new URLSearchParams();
      
      // Add date filter if provided
      if (params.filter?.dateFrom) {
        queryParams.append('date', params.filter.dateFrom);
      }
      
      // Add document number filter if search is provided
      if (params.filter?.search) {
        queryParams.append('document_number', params.filter.search);
      }

      // Use our backend Purchase Order API
      const response = await api.get(`/purchase-orders?${queryParams.toString()}`);

      // Log the response for debugging
      console.log('Backend PO API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch purchase orders');
      }

      // Transform backend response to our frontend format
      const transformedItems = this.transformBackendPOData(response.data.data);

      // Apply client-side filtering and pagination since backend doesn't support all filters yet
      let filteredItems = transformedItems;

      // Apply status filter
      if (params.filter?.status && params.filter.status.length > 0) {
        filteredItems = filteredItems.filter(po => 
          params.filter!.status!.includes(po.status)
        );
      }

      // Apply vendor filter
      if (params.filter?.vendorId) {
        filteredItems = filteredItems.filter(po => 
          po.vendor.id === params.filter!.vendorId
        );
      }

      // Apply created by filter
      if (params.filter?.createdBy) {
        filteredItems = filteredItems.filter(po => 
          po.createdBy.toLowerCase().includes(params.filter!.createdBy!.toLowerCase())
        );
      }

      // Apply date range filter
      if (params.filter?.dateTo) {
        const toDate = new Date(params.filter.dateTo);
        filteredItems = filteredItems.filter(po => {
          const poDate = new Date(po.requestedDate);
          return poDate <= toDate;
        });
      }

      // Apply sorting
      if (params.sort?.sortBy) {
        filteredItems.sort((a, b) => {
          const sortBy = params.sort!.sortBy!;
          const sortOrder = params.sort!.sortOrder || 'asc';
          
          let aValue: any, bValue: any;
          
          switch (sortBy) {
            case 'poNumber':
              aValue = a.poNumber;
              bValue = b.poNumber;
              break;
            case 'vendor':
              aValue = a.vendor.name;
              bValue = b.vendor.name;
              break;
            case 'totalAmount':
              aValue = a.totalAmount;
              bValue = b.totalAmount;
              break;
            case 'requiredDate':
              aValue = new Date(a.requiredDate ?? '');
              bValue = new Date(b.requiredDate ?? '');
              break;
            case 'status':
              aValue = a.status;
              bValue = b.status;
              break;
            default:
              aValue = a.createdAt;
              bValue = b.createdAt;
          }
          
          if (sortOrder === 'desc') {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          } else {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          }
        });
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = filteredItems.slice(startIndex, endIndex);

      return {
        items: paginatedItems,
        total: filteredItems.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(filteredItems.length / limit),
      };
    } catch (error: any) {
      console.error('Backend PO API error:', error);
      
      // If backend fails, show user-friendly error
      if (error.response?.status === 500) {
        throw new Error('Unable to connect to SAP system. Please try again later.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to fetch purchase orders');
      }
    }
  }

  /**
   * Transform backend PO data to our frontend PurchaseOrder format
   */
  private static transformBackendPOData(backendData: any[]): PurchaseOrder[] {
    if (!Array.isArray(backendData)) {
      console.warn('Backend data is not an array:', backendData);
      return [];
    }

    return backendData.map((po: any) => {
      try {
        // Transform vendor data
        const vendor: Vendor = {
          id: po.vendor_number || po.vendor?.id || 'unknown',
          name: po.vendor_name || po.vendor?.name || 'Unknown Vendor',
          email: po.vendor?.email || 'vendor@example.com',
          contactPerson: po.vendor?.contactPerson,
          phone: po.vendor?.phone,
          address: po.vendor?.address,
        };

        // Transform items data
        const items: POItem[] = (po.items || []).map((item: any, index: number) => ({
          id: `${po.document_number}-${item.item_number || index}`,
          productName: item.material_description || 'Unknown Product',
          description: item.material_description || '',
          quantity: item.quantity || 0,
          unitPrice: item.price || 0,
          totalPrice: item.total_amount || 0,
          unit: item.unit || 'PCS',
        }));

        // Map backend status to frontend POStatus enum
        const status = this.mapBackendStatusToPOStatus(po.status);

        // Create PurchaseOrder object
        const purchaseOrder: PurchaseOrder = {
          id: po.document_number,
          poNumber: po.document_number,
          title: `PO ${po.document_number}`,
          status: status,
          vendor: vendor,
          items: items,
          totalAmount: po.total_value || 0,
          currency: po.currency || 'THB',
          requestedDate: po.document_date || new Date().toISOString(),
          requiredDate: po.document_date || new Date().toISOString(),
          description: `${po.document_type || ''} - ${po.purchasing_organization || ''}`.trim(),
          remarks: po.payment_terms || '',
          createdBy: po.created_by || 'System',
          createdAt: po.created_on || new Date().toISOString(),
          updatedAt: po.created_on || new Date().toISOString(),
        };

        return purchaseOrder;
      } catch (error) {
        console.error(`Error transforming PO ${po.document_number}:`, error);
        // Return a minimal PO object to prevent complete failure
        return {
          id: po.document_number || 'unknown',
          poNumber: po.document_number || 'unknown',
          title: `PO ${po.document_number || 'Unknown'}`,
          status: POStatus.DRAFT,
          vendor: {
            id: 'unknown',
            name: 'Unknown Vendor',
            email: 'vendor@example.com',
          },
          items: [],
          totalAmount: 0,
          currency: 'THB',
          requestedDate: new Date().toISOString(),
          requiredDate: new Date().toISOString(),
          description: '',
          remarks: '',
          createdBy: 'System',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as PurchaseOrder;
      }
    }).filter(Boolean); // Remove any null/undefined items
  }

  /**
   * Map backend status to frontend POStatus enum
   */
  private static mapBackendStatusToPOStatus(status: string): POStatus {
    if (!status) return POStatus.DRAFT;
    
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'draft':
      case 'created':
        return POStatus.DRAFT;
      case 'pending':
      case 'pending approval':
      case 'pending_approval':
        return POStatus.PENDING_APPROVAL;
      case 'approved':
      case 'released':
        return POStatus.APPROVED;
      case 'sent':
      case 'transmitted':
        return POStatus.SENT;
      case 'acknowledged':
      case 'confirmed':
        return POStatus.ACKNOWLEDGED;
      case 'cancelled':
      case 'canceled':
        return POStatus.CANCELLED;
      default:
        return POStatus.DRAFT;
    }
  }

  /**
   * Get PO by ID using our backend API
   */
  static async getPO(id: string): Promise<PurchaseOrder> {
    try {
      const response = await api.get(`/purchase-orders/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch PO');
      }

      if (!response.data.data || response.data.data.length === 0) {
        throw new Error('Purchase order not found');
      }

      // Transform the single PO data
      const transformedData = this.transformBackendPOData(response.data.data);
      return transformedData[0];
    } catch (error: any) {
      console.error('Get PO error:', error);
      if (error.response?.status === 404) {
        throw new Error('Purchase order not found');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch purchase order');
    }
  }

  /**
   * Check SAP API health status
   */
  static async checkSAPHealth(): Promise<{ status: string; message: string }> {
    try {
      const response = await api.get('/purchase-orders/health');
      return {
        status: response.data.status,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error('SAP health check error:', error);
      return {
        status: 'unhealthy',
        message: 'SAP API is not accessible',
      };
    }
  }

  /**
   * Get PO list by date range
   */
  static async getPOListByDate(dateFrom: string, dateTo?: string): Promise<POListResponse> {
    const params: POListParams = {
      filter: {
        dateFrom,
        dateTo,
      }
    };
    return this.getPOList(params);
  }

  /**
   * Search POs by document number
   */
  static async searchPOByDocumentNumber(documentNumber: string): Promise<POListResponse> {
    const params: POListParams = {
      filter: {
        search: documentNumber,
      }
    };
    return this.getPOList(params);
  }

  // ========================
  // Legacy methods for compatibility
  // These methods are kept for backward compatibility but may need backend implementation
  // ========================

  /**
   * Update PO - TODO: Implement backend endpoint
   */
  static async updatePO(id: string, data: Partial<POEditFormData>): Promise<PurchaseOrder> {
    // For now, this is a placeholder - needs backend implementation
    throw new Error('Update PO functionality not yet implemented in backend');
    
    // Future implementation:
    // const response: AxiosResponse<APIResponse<PurchaseOrder>> = await api.patch(`/purchase-orders/${id}`, data);
    // if (!response.data.success) {
    //   throw new Error(response.data.message || 'Failed to update PO');
    // }
    // return response.data.data!;
  }

  /**
   * Send PO email to vendor - TODO: Implement backend endpoint
   */
  static async sendPOEmail(id: string): Promise<void> {
    // For now, this is a placeholder - needs backend implementation
    throw new Error('Send PO email functionality not yet implemented in backend');
    
    // Future implementation:
    // const response: AxiosResponse<APIResponse<void>> = await api.post(`/purchase-orders/${id}/send-email`);
    // if (!response.data.success) {
    //   throw new Error(response.data.message || 'Failed to send email');
    // }
  }

  /**
   * Send PO email with custom data - TODO: Implement backend endpoint
   */
  static async sendPOEmailWithData(id: string, emailData: POEmailFormData): Promise<void> {
    // For now, this is a placeholder - needs backend implementation
    throw new Error('Send PO email with data functionality not yet implemented in backend');
  }

  /**
   * Get PO email status - TODO: Implement backend endpoint
   */
  static async getPOEmailStatus(id: string): Promise<POEmailStatus> {
    // For now, this is a placeholder - needs backend implementation
    throw new Error('Get PO email status functionality not yet implemented in backend');
  }

  /**
   * Get PO audit log - TODO: Implement backend endpoint
   */
  static async getPOAuditLog(id: string): Promise<AuditLogEntry[]> {
    // For now, this is a placeholder - needs backend implementation
    throw new Error('Get PO audit log functionality not yet implemented in backend');
  }

  /**
   * Approve PO - TODO: Implement backend endpoint
   */
  static async approvePO(id: string): Promise<PurchaseOrder> {
    // For now, this is a placeholder - needs backend implementation
    throw new Error('Approve PO functionality not yet implemented in backend');
  }

  /**
   * Cancel PO - TODO: Implement backend endpoint
   */
  static async cancelPO(id: string, reason?: string): Promise<PurchaseOrder> {
    // For now, this is a placeholder - needs backend implementation
    throw new Error('Cancel PO functionality not yet implemented in backend');
  }

  /**
   * Get PO acknowledge status - TODO: Implement backend endpoint
   */
  static async getPOAcknowledgeStatus(id: string): Promise<POAcknowledgeData> {
    // For now, this is a placeholder - needs backend implementation
    throw new Error('Get PO acknowledge status functionality not yet implemented in backend');
  }

  /**
   * Resend PO email to vendor - TODO: Implement backend endpoint
   */
  static async resendPOEmail(id: string): Promise<void> {
    // For now, this is a placeholder - needs backend implementation
    throw new Error('Resend PO email functionality not yet implemented in backend');
  }

  /**
   * Get PO acknowledge link - TODO: Implement backend endpoint
   */
  static async getPOAcknowledgeLink(id: string): Promise<string> {
    // For now, this is a placeholder - needs backend implementation
    throw new Error('Get PO acknowledge link functionality not yet implemented in backend');
  }
}

export default POService;

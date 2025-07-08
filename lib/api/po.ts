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
    // HARDCODED TOKEN FOR TESTING ONLY
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ik9zb3RzcGEiLCJpYXQiOjE3NTE2MjA1MDAsImV4cCI6MTc1MTYyMjMwMH0.Uhctxwi__mKCyj0YS6olS6U_4OVgOZ8hBIBSSZcQI3E";

    try {
      // Use GET request for /api/procurement/get_po_info
      const response = await axios.get(
        'https://apiservice-ssb-api-uat.osotspa.com/api/procurement/get_po_info',
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: params.page || 1,
            limit: params.limit || 10,
            // Add other query parameters if the API supports them
            ...(params.filter?.search && { search: params.filter.search }),
            ...(params.filter?.status && { status: params.filter.status.join(',') }),
            ...(params.filter?.vendorId && { vendorId: params.filter.vendorId }),
            ...(params.filter?.dateFrom && { dateFrom: params.filter.dateFrom }),
            ...(params.filter?.dateTo && { dateTo: params.filter.dateTo }),
            ...(params.filter?.createdBy && { createdBy: params.filter.createdBy }),
            ...(params.sort?.sortBy && { sortBy: params.sort.sortBy }),
            ...(params.sort?.sortOrder && { sortOrder: params.sort.sortOrder }),
          }
        }
      );

      // Log the response for debugging
      console.log('PO API response:', response.data);

      const data = response.data;
      
      // Transform SAP PO data to our format
      const transformedItems = this.transformSAPPOData(data);

      return {
        items: transformedItems,
        total: transformedItems.length,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: Math.ceil(transformedItems.length / (params.limit || 10)),
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
   * Format SAP date (YYYYMMDD) to ISO string with better error handling
   */
  private static formatSAPDate(sapDate: string): string {
    // Return current date for invalid inputs
    if (!sapDate || sapDate === '00000000' || sapDate.trim() === '') {
      return new Date().toISOString();
    }
    
    try {
      // Handle different date formats
      let cleanDate = sapDate.replace(/\D/g, ''); // Remove non-digits
      
      if (cleanDate.length === 8) {
        const year = parseInt(cleanDate.substring(0, 4), 10);
        const month = parseInt(cleanDate.substring(4, 6), 10);
        const day = parseInt(cleanDate.substring(6, 8), 10);
        
        // Validate date components
        if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
          console.warn(`Invalid SAP date components: ${year}-${month}-${day} from original: ${sapDate}`);
          return new Date().toISOString();
        }
        
        // Create date object and validate
        const dateObj = new Date(year, month - 1, day); // month is 0-indexed
        
        // Check if the date is valid
        if (dateObj.getFullYear() === year && 
            dateObj.getMonth() === month - 1 && 
            dateObj.getDate() === day) {
          return dateObj.toISOString();
        } else {
          console.warn(`Invalid SAP date: ${sapDate} -> ${year}-${month}-${day}`);
          return new Date().toISOString();
        }
      }
      
      // If not 8 digits, try to parse as is
      const parsedDate = new Date(sapDate);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
      
      // Fallback to current date
      console.warn(`Could not parse SAP date: ${sapDate}`);
      return new Date().toISOString();
      
    } catch (error) {
      console.error(`Error formatting SAP date: ${sapDate}`, error);
      return new Date().toISOString();
    }
  }

  /**
   * Format SAP datetime (YYYYMMDDHHMMSS.SSSSSSS) to ISO string with better error handling
   */
  private static formatSAPDateTime(sapDateTime: string): string {
    if (!sapDateTime || sapDateTime.trim() === '') {
      return new Date().toISOString();
    }
    
    try {
      // Extract date and time components
      const cleanDateTime = sapDateTime.replace(/[^\d]/g, ''); // Remove non-digits
      
      if (cleanDateTime.length >= 8) {
        const year = parseInt(cleanDateTime.substring(0, 4), 10);
        const month = parseInt(cleanDateTime.substring(4, 6), 10);
        const day = parseInt(cleanDateTime.substring(6, 8), 10);
        
        // Validate date components
        if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
          console.warn(`Invalid SAP datetime components: ${year}-${month}-${day}`);
          return new Date().toISOString();
        }
        
        // Extract time components if available
        let hour = 0, minute = 0, second = 0;
        if (cleanDateTime.length >= 10) {
          hour = parseInt(cleanDateTime.substring(8, 10), 10);
        }
        if (cleanDateTime.length >= 12) {
          minute = parseInt(cleanDateTime.substring(10, 12), 10);
        }
        if (cleanDateTime.length >= 14) {
          second = parseInt(cleanDateTime.substring(12, 14), 10);
        }
        
        // Validate time components
        if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
          console.warn(`Invalid SAP time components: ${hour}:${minute}:${second}`);
          hour = 0; minute = 0; second = 0;
        }
        
        // Create date object and validate
        const dateObj = new Date(year, month - 1, day, hour, minute, second);
        
        // Check if the date is valid
        if (dateObj.getFullYear() === year && 
            dateObj.getMonth() === month - 1 && 
            dateObj.getDate() === day) {
          return dateObj.toISOString();
        } else {
          console.warn(`Invalid SAP datetime: ${sapDateTime}`);
          return new Date().toISOString();
        }
      }
      
      // Fallback to current date
      console.warn(`Could not parse SAP datetime: ${sapDateTime}`);
      return new Date().toISOString();
      
    } catch (error) {
      console.error(`Error formatting SAP datetime: ${sapDateTime}`, error);
      return new Date().toISOString();
    }
  }

  /**
   * Transform SAP PO data to our PurchaseOrder format
   * Focus on essential fields: PO Number, PO Date, Vendor
   */
  private static transformSAPPOData(sapData: any): PurchaseOrder[] {
    const results: PurchaseOrder[] = [];
    
    if (!sapData.data) {
      console.warn('No data found in SAP response');
      return results;
    }

    const { ET_EKKO, EX_PO_HEAD, EX_PO_ITEM } = sapData.data;

    // Log the raw data for debugging
    console.log('SAP Data Debug:', {
      ET_EKKO_count: ET_EKKO?.length || 0,
      EX_PO_HEAD_count: EX_PO_HEAD?.length || 0,
      EX_PO_ITEM_count: EX_PO_ITEM?.length || 0,
      sample_dates: ET_EKKO?.[0] ? {
        BEDAT: ET_EKKO[0].BEDAT,
        AEDAT: ET_EKKO[0].AEDAT,
        LASTCHANGEDATETIME: ET_EKKO[0].LASTCHANGEDATETIME
      } : null
    });

    // Process each PO header from ET_EKKO
    if (Array.isArray(ET_EKKO)) {
      ET_EKKO.forEach((header: any) => {
        try {
          // Log individual header for debugging
          console.log(`Processing PO ${header.EBELN}:`, {
            BEDAT: header.BEDAT,
            AEDAT: header.AEDAT,
            PROCSTAT: header.PROCSTAT,
            LIFNR: header.LIFNR
          });

          // Get corresponding header details
          const headDetail = Array.isArray(EX_PO_HEAD) 
            ? EX_PO_HEAD.find((detail: any) => detail.EBELN === header.EBELN) 
            : null;

          // Get corresponding items for calculating total
          const relatedItems = Array.isArray(EX_PO_ITEM) 
            ? EX_PO_ITEM.filter((item: any) => item.EBELN === header.EBELN && item.NETWR_C) 
            : [];

          // Calculate total amount from items
          const totalAmount = relatedItems.reduce((sum: number, item: any) => {
            const itemTotal = parseFloat(item.NETWR_C?.replace(/,/g, '') || '0');
            return sum + itemTotal;
          }, 0);

          // Create vendor object
          const vendor: Vendor = {
            id: header.LIFNR || 'unknown',
            name: headDetail?.VEND || header.VERKF || 'Unknown Vendor',
            email: headDetail?.VERKFT || 'vendor@example.com',
            contactPerson: header.VERKF || undefined,
            phone: header.TELF1 || undefined,
            address: headDetail ? [
              headDetail.VEND_ADDR_L1,
              headDetail.VEND_ADDR_L2,
              headDetail.VEND_ADDR_L3
            ].filter(Boolean).join(', ') : undefined,
          };

          // Transform minimal items for display
          const items: POItem[] = relatedItems.map((item: any, index: number) => ({
            id: `${header.EBELN}-${item.EBELP || index}`,
            productName: item.MAT_DESC || 'Unknown Product',
            description: item.MAT_DESC || '',
            quantity: parseFloat(item.QTY_C?.replace(/,/g, '') || '0'),
            unitPrice: parseFloat(item.PPU_C?.replace(/,/g, '') || '0'),
            totalPrice: parseFloat(item.NETWR_C?.replace(/,/g, '') || '0'),
            unit: item.UOM_C || 'PCS',
          }));

          // Handle delivery date from EX_PO_HEAD
          let requiredDate = this.formatSAPDate(header.BEDAT);
          if (headDetail?.DELIVERY_D) {
            // EX_PO_HEAD.DELIVERY_D is in format "DD/MM/YYYY"
            try {
              const deliveryDateParts = headDetail.DELIVERY_D.split('/');
              if (deliveryDateParts.length === 3) {
                const [day, month, year] = deliveryDateParts;
                const deliveryDateString = `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;
                requiredDate = this.formatSAPDate(deliveryDateString);
              }
            } catch (error) {
              console.warn(`Could not parse delivery date: ${headDetail.DELIVERY_D}`, error);
            }
          }

          // Create PurchaseOrder object with essential fields
          const po: PurchaseOrder = {
            id: header.EBELN,
            poNumber: header.EBELN,
            title: `PO ${header.EBELN}`,
            status: this.mapSAPStatusToPOStatus(header.PROCSTAT),
            vendor: vendor,
            items: items,
            totalAmount: totalAmount,
            currency: header.WAERS || 'THB',
            requestedDate: this.formatSAPDate(header.BEDAT),
            requiredDate: requiredDate,
            description: `${header.BSART || ''} - ${header.BSTYP || ''}`.trim(),
            remarks: '',
            createdBy: header.ERNAM || 'System',
            createdAt: this.formatSAPDate(header.AEDAT),
            updatedAt: this.formatSAPDateTime(header.LASTCHANGEDATETIME),
          };

          console.log(`Successfully processed PO ${header.EBELN}:`, {
            status: po.status,
            totalAmount: po.totalAmount,
            vendor: po.vendor.name,
            itemCount: po.items.length
          });

          results.push(po);
        } catch (error) {
          console.error(`Error processing PO ${header.EBELN}:`, error);
          // Skip this PO and continue with others
        }
      });
    }

    console.log(`Total POs processed: ${results.length}`);
    return results;
  }

  /**
   * Map SAP procurement status to PO Status
   */
  private static mapSAPStatusToPOStatus(procstat: string): POStatus {
    switch (procstat) {
      case '01': return POStatus.DRAFT;
      case '02': return POStatus.PENDING_APPROVAL;
      case '03': return POStatus.APPROVED;
      case '04': return POStatus.SENT;
      case '05': return POStatus.ACKNOWLEDGED;
      default: return POStatus.DRAFT;
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
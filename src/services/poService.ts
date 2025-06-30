import axios from 'axios';
import { POListParams, POListResponse, PurchaseOrder } from '@/types/po';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const poService = {
  // Get list of Purchase Orders with pagination, filtering, sorting
  async getPOList(params: POListParams): Promise<POListResponse> {
    const response = await apiClient.get('/po', { params });
    return response.data;
  },

  // Get single Purchase Order by ID
  async getPOById(id: string): Promise<PurchaseOrder> {
    const response = await apiClient.get(`/po/${id}`);
    return response.data;
  },

  // Send PO email to vendor
  async sendPOEmail(id: string): Promise<void> {
    await apiClient.post(`/po/${id}/send-email`);
  },

  // Get acknowledgment status
  async getAcknowledgmentStatus(id: string): Promise<{ acknowledged: boolean; acknowledgedDate?: string }> {
    const response = await apiClient.get(`/po/${id}/acknowledgment`);
    return response.data;
  },
};

export default poService;
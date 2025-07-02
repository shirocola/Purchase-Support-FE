import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { POService } from '@/lib/api/po';
import { POEditFormData, POEmailFormData, POListParams, POListResponse, POStatus } from '@/lib/types/po';
import { mockPOList } from '@/lib/mockData';

/**
 * Mock function to simulate PO list API for development
 */
const getMockPOList = async (params: POListParams = {}): Promise<POListResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredItems = [...mockPOList];
  
  // Apply filters
  if (params.filter) {
    const { search, status, vendorId, dateFrom, dateTo, createdBy } = params.filter;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = filteredItems.filter(po => 
        po.poNumber.toLowerCase().includes(searchLower) ||
        po.title.toLowerCase().includes(searchLower) ||
        po.vendor.name.toLowerCase().includes(searchLower)
      );
    }
    
    if (status && status.length > 0) {
      filteredItems = filteredItems.filter(po => status.includes(po.status));
    }
    
    if (vendorId) {
      filteredItems = filteredItems.filter(po => po.vendor.id === vendorId);
    }
    
    if (dateFrom) {
      filteredItems = filteredItems.filter(po => 
        new Date(po.createdAt) >= new Date(dateFrom)
      );
    }
    
    if (dateTo) {
      filteredItems = filteredItems.filter(po => 
        new Date(po.createdAt) <= new Date(dateTo)
      );
    }
    
    if (createdBy) {
      filteredItems = filteredItems.filter(po => po.createdBy === createdBy);
    }
  }
  
  // Apply sorting
  if (params.sort) {
    const { sortBy, sortOrder } = params.sort;
    filteredItems.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'poNumber':
          aValue = a.poNumber;
          bValue = b.poNumber;
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'vendor':
          aValue = a.vendor.name;
          bValue = b.vendor.name;
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'createdAt':
        case 'requiredDate':
          aValue = new Date(a[sortBy] || a.createdAt);
          bValue = new Date(b[sortBy] || b.createdAt);
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
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
    page,
    limit,
    totalPages: Math.ceil(filteredItems.length / limit),
  };
};

/**
 * Hook to fetch PO list with filtering, sorting, and pagination
 */
export function usePOList(params: POListParams = {}) {
  return useQuery({
    queryKey: ['po-list', params],
    queryFn: () => {
      // Use mock data in development mode or when API is not available
      if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL) {
        return getMockPOList(params);
      }
      return POService.getPOList(params);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}

/**
 * Hook to fetch PO data
 */
export function usePO(id: string) {
  return useQuery({
    queryKey: ['po', id],
    queryFn: () => POService.getPO(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update PO
 */
export function useUpdatePO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<POEditFormData> }) =>
      POService.updatePO(id, data),
    onSuccess: (updatedPO) => {
      // Update the cache with the new data
      queryClient.setQueryData(['po', updatedPO.id], updatedPO);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['po'] });
    },
  });
}

/**
 * Hook to send PO email
 */
export function useSendPOEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => POService.sendPOEmail(id),
    onSuccess: (_, id) => {
      // Invalidate PO data to refetch updated status
      queryClient.invalidateQueries({ queryKey: ['po', id] });
      queryClient.invalidateQueries({ queryKey: ['po-email-status', id] });
    },
  });
}

/**
 * Hook to send PO email with custom data
 */
export function useSendPOEmailWithData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, emailData }: { id: string; emailData: POEmailFormData }) => 
      POService.sendPOEmailWithData(id, emailData),
    onSuccess: (_, { id }) => {
      // Invalidate PO data to refetch updated status
      queryClient.invalidateQueries({ queryKey: ['po', id] });
      queryClient.invalidateQueries({ queryKey: ['po-email-status', id] });
    },
  });
}

/**
 * Hook to fetch PO email status
 */
export function usePOEmailStatus(id: string) {
  return useQuery({
    queryKey: ['po-email-status', id],
    queryFn: () => POService.getPOEmailStatus(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to approve PO
 */
export function useApprovePO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => POService.approvePO(id),
    onSuccess: (updatedPO) => {
      queryClient.setQueryData(['po', updatedPO.id], updatedPO);
      queryClient.invalidateQueries({ queryKey: ['po'] });
    },
  });
}

/**
 * Hook to cancel PO
 */
export function useCancelPO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      POService.cancelPO(id, reason),
    onSuccess: (updatedPO) => {
      queryClient.setQueryData(['po', updatedPO.id], updatedPO);
      queryClient.invalidateQueries({ queryKey: ['po'] });
    },
  });
}

/**
 * Hook to fetch PO audit log
 */
export function usePOAuditLog(id: string) {
  return useQuery({
    queryKey: ['po-audit-log', id],
    queryFn: () => POService.getPOAuditLog(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch PO acknowledge status
 */
export function usePOAcknowledgeStatus(id: string) {
  return useQuery({
    queryKey: ['po-acknowledge-status', id],
    queryFn: () => POService.getPOAcknowledgeStatus(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds - shorter for more real-time feel
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
}

/**
 * Hook to resend PO email
 */
export function useResendPOEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => POService.resendPOEmail(id),
    onSuccess: (_, id) => {
      // Invalidate related queries to refetch updated status
      queryClient.invalidateQueries({ queryKey: ['po', id] });
      queryClient.invalidateQueries({ queryKey: ['po-email-status', id] });
      queryClient.invalidateQueries({ queryKey: ['po-acknowledge-status', id] });
    },
  });
}

/**
 * Hook to get PO acknowledge link
 */
export function usePOAcknowledgeLink(id: string) {
  return useQuery({
    queryKey: ['po-acknowledge-link', id],
    queryFn: () => POService.getPOAcknowledgeLink(id),
    enabled: false, // Only fetch when explicitly requested
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
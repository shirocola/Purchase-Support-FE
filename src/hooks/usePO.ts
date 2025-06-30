import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { POListParams, POListResponse, PurchaseOrder } from '@/types/po';
import poService from '@/services/poService';

export const usePOList = (params: POListParams) => {
  return useQuery<POListResponse, Error>({
    queryKey: ['po-list', params],
    queryFn: () => poService.getPOList(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePODetail = (id: string) => {
  return useQuery<PurchaseOrder, Error>({
    queryKey: ['po-detail', id],
    queryFn: () => poService.getPOById(id),
    enabled: !!id,
  });
};

export const useSendPOEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => poService.sendPOEmail(id),
    onSuccess: () => {
      // Invalidate PO list to refresh data
      queryClient.invalidateQueries({ queryKey: ['po-list'] });
    },
  });
};

export const useAcknowledgmentStatus = (id: string) => {
  return useQuery({
    queryKey: ['po-acknowledgment', id],
    queryFn: () => poService.getAcknowledgmentStatus(id),
    enabled: !!id,
    refetchInterval: 30000, // Check every 30 seconds for acknowledgment updates
  });
};
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { POService } from '@/lib/api/po';
import { POEditFormData, POEmailFormData } from '@/lib/types/po';

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
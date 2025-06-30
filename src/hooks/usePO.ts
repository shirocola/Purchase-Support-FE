import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { mockPO, mockAuditLog, mockPermissions, mockUser } from '@/lib/mockData'

// For development, we'll use mock data but with the same structure as real API calls
const USE_MOCK_DATA = process.env.NODE_ENV === 'development'

export function usePO(poId: string) {
  return useQuery({
    queryKey: ['po', poId],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))
        if (poId === 'not-found') {
          throw new Error('Not found')
        }
        if (poId === 'forbidden') {
          throw new Error('Access denied')
        }
        return mockPO
      }
      return apiClient.getPO(poId)
    },
    enabled: !!poId,
  })
}

export function useAuditLog(poId: string) {
  return useQuery({
    queryKey: ['auditLog', poId],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 600))
        return mockAuditLog
      }
      return apiClient.getAuditLog(poId)
    },
    enabled: !!poId,
  })
}

export function usePermissions(poId: string) {
  return useQuery({
    queryKey: ['permissions', poId],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300))
        return mockPermissions
      }
      return apiClient.getUserPermissions(poId)
    },
    enabled: !!poId,
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 200))
        return mockUser
      }
      return apiClient.getCurrentUser()
    },
  })
}

export function useSendPOEmail() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (poId: string) => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return
      }
      return apiClient.sendPOEmail(poId)
    },
    onSuccess: (_, poId) => {
      // Invalidate and refetch the PO and audit log
      queryClient.invalidateQueries({ queryKey: ['po', poId] })
      queryClient.invalidateQueries({ queryKey: ['auditLog', poId] })
    },
  })
}

export function useAcknowledgePO() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (poId: string) => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 800))
        return
      }
      return apiClient.acknowledgePO(poId)
    },
    onSuccess: (_, poId) => {
      queryClient.invalidateQueries({ queryKey: ['po', poId] })
      queryClient.invalidateQueries({ queryKey: ['auditLog', poId] })
    },
  })
}
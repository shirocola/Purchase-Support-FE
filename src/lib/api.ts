import { PurchaseOrder, AuditLogEntry, Permission, User } from '@/types/po'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        // Add JWT token here when authentication is implemented
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied')
      }
      if (response.status === 404) {
        throw new Error('Not found')
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getPO(poId: string): Promise<PurchaseOrder> {
    return this.request<PurchaseOrder>(`/po/${poId}`)
  }

  async getAuditLog(poId: string): Promise<AuditLogEntry[]> {
    return this.request<AuditLogEntry[]>(`/po/${poId}/audit-log`)
  }

  async getUserPermissions(poId: string): Promise<Permission> {
    return this.request<Permission>(`/po/${poId}/permissions`)
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me')
  }

  async sendPOEmail(poId: string): Promise<void> {
    return this.request<void>(`/po/${poId}/send-email`, {
      method: 'POST',
    })
  }

  async acknowledgePO(poId: string): Promise<void> {
    return this.request<void>(`/po/${poId}/acknowledge`, {
      method: 'POST',
    })
  }
}

export const apiClient = new ApiClient()
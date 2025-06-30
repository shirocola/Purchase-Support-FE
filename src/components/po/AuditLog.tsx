import { AuditLogEntry } from '@/types/po'
import { formatDateTime } from '@/lib/utils'
import { EmptyState } from '@/components/ErrorComponents'
import { LoadingSpinner } from '@/components/LoadingComponents'

interface AuditLogProps {
  auditLog: AuditLogEntry[]
  isLoading: boolean
  error?: Error | null
}

export function AuditLog({ auditLog, isLoading, error }: AuditLogProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Audit Log</h3>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
          <span className="ml-2 text-gray-600">Loading audit log...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Audit Log</h3>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-600">Failed to load audit log: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Audit Log</h3>
      
      {auditLog.length === 0 ? (
        <EmptyState message="No audit log entries found." />
      ) : (
        <div className="space-y-4">
          {auditLog.map((entry) => (
            <div key={entry.id} className="border-l-4 border-blue-200 pl-4 py-2">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{entry.action}</span>
                  <span className="text-sm text-gray-600">by {entry.userName}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDateTime(entry.timestamp)}
                </span>
              </div>
              
              <p className="text-gray-700 mb-2">{entry.description}</p>
              
              {(entry.oldValue || entry.newValue) && (
                <div className="text-sm bg-gray-50 rounded p-2 mt-2">
                  {entry.oldValue && (
                    <div className="mb-1">
                      <span className="font-medium text-gray-600">From: </span>
                      <code className="text-red-600">
                        {typeof entry.oldValue === 'object' 
                          ? JSON.stringify(entry.oldValue) 
                          : entry.oldValue}
                      </code>
                    </div>
                  )}
                  {entry.newValue && (
                    <div>
                      <span className="font-medium text-gray-600">To: </span>
                      <code className="text-green-600">
                        {typeof entry.newValue === 'object' 
                          ? JSON.stringify(entry.newValue) 
                          : entry.newValue}
                      </code>
                    </div>
                  )}
                </div>
              )}
              
              {entry.metadata && (
                <div className="text-xs text-gray-500 mt-1">
                  {Object.entries(entry.metadata).map(([key, value]) => (
                    <span key={key} className="mr-3">
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
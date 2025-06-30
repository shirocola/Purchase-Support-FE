import { POStatus } from '@/types/po'
import { getStatusColor, getStatusText, formatDateTime } from '@/lib/utils'

interface POStatusDisplayProps {
  currentStatus: POStatus
  statusHistory: POStatus[]
}

export function POStatusDisplay({ currentStatus, statusHistory }: POStatusDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Status Information</h3>
      
      {/* Current Status */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-medium text-gray-600">Current Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus.status)}`}>
            {getStatusText(currentStatus.status)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-1">
          Updated: {formatDateTime(currentStatus.statusDate)}
        </p>
        {currentStatus.description && (
          <p className="text-sm text-gray-700">{currentStatus.description}</p>
        )}
      </div>

      {/* Status History */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Status History</h4>
        <div className="space-y-3">
          {statusHistory.map((status, index) => (
            <div key={status.id} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className={`w-3 h-3 rounded-full ${
                  index === statusHistory.length - 1 ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status.status)}`}>
                    {getStatusText(status.status)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(status.statusDate)}
                  </span>
                </div>
                {status.description && (
                  <p className="text-sm text-gray-600">{status.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
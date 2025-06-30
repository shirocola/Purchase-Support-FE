import { PurchaseOrder } from '@/types/po'
import { formatDate } from '@/lib/utils'

interface POHeaderProps {
  po: PurchaseOrder
}

export function POHeader({ po }: POHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Basic PO Info */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Purchase Order {po.poNumber}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">PO Date:</span>
              <span className="ml-2 text-gray-900">{formatDate(po.date)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created By:</span>
              <span className="ml-2 text-gray-900">{po.createdBy}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-900">{formatDate(po.createdAt)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Last Updated:</span>
              <span className="ml-2 text-gray-900">{formatDate(po.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Vendor Info */}
        <div className="lg:w-1/3">
          <h3 className="font-semibold text-gray-900 mb-3">Vendor Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-gray-900">{po.vendor.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-900">{po.vendor.email}</span>
            </div>
            {po.vendor.phone && (
              <div>
                <span className="font-medium text-gray-700">Phone:</span>
                <span className="ml-2 text-gray-900">{po.vendor.phone}</span>
              </div>
            )}
            {po.vendor.address && (
              <div>
                <span className="font-medium text-gray-700">Address:</span>
                <span className="ml-2 text-gray-900">{po.vendor.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes and Attachments */}
      {(po.notes || (po.attachments && po.attachments.length > 0)) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          {po.notes && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Notes:</h4>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{po.notes}</p>
            </div>
          )}
          
          {po.attachments && po.attachments.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Attachments:</h4>
              <div className="flex flex-wrap gap-2">
                {po.attachments.map((filename, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    📎 {filename}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
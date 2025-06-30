import { POItem } from '@/types/po'
import { formatCurrency } from '@/lib/utils'

interface POItemsTableProps {
  items: POItem[]
  totalAmount: number
  canViewFinancialData: boolean
}

export function POItemsTable({ items, totalAmount, canViewFinancialData }: POItemsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Items</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-700">Item</th>
              <th className="text-left py-3 px-2 font-medium text-gray-700">Description</th>
              <th className="text-right py-3 px-2 font-medium text-gray-700">Qty</th>
              <th className="text-left py-3 px-2 font-medium text-gray-700">Unit</th>
              {canViewFinancialData && (
                <>
                  <th className="text-right py-3 px-2 font-medium text-gray-700">Unit Price</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-700">Total</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 px-2 font-medium text-gray-900">{item.name}</td>
                <td className="py-3 px-2 text-gray-600 text-sm">
                  {item.description || '-'}
                </td>
                <td className="py-3 px-2 text-right font-medium">{item.quantity}</td>
                <td className="py-3 px-2 text-gray-600">{item.unit}</td>
                {canViewFinancialData && (
                  <>
                    <td className="py-3 px-2 text-right font-medium">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 px-2 text-right font-medium">
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
          {canViewFinancialData && (
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td colSpan={4} className="py-3 px-2 text-right font-semibold text-gray-700">
                  Total Amount:
                </td>
                <td colSpan={2} className="py-3 px-2 text-right font-bold text-lg text-gray-900">
                  {formatCurrency(totalAmount)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {!canViewFinancialData && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            Financial information is hidden based on your permission level.
          </p>
        </div>
      )}
    </div>
  )
}
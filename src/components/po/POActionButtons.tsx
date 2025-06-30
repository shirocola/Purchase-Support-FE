'use client'

import { useState } from 'react'
import { Permission } from '@/types/po'
import { LoadingSpinner } from '@/components/LoadingComponents'

interface POActionButtonsProps {
  poId: string
  permissions: Permission
  onSendEmail: () => void
  onAcknowledge: () => void
  isEmailLoading: boolean
  isAcknowledgeLoading: boolean
}

export function POActionButtons({
  poId,
  permissions,
  onSendEmail,
  onAcknowledge,
  isEmailLoading,
  isAcknowledgeLoading,
}: POActionButtonsProps) {
  const [showConfirmEmail, setShowConfirmEmail] = useState(false)
  const [showConfirmAck, setShowConfirmAck] = useState(false)

  const handleSendEmail = () => {
    setShowConfirmEmail(false)
    onSendEmail()
  }

  const handleAcknowledge = () => {
    setShowConfirmAck(false)
    onAcknowledge()
  }

  if (!permissions.canSendEmail && !permissions.canEdit) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Actions</h3>
      
      <div className="space-y-3">
        {permissions.canSendEmail && (
          <div>
            {showConfirmEmail ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800 mb-3">
                  Are you sure you want to send this PO to the vendor?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSendEmail}
                    disabled={isEmailLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isEmailLoading && <LoadingSpinner size="sm" />}
                    Confirm Send
                  </button>
                  <button
                    onClick={() => setShowConfirmEmail(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmEmail(true)}
                disabled={isEmailLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isEmailLoading && <LoadingSpinner size="sm" />}
                📧 Send Email to Vendor
              </button>
            )}
          </div>
        )}

        {permissions.canEdit && (
          <div>
            {showConfirmAck ? (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-sm text-green-800 mb-3">
                  Acknowledge this PO as received and reviewed?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAcknowledge}
                    disabled={isAcknowledgeLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isAcknowledgeLoading && <LoadingSpinner size="sm" />}
                    Confirm Acknowledge
                  </button>
                  <button
                    onClick={() => setShowConfirmAck(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmAck(true)}
                disabled={isAcknowledgeLoading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAcknowledgeLoading && <LoadingSpinner size="sm" />}
                ✅ Acknowledge PO
              </button>
            )}
          </div>
        )}

        <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200">
          📄 Download PDF
        </button>

        <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200">
          🔗 Copy Link
        </button>
      </div>
    </div>
  )
}
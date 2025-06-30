'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePO, useAuditLog, usePermissions, useSendPOEmail, useAcknowledgePO } from '@/hooks/usePO'
import { POHeader } from '@/components/po/POHeader'
import { POStatusDisplay } from '@/components/po/POStatusDisplay'
import { POItemsTable } from '@/components/po/POItemsTable'
import { AuditLog } from '@/components/po/AuditLog'
import { POActionButtons } from '@/components/po/POActionButtons'
import { Tabs } from '@/components/Tabs'
import { PageLoading } from '@/components/LoadingComponents'
import { ErrorDisplay } from '@/components/ErrorComponents'

interface PODetailPageProps {
  poId: string
}

export function PODetailPage({ poId }: PODetailPageProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const { data: po, isLoading: poLoading, error: poError, refetch: refetchPO } = usePO(poId)
  const { data: auditLog, isLoading: auditLoading, error: auditError } = useAuditLog(poId)
  const { data: permissions, isLoading: permissionsLoading } = usePermissions(poId)
  
  const sendEmailMutation = useSendPOEmail()
  const acknowledgeMutation = useAcknowledgePO()

  const isLoading = poLoading || permissionsLoading
  
  const handleSendEmail = async () => {
    try {
      await sendEmailMutation.mutateAsync(poId)
      setSuccessMessage('Email sent successfully to vendor!')
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }

  const handleAcknowledge = async () => {
    try {
      await acknowledgeMutation.mutateAsync(poId)
      setSuccessMessage('PO acknowledged successfully!')
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (error) {
      console.error('Failed to acknowledge PO:', error)
    }
  }

  if (isLoading) {
    return <PageLoading />
  }

  if (poError) {
    return <ErrorDisplay error={poError} retry={() => refetchPO()} />
  }

  if (!po || !permissions) {
    return <ErrorDisplay error={new Error('Failed to load PO data')} />
  }

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-6">
          <POItemsTable 
            items={po.items} 
            totalAmount={po.totalAmount}
            canViewFinancialData={permissions.canViewFinancialData}
          />
          <POStatusDisplay 
            currentStatus={po.currentStatus}
            statusHistory={po.statusHistory}
          />
        </div>
      ),
    },
    ...(permissions.canViewAuditLog ? [{
      id: 'audit',
      label: 'Audit Log',
      content: (
        <AuditLog 
          auditLog={auditLog || []}
          isLoading={auditLoading}
          error={auditError}
        />
      ),
    }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">PO Detail</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{po.poNumber}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <POHeader po={po} />
            <Tabs tabs={tabs} defaultTab="overview" />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <POActionButtons
              poId={poId}
              permissions={permissions}
              onSendEmail={handleSendEmail}
              onAcknowledge={handleAcknowledge}
              isEmailLoading={sendEmailMutation.isPending}
              isAcknowledgeLoading={acknowledgeMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
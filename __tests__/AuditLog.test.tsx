import { render, screen } from '@testing-library/react'
import { AuditLog } from '@/components/po/AuditLog'
import { mockAuditLog } from '@/lib/mockData'

describe('AuditLog', () => {
  it('renders audit log entries correctly', () => {
    render(
      <AuditLog 
        auditLog={mockAuditLog}
        isLoading={false}
        error={null}
      />
    )

    expect(screen.getByText('Audit Log')).toBeInTheDocument()

    // Check audit entries
    expect(screen.getByText('CREATE')).toBeInTheDocument()
    expect(screen.getByText('Purchase Order created')).toBeInTheDocument()
    expect(screen.getAllByText(/by John Smith/)[0]).toBeInTheDocument()

    expect(screen.getByText('UPDATE')).toBeInTheDocument()
    expect(screen.getByText('Added delivery notes')).toBeInTheDocument()

    expect(screen.getAllByText('STATUS_CHANGE')[0]).toBeInTheDocument()
    expect(screen.getByText('Status changed from draft to pending')).toBeInTheDocument()

    expect(screen.getByText('EMAIL_SENT')).toBeInTheDocument()
    expect(screen.getByText('PO sent to vendor via email')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <AuditLog 
        auditLog={[]}
        isLoading={true}
        error={null}
      />
    )

    expect(screen.getByText('Loading audit log...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(
      <AuditLog 
        auditLog={[]}
        isLoading={false}
        error={new Error('Failed to load')}
      />
    )

    expect(screen.getByText('Failed to load audit log: Failed to load')).toBeInTheDocument()
  })

  it('shows empty state when no entries', () => {
    render(
      <AuditLog 
        auditLog={[]}
        isLoading={false}
        error={null}
      />
    )

    expect(screen.getByText('No audit log entries found.')).toBeInTheDocument()
  })

  it('displays change values for update entries', () => {
    render(
      <AuditLog 
        auditLog={mockAuditLog}
        isLoading={false}
        error={null}
      />
    )

    // Check for old/new value display - use getAllByText since there are multiple entries
    expect(screen.getAllByText('From:').length).toBeGreaterThan(0)
    expect(screen.getAllByText('To:').length).toBeGreaterThan(0)
  })

  it('displays metadata when present', () => {
    render(
      <AuditLog 
        auditLog={mockAuditLog}
        isLoading={false}
        error={null}
      />
    )

    // Check for metadata display
    expect(screen.getByText(/recipientEmail:/)).toBeInTheDocument()
    expect(screen.getByText(/contact@abcsupplies.com/)).toBeInTheDocument()
  })
})
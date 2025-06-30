import { render, screen, fireEvent } from '@testing-library/react'
import { POHeader } from '@/components/po/POHeader'
import { POStatusDisplay } from '@/components/po/POStatusDisplay'
import { POActionButtons } from '@/components/po/POActionButtons'
import { mockPO, mockPermissions } from '@/lib/mockData'

// Mock Next.js router
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('PO Detail Components', () => {
  describe('POHeader', () => {
    it('renders PO header information correctly', () => {
      render(<POHeader po={mockPO} />)

      expect(screen.getByText('Purchase Order PO-001')).toBeInTheDocument()
      expect(screen.getByText('ABC Supplies Co., Ltd.')).toBeInTheDocument()
      expect(screen.getByText('contact@abcsupplies.com')).toBeInTheDocument()
      expect(screen.getByText('+66-2-123-4567')).toBeInTheDocument()
      expect(screen.getByText('123 Industrial Road, Bangkok 10400')).toBeInTheDocument()
      expect(screen.getByText('Urgent delivery required. Please confirm delivery date within 24 hours.')).toBeInTheDocument()
    })

    it('displays attachments when present', () => {
      render(<POHeader po={mockPO} />)

      expect(screen.getByText('📎 technical-specs.pdf')).toBeInTheDocument()
      expect(screen.getByText('📎 delivery-instructions.pdf')).toBeInTheDocument()
    })
  })

  describe('POStatusDisplay', () => {
    it('renders current status and history', () => {
      render(
        <POStatusDisplay 
          currentStatus={mockPO.currentStatus}
          statusHistory={mockPO.statusHistory}
        />
      )

      expect(screen.getByText('Status Information')).toBeInTheDocument()
      expect(screen.getByText('Current Status:')).toBeInTheDocument()
      expect(screen.getAllByText('Sent to Vendor')[0]).toBeInTheDocument()
      expect(screen.getByText('Status History')).toBeInTheDocument()
      
      // Check that all statuses in history are displayed
      expect(screen.getByText('Draft')).toBeInTheDocument()
      expect(screen.getByText('Pending Approval')).toBeInTheDocument()
    })
  })

  describe('POActionButtons', () => {
    const mockProps = {
      poId: 'po-001',
      permissions: mockPermissions,
      onSendEmail: jest.fn(),
      onAcknowledge: jest.fn(),
      isEmailLoading: false,
      isAcknowledgeLoading: false,
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('renders action buttons when user has permissions', () => {
      render(<POActionButtons {...mockProps} />)

      expect(screen.getByText('📧 Send Email to Vendor')).toBeInTheDocument()
      expect(screen.getByText('✅ Acknowledge PO')).toBeInTheDocument()
      expect(screen.getByText('📄 Download PDF')).toBeInTheDocument()
      expect(screen.getByText('🔗 Copy Link')).toBeInTheDocument()
    })

    it('shows confirmation dialog when sending email', () => {
      render(<POActionButtons {...mockProps} />)

      fireEvent.click(screen.getByText('📧 Send Email to Vendor'))

      expect(screen.getByText('Are you sure you want to send this PO to the vendor?')).toBeInTheDocument()
      expect(screen.getByText('Confirm Send')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('shows confirmation dialog when acknowledging PO', () => {
      render(<POActionButtons {...mockProps} />)

      fireEvent.click(screen.getByText('✅ Acknowledge PO'))

      expect(screen.getByText('Acknowledge this PO as received and reviewed?')).toBeInTheDocument()
      expect(screen.getByText('Confirm Acknowledge')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('calls onSendEmail when confirmed', () => {
      render(<POActionButtons {...mockProps} />)

      fireEvent.click(screen.getByText('📧 Send Email to Vendor'))
      fireEvent.click(screen.getByText('Confirm Send'))

      expect(mockProps.onSendEmail).toHaveBeenCalledTimes(1)
    })

    it('calls onAcknowledge when confirmed', () => {
      render(<POActionButtons {...mockProps} />)

      fireEvent.click(screen.getByText('✅ Acknowledge PO'))
      fireEvent.click(screen.getByText('Confirm Acknowledge'))

      expect(mockProps.onAcknowledge).toHaveBeenCalledTimes(1)
    })

    it('does not render when user has no permissions', () => {
      const noPermissions = {
        ...mockPermissions,
        canSendEmail: false,
        canEdit: false,
      }

      const { container } = render(
        <POActionButtons {...mockProps} permissions={noPermissions} />
      )

      expect(container.firstChild).toBeNull()
    })
  })
})
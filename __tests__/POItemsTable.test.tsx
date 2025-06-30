import { render, screen } from '@testing-library/react'
import { POItemsTable } from '@/components/po/POItemsTable'
import { mockPO } from '@/lib/mockData'

describe('POItemsTable', () => {
  it('renders all items when user has financial permission', () => {
    render(
      <POItemsTable 
        items={mockPO.items} 
        totalAmount={mockPO.totalAmount}
        canViewFinancialData={true}
      />
    )

    // Check header
    expect(screen.getByText('Items')).toBeInTheDocument()

    // Check column headers
    expect(screen.getByText('Item')).toBeInTheDocument()
    expect(screen.getByText('Unit Price')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()

    // Check items
    expect(screen.getByText('Steel Pipes')).toBeInTheDocument()
    expect(screen.getByText('Industrial Bolts')).toBeInTheDocument()
    expect(screen.getByText('Safety Equipment')).toBeInTheDocument()

    // Check total amount
    expect(screen.getByText('Total Amount:')).toBeInTheDocument()
    expect(screen.getByText('฿74,500.00')).toBeInTheDocument()
  })

  it('hides financial data when user lacks permission', () => {
    render(
      <POItemsTable 
        items={mockPO.items} 
        totalAmount={mockPO.totalAmount}
        canViewFinancialData={false}
      />
    )

    // Should still show items and quantities
    expect(screen.getByText('Steel Pipes')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument() // quantity

    // Should not show financial columns
    expect(screen.queryByText('Unit Price')).not.toBeInTheDocument()
    expect(screen.queryByText('Total')).not.toBeInTheDocument()
    expect(screen.queryByText('Total Amount:')).not.toBeInTheDocument()

    // Should show permission message
    expect(screen.getByText('Financial information is hidden based on your permission level.')).toBeInTheDocument()
  })

  it('handles empty items list', () => {
    render(
      <POItemsTable 
        items={[]} 
        totalAmount={0}
        canViewFinancialData={true}
      />
    )

    expect(screen.getByText('Items')).toBeInTheDocument()
    // Table should still render with headers
    expect(screen.getByText('Item')).toBeInTheDocument()
  })
})
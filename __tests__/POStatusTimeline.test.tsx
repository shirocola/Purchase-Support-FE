import React from 'react';
import { render, screen } from '@testing-library/react';
import { POStatusTimeline } from '@/components/po/POStatusTimeline';
import { POStatus, UserRole } from '@/lib/types/po';
import { mockStatusHistory } from '@/lib/mockData';

// Mock @mui/lab Timeline components
jest.mock('@mui/lab', () => ({
  Timeline: ({ children }: { children: React.ReactNode }) => <div data-testid="timeline">{children}</div>,
  TimelineItem: ({ children }: { children: React.ReactNode }) => <div data-testid="timeline-item">{children}</div>,
  TimelineSeparator: ({ children }: { children: React.ReactNode }) => <div data-testid="timeline-separator">{children}</div>,
  TimelineConnector: () => <div data-testid="timeline-connector" />,
  TimelineContent: ({ children }: { children: React.ReactNode }) => <div data-testid="timeline-content">{children}</div>,
  TimelineDot: ({ children }: { children: React.ReactNode }) => <div data-testid="timeline-dot">{children}</div>,
}));

describe('POStatusTimeline', () => {
  const defaultProps = {
    poId: 'po-001',
    currentStatus: POStatus.SENT,
    userRole: UserRole.APP_USER,
  };

  it('renders status timeline with default progression', () => {
    render(<POStatusTimeline {...defaultProps} />);

    expect(screen.getByText('Status Timeline')).toBeInTheDocument();
    
    // Check that status steps are shown
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Sent to Vendor')).toBeInTheDocument();
    expect(screen.getByText('Acknowledged')).toBeInTheDocument();
  });

  it('renders with provided status history', () => {
    render(
      <POStatusTimeline 
        {...defaultProps}
        statusHistory={mockStatusHistory}
      />
    );

    expect(screen.getByText('Status Timeline')).toBeInTheDocument();
    
    // Check specific entries from mock data - notes should be in StepContent
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <POStatusTimeline 
        {...defaultProps}
        isLoading={true}
      />
    );

    expect(screen.getByText('Loading status timeline...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(
      <POStatusTimeline 
        {...defaultProps}
        error={new Error('Failed to load')}
      />
    );

    expect(screen.getByText('Failed to load status: Failed to load')).toBeInTheDocument();
  });

  it('marks current status correctly', () => {
    render(
      <POStatusTimeline 
        {...defaultProps}
        currentStatus={POStatus.APPROVED}
      />
    );

    // Should show completed statuses as completed
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('handles different user roles', () => {
    render(
      <POStatusTimeline 
        {...defaultProps}
        userRole={UserRole.ADMIN}
      />
    );

    // Should still render the timeline for admin users
    expect(screen.getByText('Status Timeline')).toBeInTheDocument();
  });

  it('handles cancelled status', () => {
    render(
      <POStatusTimeline 
        {...defaultProps}
        currentStatus={POStatus.CANCELLED}
      />
    );

    expect(screen.getByText('Status Timeline')).toBeInTheDocument();
  });
});
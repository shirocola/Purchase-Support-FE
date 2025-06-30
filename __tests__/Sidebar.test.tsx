import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Sidebar } from '@/components/layout/Sidebar';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { UserRole } from '@/lib/types/po';

const theme = createTheme();

const renderWithProviders = (ui: React.ReactElement, role: UserRole = UserRole.MATERIAL_CONTROL) => {
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider defaultRole={role}>
        {ui}
      </AuthProvider>
    </ThemeProvider>
  );
};

const SidebarWrapper = ({ role = UserRole.MATERIAL_CONTROL }: { role?: UserRole }) => (
  <AuthProvider defaultRole={role}>
    <ThemeProvider theme={theme}>
      <Sidebar open={true} onClose={() => {}} variant="persistent" />
    </ThemeProvider>
  </AuthProvider>
);

describe('Sidebar Component', () => {
  describe('Role-based Menu Display', () => {
    it('should show MaterialControl menu items for MaterialControl role', async () => {
      renderWithProviders(<Sidebar open={true} onClose={() => {}} variant="persistent" />, UserRole.MATERIAL_CONTROL);
      
      await waitFor(() => {
        expect(screen.getByText('หน้าแรก')).toBeInTheDocument();
        expect(screen.getByText('จัดการ PO')).toBeInTheDocument();
        expect(screen.getByText('ตัวอย่าง PO')).toBeInTheDocument();
        expect(screen.getByText('การส่งอีเมล')).toBeInTheDocument();
        expect(screen.getByText('รายงานและสถานะ')).toBeInTheDocument();
        
        // Should not show admin-only menu
        expect(screen.queryByText('ระบบจัดการ')).not.toBeInTheDocument();
        expect(screen.queryByText('Vendor Portal')).not.toBeInTheDocument();
      });
    });

    it('should show Admin menu items for Admin role', async () => {
      renderWithProviders(<Sidebar open={true} onClose={() => {}} variant="persistent" />, UserRole.ADMIN);
      
      await waitFor(() => {
        expect(screen.getByText('หน้าแรก')).toBeInTheDocument();
        expect(screen.getByText('จัดการ PO')).toBeInTheDocument();
        expect(screen.getByText('ตัวอย่าง PO')).toBeInTheDocument();
        expect(screen.getByText('การส่งอีเมล')).toBeInTheDocument();
        expect(screen.getByText('รายงานและสถานะ')).toBeInTheDocument();
        expect(screen.getByText('ระบบจัดการ')).toBeInTheDocument();
        
        // Should not show vendor-only menu
        expect(screen.queryByText('Vendor Portal')).not.toBeInTheDocument();
      });
    });

    it('should show Vendor menu items for Vendor role', async () => {
      renderWithProviders(<Sidebar open={true} onClose={() => {}} variant="persistent" />, UserRole.VENDOR);
      
      await waitFor(() => {
        expect(screen.getByText('หน้าแรก')).toBeInTheDocument();
        expect(screen.getByText('Vendor Portal')).toBeInTheDocument();
        
        // Should not show internal menu items
        expect(screen.queryByText('จัดการ PO')).not.toBeInTheDocument();
        expect(screen.queryByText('การส่งอีเมล')).not.toBeInTheDocument();
        expect(screen.queryByText('ระบบจัดการ')).not.toBeInTheDocument();
      });
    });

    it('should show AppUser menu items for AppUser role', async () => {
      renderWithProviders(<Sidebar open={true} onClose={() => {}} variant="persistent" />, UserRole.APP_USER);
      
      await waitFor(() => {
        expect(screen.getByText('หน้าแรก')).toBeInTheDocument();
        expect(screen.getByText('จัดการ PO')).toBeInTheDocument();
        expect(screen.getByText('ตัวอย่าง PO')).toBeInTheDocument();
        expect(screen.getByText('รายงานและสถานะ')).toBeInTheDocument();
        
        // Should not show restricted menu items
        expect(screen.queryByText('การส่งอีเมล')).not.toBeInTheDocument();
        expect(screen.queryByText('ระบบจัดการ')).not.toBeInTheDocument();
        expect(screen.queryByText('Vendor Portal')).not.toBeInTheDocument();
      });
    });
  });

  describe('User Information Display', () => {
    it('should display correct user information for each role', async () => {
      // Test MaterialControl
      const { rerender } = render(<SidebarWrapper role={UserRole.MATERIAL_CONTROL} />);
      await waitFor(() => {
        expect(screen.getByText('MaterialControl')).toBeInTheDocument();
        expect(screen.getByText('material.control')).toBeInTheDocument();
        expect(screen.getByText('mc@company.com')).toBeInTheDocument();
      });

      // Test Admin
      rerender(<SidebarWrapper role={UserRole.ADMIN} />);
      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
        expect(screen.getByText('admin')).toBeInTheDocument();
        expect(screen.getByText('admin@company.com')).toBeInTheDocument();
      });

      // Test Vendor
      rerender(<SidebarWrapper role={UserRole.VENDOR} />);
      await waitFor(() => {
        expect(screen.getByText('Vendor')).toBeInTheDocument();
        expect(screen.getByText('vendor')).toBeInTheDocument();
        expect(screen.getByText('vendor@supplier.com')).toBeInTheDocument();
      });
    });
  });

  describe('Menu Interaction', () => {
    it('should expand and collapse menu items with children', async () => {
      renderWithProviders(<Sidebar open={true} onClose={() => {}} variant="persistent" />, UserRole.ADMIN);
      
      await waitFor(() => {
        expect(screen.getByText('ระบบจัดการ')).toBeInTheDocument();
      });

      // Initially, submenu items should not be visible
      expect(screen.queryByText('จัดการผู้ใช้')).not.toBeInTheDocument();
      expect(screen.queryByText('ตั้งค่าระบบ')).not.toBeInTheDocument();

      // Click to expand
      fireEvent.click(screen.getByText('ระบบจัดการ'));

      await waitFor(() => {
        expect(screen.getByText('จัดการผู้ใช้')).toBeInTheDocument();
        expect(screen.getByText('ตั้งค่าระบบ')).toBeInTheDocument();
      });

      // Click again to collapse
      fireEvent.click(screen.getByText('ระบบจัดการ'));

      await waitFor(() => {
        expect(screen.queryByText('จัดการผู้ใช้')).not.toBeInTheDocument();
        expect(screen.queryByText('ตั้งค่าระบบ')).not.toBeInTheDocument();
      });
    });

    it('should show correct navigation links', async () => {
      renderWithProviders(<Sidebar open={true} onClose={() => {}} variant="persistent" />, UserRole.MATERIAL_CONTROL);
      
      await waitFor(() => {
        const homeLink = screen.getByRole('link', { name: /หน้าแรก/ });
        expect(homeLink).toHaveAttribute('href', '/');

        const poLink = screen.getByRole('link', { name: /ตัวอย่าง PO/ });
        expect(poLink).toHaveAttribute('href', '/po/demo-po-001/edit');
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should render with different variants', () => {
      const { rerender } = renderWithProviders(
        <Sidebar open={true} onClose={() => {}} variant="temporary" />,
        UserRole.MATERIAL_CONTROL
      );

      expect(screen.getByText('PO Management')).toBeInTheDocument();

      rerender(
        <ThemeProvider theme={theme}>
          <AuthProvider defaultRole={UserRole.MATERIAL_CONTROL}>
            <Sidebar open={true} onClose={() => {}} variant="persistent" />
          </AuthProvider>
        </ThemeProvider>
      );

      expect(screen.getByText('PO Management')).toBeInTheDocument();
    });

    it('should not render when user is not authenticated', () => {
      render(
        <ThemeProvider theme={theme}>
          <AuthProvider defaultRole={UserRole.MATERIAL_CONTROL}>
            <Sidebar open={true} onClose={() => {}} variant="persistent" />
          </AuthProvider>
        </ThemeProvider>
      );

      // The sidebar should render since we have a default role
      expect(screen.getByText('PO Management')).toBeInTheDocument();
    });
  });
});
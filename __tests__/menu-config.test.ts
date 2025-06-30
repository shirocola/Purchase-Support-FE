import { 
  getMenuItemsForRole, 
  isMenuItemAccessible, 
  getBreadcrumbPath,
  menuConfig 
} from '@/config/menu-config';
import { UserRole } from '@/lib/types/po';

describe('Menu Configuration', () => {
  describe('getMenuItemsForRole', () => {
    it('should return correct menu items for Admin role', () => {
      const adminMenuItems = getMenuItemsForRole(UserRole.ADMIN);
      
      const menuTitles = adminMenuItems.map(item => item.title);
      expect(menuTitles).toContain('หน้าแรก');
      expect(menuTitles).toContain('จัดการ PO');
      expect(menuTitles).toContain('ตัวอย่าง PO');
      expect(menuTitles).toContain('การส่งอีเมล');
      expect(menuTitles).toContain('รายงานและสถานะ');
      expect(menuTitles).toContain('ระบบจัดการ');
      
      // Admin should not see vendor-only items
      expect(menuTitles).not.toContain('Vendor Portal');
    });

    it('should return correct menu items for MaterialControl role', () => {
      const mcMenuItems = getMenuItemsForRole(UserRole.MATERIAL_CONTROL);
      
      const menuTitles = mcMenuItems.map(item => item.title);
      expect(menuTitles).toContain('หน้าแรก');
      expect(menuTitles).toContain('จัดการ PO');
      expect(menuTitles).toContain('ตัวอย่าง PO');
      expect(menuTitles).toContain('การส่งอีเมล');
      expect(menuTitles).toContain('รายงานและสถานะ');
      
      // MaterialControl should not see admin or vendor items
      expect(menuTitles).not.toContain('ระบบจัดการ');
      expect(menuTitles).not.toContain('Vendor Portal');
    });

    it('should return correct menu items for AppUser role', () => {
      const appUserMenuItems = getMenuItemsForRole(UserRole.APP_USER);
      
      const menuTitles = appUserMenuItems.map(item => item.title);
      expect(menuTitles).toContain('หน้าแรก');
      expect(menuTitles).toContain('จัดการ PO');
      expect(menuTitles).toContain('ตัวอย่าง PO');
      expect(menuTitles).toContain('รายงานและสถานะ');
      
      // AppUser should not see email management, admin, or vendor items
      expect(menuTitles).not.toContain('การส่งอีเมล');
      expect(menuTitles).not.toContain('ระบบจัดการ');
      expect(menuTitles).not.toContain('Vendor Portal');
    });

    it('should return correct menu items for Vendor role', () => {
      const vendorMenuItems = getMenuItemsForRole(UserRole.VENDOR);
      
      const menuTitles = vendorMenuItems.map(item => item.title);
      expect(menuTitles).toContain('หน้าแรก');
      expect(menuTitles).toContain('Vendor Portal');
      
      // Vendor should only see limited items
      expect(menuTitles).not.toContain('จัดการ PO');
      expect(menuTitles).not.toContain('การส่งอีเมล');
      expect(menuTitles).not.toContain('รายงานและสถานะ');
      expect(menuTitles).not.toContain('ระบบจัดการ');
    });
  });

  describe('Submenu filtering', () => {
    it('should include submenu items that user has access to', () => {
      const adminMenuItems = getMenuItemsForRole(UserRole.ADMIN);
      const systemManagementMenu = adminMenuItems.find(item => item.title === 'ระบบจัดการ');
      
      expect(systemManagementMenu).toBeDefined();
      expect(systemManagementMenu?.children).toBeDefined();
      expect(systemManagementMenu?.children?.length).toBeGreaterThan(0);
      
      const submenuTitles = systemManagementMenu?.children?.map(child => child.title) || [];
      expect(submenuTitles).toContain('จัดการผู้ใช้');
      expect(submenuTitles).toContain('ตั้งค่าระบบ');
    });

    it('should filter out submenu items user does not have access to', () => {
      const appUserMenuItems = getMenuItemsForRole(UserRole.APP_USER);
      const reportMenu = appUserMenuItems.find(item => item.title === 'รายงานและสถานะ');
      
      expect(reportMenu).toBeDefined();
      expect(reportMenu?.children).toBeDefined();
      
      const submenuTitles = reportMenu?.children?.map(child => child.title) || [];
      expect(submenuTitles).toContain('Timeline สถานะ');
      
      // AppUser should not see Audit Log
      expect(submenuTitles).not.toContain('Audit Log');
    });

    it('should remove parent items when no children are accessible', () => {
      const vendorMenuItems = getMenuItemsForRole(UserRole.VENDOR);
      
      // Vendor should not see any internal management menus
      const menuTitles = vendorMenuItems.map(item => item.title);
      expect(menuTitles).not.toContain('จัดการ PO');
      expect(menuTitles).not.toContain('การส่งอีเมล');
      expect(menuTitles).not.toContain('รายงานและสถานะ');
      expect(menuTitles).not.toContain('ระบบจัดการ');
    });
  });

  describe('isMenuItemAccessible', () => {
    it('should return true for accessible menu items', () => {
      const homeMenuItem = menuConfig.find(item => item.title === 'หน้าแรก')!;
      
      expect(isMenuItemAccessible(homeMenuItem, UserRole.ADMIN)).toBe(true);
      expect(isMenuItemAccessible(homeMenuItem, UserRole.MATERIAL_CONTROL)).toBe(true);
      expect(isMenuItemAccessible(homeMenuItem, UserRole.APP_USER)).toBe(true);
      expect(isMenuItemAccessible(homeMenuItem, UserRole.VENDOR)).toBe(true);
    });

    it('should return false for inaccessible menu items', () => {
      const adminMenuItem = menuConfig.find(item => item.title === 'ระบบจัดการ')!;
      
      expect(isMenuItemAccessible(adminMenuItem, UserRole.ADMIN)).toBe(true);
      expect(isMenuItemAccessible(adminMenuItem, UserRole.MATERIAL_CONTROL)).toBe(false);
      expect(isMenuItemAccessible(adminMenuItem, UserRole.APP_USER)).toBe(false);
      expect(isMenuItemAccessible(adminMenuItem, UserRole.VENDOR)).toBe(false);
    });

    it('should handle vendor-specific menu items', () => {
      const vendorMenuItem = menuConfig.find(item => item.title === 'Vendor Portal')!;
      
      expect(isMenuItemAccessible(vendorMenuItem, UserRole.VENDOR)).toBe(true);
      expect(isMenuItemAccessible(vendorMenuItem, UserRole.ADMIN)).toBe(false);
      expect(isMenuItemAccessible(vendorMenuItem, UserRole.MATERIAL_CONTROL)).toBe(false);
      expect(isMenuItemAccessible(vendorMenuItem, UserRole.APP_USER)).toBe(false);
    });
  });

  describe('getBreadcrumbPath', () => {
    it('should return correct breadcrumb for top-level pages', () => {
      const breadcrumb = getBreadcrumbPath('/', UserRole.ADMIN);
      
      expect(breadcrumb).toHaveLength(1);
      expect(breadcrumb[0].title).toBe('หน้าแรก');
      expect(breadcrumb[0].path).toBe('/');
    });

    it('should return correct breadcrumb for nested pages', () => {
      const breadcrumb = getBreadcrumbPath('/admin/users', UserRole.ADMIN);
      
      expect(breadcrumb).toHaveLength(2);
      expect(breadcrumb[0].title).toBe('ระบบจัดการ');
      expect(breadcrumb[1].title).toBe('จัดการผู้ใช้');
      expect(breadcrumb[1].path).toBe('/admin/users');
    });

    it('should return empty array for inaccessible pages', () => {
      const breadcrumb = getBreadcrumbPath('/admin/users', UserRole.VENDOR);
      
      expect(breadcrumb).toHaveLength(0);
    });

    it('should handle email management pages', () => {
      const breadcrumb = getBreadcrumbPath('/po/demo-po-001/send-email', UserRole.MATERIAL_CONTROL);
      
      expect(breadcrumb).toHaveLength(2);
      expect(breadcrumb[0].title).toBe('การส่งอีเมล');
      expect(breadcrumb[1].title).toBe('ส่งอีเมล PO');
    });
  });

  describe('Menu structure validation', () => {
    it('should have valid menu structure', () => {
      expect(menuConfig).toBeDefined();
      expect(Array.isArray(menuConfig)).toBe(true);
      expect(menuConfig.length).toBeGreaterThan(0);
      
      menuConfig.forEach(item => {
        expect(item.id).toBeDefined();
        expect(item.title).toBeDefined();
        expect(item.icon).toBeDefined();
        expect(item.path).toBeDefined();
        expect(Array.isArray(item.roles)).toBe(true);
        expect(item.roles.length).toBeGreaterThan(0);
      });
    });

    it('should have unique menu item IDs', () => {
      const allIds: string[] = [];
      
      const collectIds = (items: typeof menuConfig) => {
        items.forEach(item => {
          allIds.push(item.id);
          if (item.children) {
            collectIds(item.children);
          }
        });
      };
      
      collectIds(menuConfig);
      
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });

    it('should have valid role assignments', () => {
      const validRoles = Object.values(UserRole);
      
      const checkRoles = (items: typeof menuConfig) => {
        items.forEach(item => {
          item.roles.forEach(role => {
            expect(validRoles).toContain(role);
          });
          
          if (item.children) {
            checkRoles(item.children);
          }
        });
      };
      
      checkRoles(menuConfig);
    });
  });
});
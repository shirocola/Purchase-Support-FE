import { 
  Home,
  ShoppingCart,
  Assignment,
  Email,
  Assessment,
  Settings,
  AccountCircle,
  Receipt,
  Timeline,
  CheckCircle,
} from '@mui/icons-material';
import { UserRole } from '@/lib/types/po';

export interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType;
  path: string;
  roles: UserRole[];
  children?: MenuItem[];
  description?: string;
}

/**
 * Menu configuration mapping roles to accessible menu items
 * Items are only shown if user has the required role
 */
export const menuConfig: MenuItem[] = [
  {
    id: 'home',
    title: 'หน้าแรก',
    icon: Home,
    path: '/',
    roles: [UserRole.ADMIN, UserRole.MATERIAL_CONTROL, UserRole.APP_USER, UserRole.VENDOR],
    description: 'หน้าหลักของระบบ',
  },
  {
    id: 'po-management',
    title: 'จัดการ PO',
    icon: ShoppingCart,
    path: '/po',
    roles: [UserRole.ADMIN, UserRole.MATERIAL_CONTROL, UserRole.APP_USER],
    description: 'จัดการใบสั่งซื้อทั้งหมด',
    children: [
      {
        id: 'po-list',
        title: 'รายการ PO',
        icon: Assignment,
        path: '/po/list',
        roles: [UserRole.ADMIN, UserRole.MATERIAL_CONTROL, UserRole.APP_USER],
        description: 'ดูรายการ PO ทั้งหมด',
      },
      {
        id: 'po-create',
        title: 'สร้าง PO ใหม่',
        icon: ShoppingCart,
        path: '/po/create',
        roles: [UserRole.ADMIN, UserRole.MATERIAL_CONTROL],
        description: 'สร้างใบสั่งซื้อใหม่',
      },
    ],
  },
  {
    id: 'po-demo',
    title: 'ตัวอย่าง PO',
    icon: Receipt,
    path: '/po/demo-po-001/edit',
    roles: [UserRole.ADMIN, UserRole.MATERIAL_CONTROL, UserRole.APP_USER],
    description: 'ดูตัวอย่างการแก้ไข PO',
  },
  {
    id: 'email-management',
    title: 'การส่งอีเมล',
    icon: Email,
    path: '/email',
    roles: [UserRole.ADMIN, UserRole.MATERIAL_CONTROL],
    description: 'จัดการการส่งอีเมล PO',
    children: [
      {
        id: 'email-send',
        title: 'ส่งอีเมล PO',
        icon: Email,
        path: '/po/demo-po-001/send-email',
        roles: [UserRole.ADMIN, UserRole.MATERIAL_CONTROL],
        description: 'ส่งอีเมล PO ให้ vendor',
      },
      {
        id: 'email-tracking',
        title: 'ติดตาม Vendor',
        icon: CheckCircle,
        path: '/po/demo-po-001/acknowledge-status',
        roles: [UserRole.ADMIN, UserRole.MATERIAL_CONTROL],
        description: 'ติดตามการยืนยันจาก vendor',
      },
    ],
  },
  {
    id: 'reports',
    title: 'รายงานและสถานะ',
    icon: Assessment,
    path: '/reports',
    roles: [UserRole.ADMIN, UserRole.MATERIAL_CONTROL, UserRole.APP_USER],
    description: 'ดูรายงานและสถานะต่างๆ',
    children: [
      {
        id: 'status-timeline',
        title: 'Timeline สถานะ',
        icon: Timeline,
        path: '/components-showcase',
        roles: [UserRole.ADMIN, UserRole.MATERIAL_CONTROL, UserRole.APP_USER],
        description: 'ดูการเปลี่ยนแปลงสถานะ PO',
      },
      {
        id: 'audit-log',
        title: 'Audit Log',
        icon: Assignment,
        path: '/components-showcase',
        roles: [UserRole.ADMIN, UserRole.MATERIAL_CONTROL],
        description: 'ดูประวัติการเปลี่ยนแปลงข้อมูล',
      },
    ],
  },
  {
    id: 'vendor-portal',
    title: 'Vendor Portal',
    icon: AccountCircle,
    path: '/vendor',
    roles: [UserRole.VENDOR],
    description: 'พอร์ทัลสำหรับ vendor',
    children: [
      {
        id: 'vendor-po',
        title: 'PO ที่ได้รับ',
        icon: Receipt,
        path: '/vendor/po',
        roles: [UserRole.VENDOR],
        description: 'ดู PO ที่ได้รับ',
      },
      {
        id: 'vendor-acknowledge',
        title: 'ยืนยันการรับ PO',
        icon: CheckCircle,
        path: '/vendor/acknowledge',
        roles: [UserRole.VENDOR],
        description: 'ยืนยันการรับ PO',
      },
    ],
  },
  {
    id: 'admin',
    title: 'ระบบจัดการ',
    icon: Settings,
    path: '/admin',
    roles: [UserRole.ADMIN],
    description: 'จัดการระบบ (Admin เท่านั้น)',
    children: [
      {
        id: 'user-management',
        title: 'จัดการผู้ใช้',
        icon: AccountCircle,
        path: '/admin/users',
        roles: [UserRole.ADMIN],
        description: 'จัดการบัญชีผู้ใช้',
      },
      {
        id: 'system-settings',
        title: 'ตั้งค่าระบบ',
        icon: Settings,
        path: '/admin/settings',
        roles: [UserRole.ADMIN],
        description: 'ตั้งค่าระบบต่างๆ',
      },
    ],
  },
];

/**
 * Get menu items that the user role can access
 */
export function getMenuItemsForRole(role: UserRole): MenuItem[] {
  return filterMenuItemsByRole(menuConfig, role);
}

/**
 * Recursively filter menu items based on user role
 */
function filterMenuItemsByRole(items: MenuItem[], role: UserRole): MenuItem[] {
  return items
    .filter(item => item.roles.includes(role))
    .map(item => ({
      ...item,
      children: item.children ? filterMenuItemsByRole(item.children, role) : undefined,
    }))
    .filter(item => !item.children || item.children.length > 0); // Remove parent items with no accessible children
}

/**
 * Check if a menu item is accessible by the user role
 */
export function isMenuItemAccessible(menuItem: MenuItem, role: UserRole): boolean {
  return menuItem.roles.includes(role);
}

/**
 * Get breadcrumb path for a given route
 */
export function getBreadcrumbPath(path: string, role: UserRole): MenuItem[] {
  const accessibleItems = getMenuItemsForRole(role);
  return findBreadcrumbPath(accessibleItems, path) || [];
}

function findBreadcrumbPath(items: MenuItem[], targetPath: string, currentPath: MenuItem[] = []): MenuItem[] | null {
  for (const item of items) {
    const newPath = [...currentPath, item];
    
    if (item.path === targetPath) {
      return newPath;
    }
    
    if (item.children) {
      const childPath = findBreadcrumbPath(item.children, targetPath, newPath);
      if (childPath) {
        return childPath;
      }
    }
  }
  
  return null;
}
import { UserRole } from '@/lib/types/po';

export interface MenuItem {
  id: string;
  title: string;
  icon: string;
  path?: string;
  roles: UserRole[];
  children?: MenuItem[];
}

export const menuConfig: MenuItem[] = [
  {
    id: 'po-list',
    title: 'รายการใบสั่งซื้อ',
    icon: 'ListAlt',
    path: '/po/list',
    roles: [UserRole.APP_USER, UserRole.MATERIAL_CONTROL]
  },
  {
    id: 'po-material',
    title: 'จัดการวัสดุ',
    icon: 'Inventory',
    path: '/po/material',
    roles: [UserRole.MATERIAL_CONTROL]
  }
];

export function getMenuForRole(role: UserRole): MenuItem[] {
  return menuConfig.filter(item => item.roles.includes(role));
}
// Role-based routing utilities
import { UserRole } from '@/lib/types/po';

/**
 * Get the default route for a user role after successful login
 */
export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case UserRole.APP_USER:
      return '/po/list'; // AppUser goes to PO List
    
    case UserRole.MATERIAL_CONTROL:
      return '/po/material'; // MaterialControl goes to Material Management
    
    case UserRole.ADMIN:
      return '/'; // Admin goes to dashboard/home
    
    case UserRole.VENDOR:
      return '/vendor/portal'; // Vendor goes to their portal (if exists)
    
    default:
      return '/'; // Fallback to home
  }
}

/**
 * Check if user role can access a specific route
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Define role-based route permissions
  const routePermissions: Record<string, UserRole[]> = {
    '/po/list': [UserRole.APP_USER, UserRole.ADMIN], // Only AppUser and Admin can access PO List
    '/po/material': [UserRole.MATERIAL_CONTROL, UserRole.ADMIN], // Only MaterialControl and Admin can access Material Management
    '/po/[id]/edit': [UserRole.MATERIAL_CONTROL, UserRole.ADMIN], // Only MaterialControl and Admin can edit PO
    '/po/[id]/send-email': [UserRole.MATERIAL_CONTROL, UserRole.ADMIN], // Only MaterialControl and Admin can send email
    '/po/[id]/acknowledge-status': [UserRole.MATERIAL_CONTROL, UserRole.ADMIN], // Only MaterialControl and Admin can view acknowledge status
    '/components-showcase': [UserRole.ADMIN], // Only Admin can access component showcase
    '/vendor/portal': [UserRole.VENDOR, UserRole.ADMIN], // Only Vendor and Admin can access vendor portal
    '/': [UserRole.APP_USER, UserRole.MATERIAL_CONTROL, UserRole.ADMIN, UserRole.VENDOR], // Everyone can access home
  };

  // Check direct route match
  if (routePermissions[route]) {
    return routePermissions[route].includes(userRole);
  }

  // Check pattern matches for dynamic routes
  for (const [pattern, allowedRoles] of Object.entries(routePermissions)) {
    if (pattern.includes('[id]')) {
      const regex = new RegExp(pattern.replace(/\[id\]/g, '[^/]+'));
      if (regex.test(route)) {
        return allowedRoles.includes(userRole);
      }
    }
  }

  // Default: Admin can access everything, others need explicit permission
  return userRole === UserRole.ADMIN;
}

/**
 * Get accessible menu items for a user role
 */
export function getAccessibleMenuItems(userRole: UserRole) {
  const allMenuItems = [
    { path: '/', label: 'หน้าแรก', icon: 'home' },
    { path: '/po/list', label: 'รายการ PO', icon: 'list' },
    { path: '/po/material', label: 'จัดการวัสดุ', icon: 'inventory' },
    { path: '/components-showcase', label: 'Component Showcase', icon: 'dashboard' },
    { path: '/vendor/portal', label: 'Vendor Portal', icon: 'business' },
  ];

  return allMenuItems.filter(item => canAccessRoute(userRole, item.path));
}

/**
 * Redirect user to appropriate page based on their role and current route access
 */
export function getRedirectRoute(userRole: UserRole, currentRoute: string): string | null {
  // If user can access current route, no redirect needed
  if (canAccessRoute(userRole, currentRoute)) {
    return null;
  }

  // Otherwise, redirect to their default route
  return getDefaultRouteForRole(userRole);
}

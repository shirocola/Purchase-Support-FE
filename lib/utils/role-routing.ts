import { UserRole } from '@/lib/types/po';

/**
 * Get default route for user role after login
 */
export function getDefaultRouteForRole(role: string): string {
  console.log(`🔍 [ROUTE] getDefaultRouteForRole called with: "${role}" (type: ${typeof role})`);
  
  // Normalize role string
  const normalizedRole = role?.trim();
  console.log(`🔍 [ROUTE] Normalized role: "${normalizedRole}"`);
  
  switch (normalizedRole) {
    case 'AppUser':
    case UserRole.APP_USER:
      console.log(`✅ [ROUTE] AppUser detected → /po/list`);
      return '/po/list';
    
    case 'MaterialControl':
    case UserRole.MATERIAL_CONTROL:
      console.log(`✅ [ROUTE] MaterialControl detected → /po/material`);
      return '/po/material';
    
    default:
      console.warn(`❌ [ROUTE] Unknown role for routing: "${role}"`);
      return '/auth/unauthorized';
  }
}

/**
 * Check if user has valid role (เฉพาะ 2 roles ที่อนุญาต)
 */
export function isValidRole(role: string): boolean {
  console.log(`🔍 [VALIDATION] isValidRole called with: "${role}" (type: ${typeof role})`);
  
  const allowedRoles = ['AppUser', 'MaterialControl'];
  const normalizedRole = role?.trim();
  const isValid = allowedRoles.includes(normalizedRole);
  
  console.log(`🔍 [VALIDATION] Allowed roles:`, allowedRoles);
  console.log(`🔍 [VALIDATION] Normalized role: "${normalizedRole}"`);
  console.log(`🔍 [VALIDATION] Is valid: ${isValid}`);
  
  return isValid;
}

/**
 * Map backend roles to primary role for the system
 * เฉพาะ AppUser และ MaterialControl เท่านั้น
 */
export function mapRolesToPrimaryRole(roles: string[]): string | null {
  console.log(`🔍 [ROLE_MAPPING] mapRolesToPrimaryRole called with:`, roles);
  
  // เช็คเฉพาะ 2 roles ที่อนุญาต เท่านั้น
  // AppUser ก่อน (principle of least privilege)
  if (roles.includes('AppUser')) {
    console.log(`✅ [ROLE_MAPPING] Found AppUser role → AppUser`);
    return 'AppUser';
  }
  
  if (roles.includes('MaterialControl')) {
    console.log(`✅ [ROLE_MAPPING] Found MaterialControl role → MaterialControl`);
    return 'MaterialControl';
  }
  
  // ไม่มี role ที่อนุญาต
  console.warn(`❌ [ROLE_MAPPING] No valid role found in:`, roles);
  console.warn(`❌ [ROLE_MAPPING] Only 'AppUser' and 'MaterialControl' are allowed`);
  return null;
}

/**
 * Check if user can access specific route
 */
export function canAccessRoute(userRole: string, route: string): boolean {
  const routePermissions: Record<string, string[]> = {
    '/po/list': ['AppUser', 'MaterialControl'],
    '/po/material': ['MaterialControl'],
    '/po/[id]/edit': ['AppUser', 'MaterialControl'],
    '/po/[id]/send-email': ['MaterialControl'],
    '/po/[id]/acknowledge-status': ['MaterialControl'],
  };
  
  const allowedRoles = routePermissions[route];
  return allowedRoles ? allowedRoles.includes(userRole?.trim()) : false;
}
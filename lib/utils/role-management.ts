/**
 * Single source of truth for role management
 * Consolidates logic from auth-context, role-routing, and RoleGuard
 */

export const ALLOWED_ROLES = ['AppUser', 'MaterialControl'] as const;
export type AllowedRole = typeof ALLOWED_ROLES[number];

export class RoleManager {
  /**
   * Check if role is valid
   */
  static isValidRole(role: string): role is AllowedRole {
    return ALLOWED_ROLES.includes(role as AllowedRole);
  }

  /**
   * Map backend roles array to primary role
   */
  static mapRolesToPrimaryRole(roles: string[]): AllowedRole | null {
    // AppUser first (principle of least privilege)
    for (const allowedRole of ALLOWED_ROLES) {
      if (roles.includes(allowedRole)) {
        return allowedRole;
      }
    }
    return null;
  }

  /**
   * Get default route for role
   */
  static getDefaultRouteForRole(role: string): string {
    switch (role?.trim()) {
      case 'AppUser':
        return '/po/list';
      case 'MaterialControl':
        return '/po/material';
      default:
        return '/auth/unauthorized';
    }
  }

  /**
   * Check route access permission
   */
  static canAccessRoute(userRole: string, route: string): boolean {
    const routePermissions: Record<string, AllowedRole[]> = {
      '/po/list': ['AppUser', 'MaterialControl'],
      '/po/material': ['MaterialControl'],
      '/po/[id]/edit': ['AppUser', 'MaterialControl'],
      '/po/[id]/send-email': ['MaterialControl'],
      '/po/[id]/acknowledge-status': ['MaterialControl'],
    };
    
    const allowedRoles = routePermissions[route];
    return allowedRoles ? allowedRoles.includes(userRole?.trim() as AllowedRole) : false;
  }
}
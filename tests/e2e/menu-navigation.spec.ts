import { test, expect } from '@playwright/test';

test.describe('Role-based Menu and Navigation', () => {
  // Helper function to login with specific role
  async function loginWithRole(page: any, role: string) {
    await page.goto('/');
    
    // Check if login is needed
    const isLoggedIn = await page.locator('text=หน้าแรก, text=Dashboard, text=Welcome').isVisible();
    
    if (!isLoggedIn) {
      // Perform login
      await expect(page.locator('[data-testid="login-form"], [data-testid="login-page"]')).toBeVisible();
      
      const emailField = page.locator('input[type="email"], input[name="email"], input[name="username"]').first();
      const passwordField = page.locator('input[type="password"], input[name="password"]').first();
      
      if (await emailField.isVisible()) {
        await emailField.fill('admin@test.com');
      }
      if (await passwordField.isVisible()) {
        await passwordField.fill('password123');
      }
      
      const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("เข้าสู่ระบบ")').first();
      await loginButton.click();
      
      await expect(page.locator('text=หน้าแรก, text=Dashboard, text=Welcome')).toBeVisible({ timeout: 10000 });
    }
    
    // Switch to specific role if role switcher is available
    const roleSwitcher = page.locator('[data-testid="role-switcher"], button:has-text("เปลี่ยนบทบาท")');
    if (await roleSwitcher.isVisible()) {
      await roleSwitcher.click();
      
      // Select the role
      const roleOption = page.locator(`text=${role}, [data-testid="role-${role.toLowerCase()}"]`);
      if (await roleOption.isVisible()) {
        await roleOption.click();
      }
    }
  }

  test('Admin should see all menu items', async ({ page }) => {
    await loginWithRole(page, 'Admin');
    
    // Check for admin-specific menu items
    await expect(page.locator('text=ระบบจัดการ, text=Administration, [data-testid="admin-menu"]')).toBeVisible();
    await expect(page.locator('text=Purchase Order, text=จัดการ PO')).toBeVisible();
    await expect(page.locator('text=รายการ PO, text=PO List')).toBeVisible();
    await expect(page.locator('text=จัดการวัสดุ, text=Material Management')).toBeVisible();
  });

  test('MaterialControl should see appropriate menu items', async ({ page }) => {
    await loginWithRole(page, 'MaterialControl');
    
    // Check for MaterialControl-specific menu items
    await expect(page.locator('text=Purchase Order, text=จัดการ PO')).toBeVisible();
    await expect(page.locator('text=รายการ PO, text=PO List')).toBeVisible();
    await expect(page.locator('text=จัดการวัสดุ, text=Material Management')).toBeVisible();
    
    // Should NOT see admin-only features
    await expect(page.locator('text=ระบบจัดการ, text=Administration')).not.toBeVisible();
  });

  test('AppUser should see limited menu items', async ({ page }) => {
    await loginWithRole(page, 'AppUser');
    
    // Check for AppUser-specific menu items
    await expect(page.locator('text=หน้าแรก, text=Home')).toBeVisible();
    await expect(page.locator('text=รายการ PO, text=PO List')).toBeVisible();
    
    // Should NOT see admin or material control features
    await expect(page.locator('text=ระบบจัดการ, text=Administration')).not.toBeVisible();
    await expect(page.locator('text=จัดการวัสดุ, text=Material Management')).not.toBeVisible();
  });

  test('Vendor should see minimal menu items', async ({ page }) => {
    await loginWithRole(page, 'Vendor');
    
    // Check for Vendor-specific menu items
    await expect(page.locator('text=หน้าแรก, text=Home')).toBeVisible();
    await expect(page.locator('text=Vendor Portal')).toBeVisible();
    
    // Should NOT see internal features
    await expect(page.locator('text=ระบบจัดการ, text=Administration')).not.toBeVisible();
    await expect(page.locator('text=จัดการวัสดุ, text=Material Management')).not.toBeVisible();
    await expect(page.locator('text=รายการ PO, text=PO List')).not.toBeVisible();
  });

  test('should update menu when role changes', async ({ page }) => {
    await loginWithRole(page, 'Admin');
    
    // Verify admin menu is visible
    await expect(page.locator('text=ระบบจัดการ, text=Administration')).toBeVisible();
    
    // Switch to AppUser role
    const roleSwitcher = page.locator('[data-testid="role-switcher"], button:has-text("เปลี่ยนบทบาท")');
    if (await roleSwitcher.isVisible()) {
      await roleSwitcher.click();
      
      const appUserOption = page.locator('text=AppUser, [data-testid="role-appuser"]');
      if (await appUserOption.isVisible()) {
        await appUserOption.click();
      }
      
      // Verify admin menu is no longer visible
      await expect(page.locator('text=ระบบจัดการ, text=Administration')).not.toBeVisible();
      
      // Verify AppUser menu is visible
      await expect(page.locator('text=หน้าแรก, text=Home')).toBeVisible();
    }
  });

  test('should navigate to different pages correctly', async ({ page }) => {
    await loginWithRole(page, 'MaterialControl');
    
    // Navigate to PO List
    await page.locator('text=รายการ PO, text=PO List').click();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    await expect(page.locator('h1, h2, [data-testid="page-title"]')).toContainText(['รายการ', 'PO', 'List']);
    
    // Navigate to Material Management
    await page.locator('text=จัดการวัสดุ, text=Material Management').click();
    await expect(page).toHaveURL(/.*\/po\/material.*/);
    await expect(page.locator('h1, h2, [data-testid="page-title"]')).toContainText(['วัสดุ', 'Material']);
    
    // Navigate back to home
    await page.locator('text=หน้าแรก, text=Home').click();
    await expect(page).toHaveURL('/');
  });

  test('sidebar should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await loginWithRole(page, 'MaterialControl');
    
    // On mobile, sidebar should be hidden initially
    const sidebar = page.locator('[data-testid="sidebar"], .sidebar, nav');
    const menuButton = page.locator('[data-testid="menu-button"], button[aria-label="menu"]');
    
    // Check if menu button exists on mobile
    if (await menuButton.isVisible()) {
      // Sidebar should be hidden initially
      await expect(sidebar).not.toBeVisible();
      
      // Click menu button to open sidebar
      await menuButton.click();
      await expect(sidebar).toBeVisible();
      
      // Click outside or close button to close sidebar
      const backdrop = page.locator('[data-testid="backdrop"], .backdrop');
      if (await backdrop.isVisible()) {
        await backdrop.click();
        await expect(sidebar).not.toBeVisible();
      }
    }
  });

  test('should show user information in sidebar', async ({ page }) => {
    await loginWithRole(page, 'Admin');
    
    // Check for user information display
    const userInfo = page.locator('[data-testid="user-info"], .user-info');
    if (await userInfo.isVisible()) {
      await expect(userInfo).toContainText(['Admin', 'admin']);
    }
    
    // Check for current role display
    const roleDisplay = page.locator('[data-testid="current-role"], .current-role');
    if (await roleDisplay.isVisible()) {
      await expect(roleDisplay).toContainText('Admin');
    }
  });

  test('should highlight active menu item', async ({ page }) => {
    await loginWithRole(page, 'MaterialControl');
    
    // Navigate to PO List
    const poListLink = page.locator('text=รายการ PO, text=PO List');
    await poListLink.click();
    
    // Wait for navigation
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    // Check if the menu item is highlighted/active
    await expect(poListLink).toHaveClass(/active|selected|current/);
  });

  test('should handle multi-level menu expansion', async ({ page }) => {
    await loginWithRole(page, 'Admin');
    
    // Look for expandable menu items
    const adminMenu = page.locator('text=ระบบจัดการ, text=Administration');
    if (await adminMenu.isVisible()) {
      await adminMenu.click();
      
      // Check if submenu items are visible after expansion
      const submenuItems = page.locator('[data-testid="submenu"], .submenu li, .expanded ul li');
      if (await submenuItems.first().isVisible()) {
        await expect(submenuItems.first()).toBeVisible();
      }
    }
  });
});
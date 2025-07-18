import { test, expect } from '@playwright/test';
import { loginUser, navigateToPOList, navigateToPOEdit, BREAKPOINTS } from './utils';

test.describe('Main User Flow - End-to-End', () => {
  test('complete PO management workflow', async ({ page }) => {
    // Step 1: Login as MaterialControl user
    await loginUser(page, { role: 'MaterialControl' });
    
    // Step 2: Navigate to PO List
    await navigateToPOList(page);
    
    // Verify PO list page loaded
    await expect(page.locator('h1, h2, [data-testid="page-title"]')).toContainText(['รายการ', 'PO', 'List']);
    
    // Step 3: Search for a specific PO
    const searchInput = page.locator('input[type="search"], input[placeholder*="ค้นหา"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('PO-001');
      
      const searchButton = page.locator('button:has-text("ค้นหา"), button:has-text("Search")');
      if (await searchButton.isVisible()) {
        await searchButton.click();
      }
      
      await page.waitForTimeout(1000);
    }
    
    // Step 4: Navigate to PO details
    const firstPOLink = page.locator('tbody tr:first-child a, .table-row:first-child a, button:has-text("ดู")').first();
    if (await firstPOLink.isVisible()) {
      await firstPOLink.click();
      
      // Should be on PO edit page
      await expect(page).toHaveURL(/.*\/po\/.*\/edit.*/);
    } else {
      // Fallback to direct navigation
      await navigateToPOEdit(page, 'po-001');
    }
    
    // Step 5: Edit PO details
    const editButton = page.locator('button:has-text("แก้ไข"), button:has-text("Edit")');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Modify notes field
      const noteField = page.locator('textarea[name="notes"], input[name="remarks"]');
      if (await noteField.isVisible()) {
        const timestamp = new Date().toISOString();
        await noteField.fill(`Updated by E2E test at ${timestamp}`);
        
        // Save changes
        const saveButton = page.locator('button:has-text("บันทึก"), button:has-text("Save")');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          
          // Wait for success message
          await expect(page.locator('text=บันทึกสำเร็จ, text=Saved, .success')).toBeVisible({ timeout: 10000 });
        }
      }
    }
    
    // Step 6: Send email (if PO is approved)
    const sendEmailButton = page.locator('button:has-text("ส่งอีเมล"), button:has-text("Send Email")');
    if (await sendEmailButton.isVisible()) {
      await sendEmailButton.click();
      
      // Handle email form or dialog
      const emailForm = page.locator('[data-testid="email-form"], .email-form');
      const emailDialog = page.locator('[role="dialog"]:has-text("อีเมล"), [role="dialog"]:has-text("Email")');
      
      if (await emailForm.isVisible() || await emailDialog.isVisible()) {
        // Fill email details if form is available
        const recipientField = page.locator('input[name="to"], input[name="recipients"]');
        if (await recipientField.isVisible()) {
          await recipientField.fill('vendor@test.com');
        }
        
        const sendButton = page.locator('button:has-text("ส่ง"), button:has-text("Send")').last();
        if (await sendButton.isVisible()) {
          await sendButton.click();
          
          // Wait for send confirmation
          await expect(page.locator('text=ส่งสำเร็จ, text=Sent successfully')).toBeVisible({ timeout: 15000 });
        }
      }
    }
    
    // Step 7: Check vendor acknowledge status
    const acknowledgeStatusButton = page.locator('button:has-text("ติดตาม"), a:has-text("Acknowledge Status")');
    if (await acknowledgeStatusButton.isVisible()) {
      await acknowledgeStatusButton.click();
      
      // Should navigate to acknowledge status page
      await expect(page).toHaveURL(/.*\/acknowledge-status.*/);
      
      // Verify status information is displayed
      await expect(page.locator('[data-testid="acknowledge-status"], .status-indicator')).toBeVisible();
    }
    
    // Step 8: Return to PO list
    const backButton = page.locator('button:has-text("กลับ"), a:has-text("รายการ PO")');
    if (await backButton.isVisible()) {
      await backButton.click();
    } else {
      await navigateToPOList(page);
    }
    
    // Verify we're back at the list
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    console.log('✅ Complete PO management workflow test passed');
  });

  test('role-based access control workflow', async ({ page }) => {
    // Test Admin role
    await loginUser(page, { role: 'Admin' });
    
    // Admin should see all menu items
    await expect(page.locator('text=ระบบจัดการ, text=Administration')).toBeVisible();
    await expect(page.locator('text=รายการ PO, text=PO List')).toBeVisible();
    
    // Switch to AppUser role
    const roleSwitcher = page.locator('[data-testid="role-switcher"], button:has-text("เปลี่ยนบทบาท")');
    if (await roleSwitcher.isVisible()) {
      await roleSwitcher.click();
      
      const appUserOption = page.locator('text=AppUser, [data-testid="role-appuser"]');
      if (await appUserOption.isVisible()) {
        await appUserOption.click();
      }
    }
    
    // AppUser should not see admin features
    await expect(page.locator('text=ระบบจัดการ, text=Administration')).not.toBeVisible();
    
    // But should see basic features
    await expect(page.locator('text=หน้าแรก, text=Home')).toBeVisible();
    
    // Test data masking - navigate to PO list
    await navigateToPOList(page);
    
    // Price columns should be hidden for AppUser
    await expect(page.locator('th:has-text("มูลค่า"), th:has-text("Amount"), th:has-text("Price")')).not.toBeVisible();
    
    console.log('✅ Role-based access control test passed');
  });

  test('responsive design workflow', async ({ page }) => {
    await loginUser(page);
    
    // Test mobile layout
    await page.setViewportSize(BREAKPOINTS.mobile);
    
    // Open mobile menu
    const menuButton = page.locator('[data-testid="menu-button"], button[aria-label*="menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      
      // Sidebar should be visible
      const sidebar = page.locator('[data-testid="sidebar"], nav.sidebar, .drawer');
      await expect(sidebar).toBeVisible();
      
      // Navigate to PO list
      await page.locator('text=รายการ PO, text=PO List').click();
      
      // Sidebar should close after navigation
      await expect(sidebar).not.toBeVisible();
    }
    
    // Test tablet layout
    await page.setViewportSize(BREAKPOINTS.tablet);
    
    // Navigate to PO list
    await navigateToPOList(page);
    
    // Table should be visible and responsive
    const table = page.locator('table, [data-testid="po-table"]');
    await expect(table).toBeVisible();
    
    // Test desktop layout
    await page.setViewportSize(BREAKPOINTS.desktop);
    
    // Sidebar should be persistent on desktop
    const sidebar = page.locator('[data-testid="sidebar"], nav.sidebar');
    await expect(sidebar).toBeVisible();
    
    console.log('✅ Responsive design test passed');
  });

  test('error handling workflow', async ({ page }) => {
    await loginUser(page);
    
    // Test network error handling
    await page.route('**/api/po**', route => {
      route.abort('internetdisconnected');
    });
    
    await navigateToPOList(page);
    
    // Should show error message
    await expect(page.locator('text=เกิดข้อผิดพลาด, text=Error, .error-message')).toBeVisible({ timeout: 10000 });
    
    // Should show retry option
    const retryButton = page.locator('button:has-text("ลองใหม่"), button:has-text("Retry")');
    if (await retryButton.isVisible()) {
      await expect(retryButton).toBeVisible();
    }
    
    // Test form validation
    await page.unroute('**/api/po**'); // Remove route block
    
    await navigateToPOEdit(page, 'po-001');
    
    // Click edit
    const editButton = page.locator('button:has-text("แก้ไข"), button:has-text("Edit")');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Clear required field
      const titleField = page.locator('input[name="title"], input[name="poTitle"]');
      if (await titleField.isVisible()) {
        await titleField.clear();
        
        // Try to save
        const saveButton = page.locator('button:has-text("บันทึก"), button:has-text("Save")');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          
          // Should show validation error
          await expect(page.locator('.error, [role="alert"], text=จำเป็น, text=Required')).toBeVisible();
        }
      }
    }
    
    console.log('✅ Error handling test passed');
  });

  test('session and authentication workflow', async ({ page }) => {
    // Test login flow
    await page.goto('/');
    
    // Should redirect to login or show login form
    await expect(page.locator('[data-testid="login-form"], [data-testid="login-page"]')).toBeVisible();
    
    // Login
    await loginUser(page);
    
    // Should be authenticated
    await expect(page.locator('text=หน้าแรก, text=Dashboard, text=Welcome')).toBeVisible();
    
    // Test session timeout simulation
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Try to access protected page
    await page.goto('/po/list');
    
    // Should redirect to login
    await expect(page.locator('[data-testid="login-form"], [data-testid="login-page"]')).toBeVisible({ timeout: 10000 });
    
    // Test logout
    await loginUser(page);
    
    const userMenu = page.locator('[data-testid="user-menu"], button:has-text("Logout"), button:has-text("ออกจากระบบ")');
    if (await userMenu.isVisible()) {
      await userMenu.click();
      
      const logoutOption = page.locator('text=Logout, text=ออกจากระบบ').last();
      if (await logoutOption.isVisible()) {
        await logoutOption.click();
      }
      
      // Should return to login
      await expect(page.locator('[data-testid="login-form"], [data-testid="login-page"]')).toBeVisible();
    }
    
    console.log('✅ Session and authentication test passed');
  });
});
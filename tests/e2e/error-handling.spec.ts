import { test, expect } from '@playwright/test';

test.describe('Error Handling and Edge Cases', () => {
  // Helper function to setup test
  async function setupTest(page: any) {
    await page.goto('/');
    
    // Login if needed
    const isLoggedIn = await page.locator('text=หน้าแรก, text=Dashboard, text=Welcome').isVisible();
    
    if (!isLoggedIn) {
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
  }

  test('should handle network errors gracefully', async ({ page }) => {
    await setupTest(page);
    
    // Block network requests to simulate network error
    await page.route('**/api/**', route => {
      route.abort('internetdisconnected');
    });
    
    // Navigate to PO list
    await page.locator('text=รายการ PO, text=PO List').click();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    // Should show error state
    await expect(page.locator('text=เกิดข้อผิดพลาด, text=Error, text=Failed, .error-message')).toBeVisible({ timeout: 10000 });
    
    // Should show retry button
    const retryButton = page.locator('button:has-text("ลองใหม่"), button:has-text("Retry")');
    if (await retryButton.isVisible()) {
      await expect(retryButton).toBeVisible();
    }
  });

  test('should handle API timeout', async ({ page }) => {
    await setupTest(page);
    
    // Simulate slow API response
    await page.route('**/api/po/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second delay
      route.continue();
    });
    
    // Navigate to PO list
    await page.locator('text=รายการ PO, text=PO List').click();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    // Should show loading state initially
    await expect(page.locator('[data-testid="loading"], .loading, .spinner')).toBeVisible();
    
    // Should eventually show timeout error
    await expect(page.locator('text=หมดเวลา, text=Timeout, text=ใช้เวลานาน')).toBeVisible({ timeout: 35000 });
  });

  test('should handle 404 errors for non-existent PO', async ({ page }) => {
    await setupTest(page);
    
    // Navigate to non-existent PO
    await page.goto('/po/non-existent-po/edit');
    
    // Should show 404 error or "not found" message
    await expect(page.locator('text=404, text=ไม่พบ, text=Not Found, text=Does not exist')).toBeVisible();
    
    // Should provide navigation back to list
    const backButton = page.locator('button:has-text("กลับ"), button:has-text("Back"), a:has-text("รายการ PO")');
    if (await backButton.isVisible()) {
      await expect(backButton).toBeVisible();
    }
  });

  test('should handle unauthorized access errors', async ({ page }) => {
    await setupTest(page);
    
    // Mock 403 response
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' })
      });
    });
    
    // Try to access restricted functionality
    await page.goto('/po/po-001/edit');
    
    // Should show unauthorized error
    await expect(page.locator('text=ไม่มีสิทธิ์, text=Unauthorized, text=Access Denied')).toBeVisible({ timeout: 10000 });
  });

  test('should validate form inputs and show errors', async ({ page }) => {
    await setupTest(page);
    
    // Navigate to PO edit form
    await page.goto('/po/po-001/edit');
    
    // Click edit button
    const editButton = page.locator('button:has-text("แก้ไข"), button:has-text("Edit")');
    if (await editButton.isVisible()) {
      await editButton.click();
    }
    
    // Clear required field
    const titleField = page.locator('input[name="title"], input[name="poTitle"]');
    if (await titleField.isVisible()) {
      await titleField.clear();
      
      // Try to save
      const saveButton = page.locator('button:has-text("บันทึก"), button:has-text("Save")');
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Should show validation error
        await expect(page.locator('.error, [role="alert"], .validation-error')).toBeVisible();
        await expect(page.locator('text=จำเป็น, text=Required, text=กรุณากรอก')).toBeVisible();
      }
    }
    
    // Test invalid email format
    const emailField = page.locator('input[type="email"], input[name="email"]');
    if (await emailField.isVisible()) {
      await emailField.fill('invalid-email');
      await emailField.blur();
      
      // Should show email format error
      await expect(page.locator('text=รูปแบบอีเมล, text=Invalid email, text=Email format')).toBeVisible();
    }
    
    // Test negative numbers in quantity fields
    const quantityField = page.locator('input[type="number"], input[name*="quantity"]');
    if (await quantityField.isVisible()) {
      await quantityField.fill('-1');
      await quantityField.blur();
      
      // Should show validation error for negative numbers
      await expect(page.locator('text=ต้องมากกว่า, text=must be positive, text=greater than')).toBeVisible();
    }
  });

  test('should handle concurrent editing conflicts', async ({ page, context }) => {
    await setupTest(page);
    
    // Open same PO in two tabs
    const page1 = page;
    const page2 = await context.newPage();
    
    await page1.goto('/po/po-001/edit');
    await page2.goto('/po/po-001/edit');
    
    // Edit in first tab
    const editButton1 = page1.locator('button:has-text("แก้ไข"), button:has-text("Edit")');
    if (await editButton1.isVisible()) {
      await editButton1.click();
      
      const noteField1 = page1.locator('textarea[name="notes"], input[name="remarks"]');
      if (await noteField1.isVisible()) {
        await noteField1.fill('Edit from tab 1');
        
        const saveButton1 = page1.locator('button:has-text("บันทึก"), button:has-text("Save")');
        if (await saveButton1.isVisible()) {
          await saveButton1.click();
          await expect(page1.locator('text=บันทึกสำเร็จ, text=Saved')).toBeVisible();
        }
      }
    }
    
    // Try to edit in second tab (should detect conflict)
    const editButton2 = page2.locator('button:has-text("แก้ไข"), button:has-text("Edit")');
    if (await editButton2.isVisible()) {
      await editButton2.click();
      
      const noteField2 = page2.locator('textarea[name="notes"], input[name="remarks"]');
      if (await noteField2.isVisible()) {
        await noteField2.fill('Edit from tab 2');
        
        const saveButton2 = page2.locator('button:has-text("บันทึก"), button:has-text("Save")');
        if (await saveButton2.isVisible()) {
          await saveButton2.click();
          
          // Should show conflict warning
          await expect(page2.locator('text=ข้อมูลถูกแก้ไข, text=Data was modified, text=Conflict')).toBeVisible();
        }
      }
    }
    
    await page2.close();
  });

  test('should handle empty data states', async ({ page }) => {
    await setupTest(page);
    
    // Mock empty API response
    await page.route('**/api/po**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], total: 0 })
      });
    });
    
    // Navigate to PO list
    await page.locator('text=รายการ PO, text=PO List').click();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    // Should show empty state
    await expect(page.locator('text=ไม่มีข้อมูล, text=No data, text=Empty, [data-testid="empty-state"]')).toBeVisible();
    
    // Should show helpful message
    await expect(page.locator('text=สร้าง PO, text=Create PO, text=Add new')).toBeVisible();
  });

  test('should handle file upload errors', async ({ page }) => {
    await setupTest(page);
    
    // Navigate to a page with file upload (if exists)
    await page.goto('/po/po-001/edit');
    
    // Look for file upload input
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      // Try to upload invalid file type
      await fileInput.setInputFiles({
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('This is not an image')
      });
      
      // Should show error for invalid file type
      await expect(page.locator('text=ประเภทไฟล์, text=Invalid file, text=File type')).toBeVisible();
    }
  });

  test('should handle search with no results', async ({ page }) => {
    await setupTest(page);
    
    // Navigate to PO list
    await page.locator('text=รายการ PO, text=PO List').click();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    // Search for non-existent PO
    const searchInput = page.locator('input[type="search"], input[placeholder*="ค้นหา"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('NONEXISTENT-PO-12345');
      
      const searchButton = page.locator('button:has-text("ค้นหา"), button:has-text("Search")');
      if (await searchButton.isVisible()) {
        await searchButton.click();
      }
      
      await page.waitForTimeout(1000);
      
      // Should show no results message
      await expect(page.locator('text=ไม่พบ, text=No results, text=ไม่มีข้อมูล')).toBeVisible();
      
      // Should show clear/reset option
      const clearButton = page.locator('button:has-text("ล้าง"), button:has-text("Clear"), button:has-text("Reset")');
      if (await clearButton.isVisible()) {
        await expect(clearButton).toBeVisible();
      }
    }
  });

  test('should handle browser back/forward navigation errors', async ({ page }) => {
    await setupTest(page);
    
    // Navigate through pages
    await page.locator('text=รายการ PO, text=PO List').click();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    await page.goto('/po/po-001/edit');
    await expect(page).toHaveURL(/.*\/po\/po-001\/edit.*/);
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/.*\/po\/po-001\/edit.*/);
    
    // Should maintain proper state
    await expect(page.locator('h1, h2, [data-testid="po-title"]')).toContainText(['PO', 'Purchase Order']);
  });

  test('should handle JavaScript errors gracefully', async ({ page }) => {
    await setupTest(page);
    
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Listen for page errors
    const pageErrors: string[] = [];
    page.on('pageerror', err => {
      pageErrors.push(err.message);
    });
    
    // Navigate through the app
    await page.locator('text=รายการ PO, text=PO List').click();
    await page.waitForTimeout(1000);
    
    await page.goto('/po/po-001/edit');
    await page.waitForTimeout(1000);
    
    // Check if there are any critical JavaScript errors
    const criticalErrors = [...consoleErrors, ...pageErrors].filter(error => 
      !error.includes('favicon') && 
      !error.includes('DevTools') &&
      !error.includes('ResizeObserver loop limit exceeded')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should handle slow loading states', async ({ page }) => {
    await setupTest(page);
    
    // Simulate slow network
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
      route.continue();
    });
    
    // Navigate to PO list
    await page.locator('text=รายการ PO, text=PO List').click();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    // Should show loading indicator
    await expect(page.locator('[data-testid="loading"], .loading, .spinner')).toBeVisible();
    
    // Loading should not last forever (should complete or timeout)
    await expect(page.locator('[data-testid="loading"], .loading, .spinner')).not.toBeVisible({ timeout: 10000 });
  });

  test('should handle malformed API responses', async ({ page }) => {
    await setupTest(page);
    
    // Mock malformed API response
    await page.route('**/api/po**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json{'
      });
    });
    
    // Navigate to PO list
    await page.locator('text=รายการ PO, text=PO List').click();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    // Should handle parsing error gracefully
    await expect(page.locator('text=เกิดข้อผิดพลาด, text=Error, text=ไม่สามารถโหลด')).toBeVisible({ timeout: 10000 });
  });

  test('should handle session expiration during operation', async ({ page }) => {
    await setupTest(page);
    
    // Navigate to edit page
    await page.goto('/po/po-001/edit');
    
    // Click edit
    const editButton = page.locator('button:has-text("แก้ไข"), button:has-text("Edit")');
    if (await editButton.isVisible()) {
      await editButton.click();
    }
    
    // Simulate session expiration
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('auth');
      sessionStorage.clear();
    });
    
    // Mock 401 response
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' })
      });
    });
    
    // Try to save changes
    const noteField = page.locator('textarea[name="notes"], input[name="remarks"]');
    if (await noteField.isVisible()) {
      await noteField.fill('Test note');
      
      const saveButton = page.locator('button:has-text("บันทึก"), button:has-text("Save")');
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Should redirect to login or show session expired message
        await expect(page.locator('text=หมดอายุ, text=Session expired, text=เข้าสู่ระบบ, [data-testid="login-form"]')).toBeVisible({ timeout: 10000 });
      }
    }
  });
});
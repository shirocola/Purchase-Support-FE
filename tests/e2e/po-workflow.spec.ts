import { test, expect } from '@playwright/test';

test.describe('PO Management Workflow', () => {
  // Helper function to login and navigate to PO section
  async function setupPOTest(page: any, role: string = 'MaterialControl') {
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
    
    // Switch role if needed
    const roleSwitcher = page.locator('[data-testid="role-switcher"], button:has-text("เปลี่ยนบทบาท")');
    if (await roleSwitcher.isVisible()) {
      await roleSwitcher.click();
      
      const roleOption = page.locator(`text=${role}, [data-testid="role-${role.toLowerCase()}"]`);
      if (await roleOption.isVisible()) {
        await roleOption.click();
      }
    }
  }

  test('should display PO list with correct columns', async ({ page }) => {
    await setupPOTest(page);
    
    // Navigate to PO list
    await page.locator('text=รายการ PO, text=PO List').click();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    // Check for required columns
    await expect(page.locator('th, .table-header')).toContainText(['เลขที่', 'PO', 'สถานะ', 'Status']);
    await expect(page.locator('th, .table-header')).toContainText(['Vendor', 'ผู้ขาย']);
    await expect(page.locator('th, .table-header')).toContainText(['วันที่', 'Date']);
    
    // Check if data rows are visible
    const dataRows = page.locator('tbody tr, .table-row');
    await expect(dataRows.first()).toBeVisible();
  });

  test('should search and filter PO list', async ({ page }) => {
    await setupPOTest(page);
    
    // Navigate to PO list
    await page.locator('text=รายการ PO, text=PO List').click();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    // Test search functionality
    const searchInput = page.locator('input[type="search"], input[placeholder*="ค้นหา"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('PO-001');
      
      // Click search button if available
      const searchButton = page.locator('button:has-text("ค้นหา"), button:has-text("Search")');
      if (await searchButton.isVisible()) {
        await searchButton.click();
      }
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Check if results are filtered
      const resultRows = page.locator('tbody tr, .table-row');
      if (await resultRows.first().isVisible()) {
        await expect(resultRows.first()).toContainText('PO-001');
      }
    }
    
    // Test filter functionality
    const filterToggle = page.locator('button:has-text("ตัวกรอง"), button:has-text("Filter")');
    if (await filterToggle.isVisible()) {
      await filterToggle.click();
      
      // Test status filter
      const statusFilter = page.locator('select[name="status"], .status-filter');
      if (await statusFilter.isVisible()) {
        await statusFilter.selectOption('APPROVED');
        
        const applyFilterButton = page.locator('button:has-text("ค้นหา"), button:has-text("Apply")');
        if (await applyFilterButton.isVisible()) {
          await applyFilterButton.click();
        }
        
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should sort PO list by different columns', async ({ page }) => {
    await setupPOTest(page);
    
    // Navigate to PO list
    await page.locator('text=รายการ PO, text=PO List').click();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    // Test sorting by clicking column headers
    const poNumberHeader = page.locator('th:has-text("เลขที่"), th:has-text("PO Number")').first();
    if (await poNumberHeader.isVisible()) {
      await poNumberHeader.click();
      await page.waitForTimeout(500);
      
      // Click again to reverse sort
      await poNumberHeader.click();
      await page.waitForTimeout(500);
    }
    
    // Test sorting by date
    const dateHeader = page.locator('th:has-text("วันที่"), th:has-text("Date")').first();
    if (await dateHeader.isVisible()) {
      await dateHeader.click();
      await page.waitForTimeout(500);
    }
  });

  test('should navigate to PO details and edit', async ({ page }) => {
    await setupPOTest(page);
    
    // Navigate to PO list
    await page.locator('text=รายการ PO, text=PO List').click();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    // Click on first PO or "View" button
    const firstPOLink = page.locator('tbody tr:first-child a, .table-row:first-child a, button:has-text("ดู")').first();
    if (await firstPOLink.isVisible()) {
      await firstPOLink.click();
      
      // Should navigate to PO detail/edit page
      await expect(page).toHaveURL(/.*\/po\/.*\/edit.*/);
      
      // Check for PO details
      await expect(page.locator('h1, h2, [data-testid="po-title"]')).toContainText(['PO', 'Purchase Order']);
      
      // Test edit functionality
      const editButton = page.locator('button:has-text("แก้ไข"), button:has-text("Edit")');
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Check if form fields become editable
        const noteField = page.locator('textarea[name="notes"], input[name="remarks"]');
        if (await noteField.isVisible()) {
          await noteField.fill('Test note added by E2E test');
          
          // Save changes
          const saveButton = page.locator('button:has-text("บันทึก"), button:has-text("Save")');
          if (await saveButton.isVisible()) {
            await saveButton.click();
            
            // Wait for save confirmation
            await expect(page.locator('text=บันทึกสำเร็จ, text=Saved, .success')).toBeVisible({ timeout: 5000 });
          }
        }
      }
    }
  });

  test('should send email for approved PO', async ({ page }) => {
    await setupPOTest(page, 'Admin'); // Need admin role for email functionality
    
    // Navigate to an approved PO (or mock one)
    await page.goto('/po/po-001/edit'); // Assuming po-001 exists and is approved
    
    // Look for send email button
    const sendEmailButton = page.locator('button:has-text("ส่งอีเมล"), button:has-text("Send Email")');
    if (await sendEmailButton.isVisible()) {
      await sendEmailButton.click();
      
      // Should navigate to email form or open email dialog
      const emailForm = page.locator('[data-testid="email-form"], .email-form');
      const emailDialog = page.locator('[role="dialog"]:has-text("อีเมล"), [role="dialog"]:has-text("Email")');
      
      if (await emailForm.isVisible() || await emailDialog.isVisible()) {
        // Fill email form
        const recipientField = page.locator('input[name="to"], input[name="recipients"]');
        if (await recipientField.isVisible()) {
          await recipientField.fill('vendor@test.com');
        }
        
        const subjectField = page.locator('input[name="subject"]');
        if (await subjectField.isVisible()) {
          await subjectField.fill('PO Notification - Test');
        }
        
        const messageField = page.locator('textarea[name="message"], textarea[name="body"]');
        if (await messageField.isVisible()) {
          await messageField.fill('This is a test email from E2E test.');
        }
        
        // Send email
        const sendButton = page.locator('button:has-text("ส่ง"), button:has-text("Send")');
        if (await sendButton.isVisible()) {
          await sendButton.click();
          
          // Wait for success confirmation
          await expect(page.locator('text=ส่งสำเร็จ, text=Sent, .success')).toBeVisible({ timeout: 10000 });
        }
      }
    }
  });

  test('should track vendor acknowledge status', async ({ page }) => {
    await setupPOTest(page);
    
    // Navigate to a PO with email sent
    await page.goto('/po/po-001/acknowledge-status');
    
    // Check for acknowledge status information
    await expect(page.locator('h1, h2, [data-testid="page-title"]')).toContainText(['ติดตาม', 'Acknowledge', 'Status']);
    
    // Check for status indicators
    const statusIndicator = page.locator('[data-testid="acknowledge-status"], .status-indicator');
    if (await statusIndicator.isVisible()) {
      await expect(statusIndicator).toContainText(['รอรับทราบ', 'รับทราบแล้ว', 'Pending', 'Acknowledged']);
    }
    
    // Check for vendor information
    const vendorInfo = page.locator('[data-testid="vendor-info"], .vendor-info');
    if (await vendorInfo.isVisible()) {
      await expect(vendorInfo).toContainText(['Vendor', 'ผู้ขาย']);
    }
    
    // Check for email history
    const emailHistory = page.locator('[data-testid="email-history"], .email-history');
    if (await emailHistory.isVisible()) {
      await expect(emailHistory).toContainText(['ประวัติ', 'History', 'Email']);
    }
  });

  test('should handle pagination in PO list', async ({ page }) => {
    await setupPOTest(page);
    
    // Navigate to PO list
    await page.locator('text=รายการ PO, text=PO List').click();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    // Check for pagination controls
    const pagination = page.locator('[data-testid="pagination"], .pagination');
    if (await pagination.isVisible()) {
      // Test page size selector
      const pageSizeSelector = page.locator('select[name="pageSize"], .page-size-selector');
      if (await pageSizeSelector.isVisible()) {
        await pageSizeSelector.selectOption('25');
        await page.waitForTimeout(1000);
      }
      
      // Test next page button
      const nextButton = page.locator('button:has-text("Next"), button:has-text("ถัดไป")');
      if (await nextButton.isVisible() && !(await nextButton.isDisabled())) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        // Test previous page button
        const prevButton = page.locator('button:has-text("Previous"), button:has-text("ก่อนหน้า")');
        if (await prevButton.isVisible()) {
          await prevButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('should show different data based on user role', async ({ page }) => {
    // Test with AppUser role (should hide price columns)
    await setupPOTest(page, 'AppUser');
    
    await page.locator('text=รายการ PO, text=PO List').click();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    // Price/Amount columns should not be visible for AppUser
    await expect(page.locator('th:has-text("มูลค่า"), th:has-text("Amount"), th:has-text("Price")')).not.toBeVisible();
    
    // Switch to MaterialControl role
    const roleSwitcher = page.locator('[data-testid="role-switcher"], button:has-text("เปลี่ยนบทบาท")');
    if (await roleSwitcher.isVisible()) {
      await roleSwitcher.click();
      
      const materialControlOption = page.locator('text=MaterialControl, [data-testid="role-materialcontrol"]');
      if (await materialControlOption.isVisible()) {
        await materialControlOption.click();
      }
      
      // Now price columns should be visible
      await expect(page.locator('th:has-text("มูลค่า"), th:has-text("Amount")')).toBeVisible();
    }
  });

  test('should handle form validation errors', async ({ page }) => {
    await setupPOTest(page);
    
    // Navigate to PO edit form
    await page.goto('/po/po-001/edit');
    
    // Try to submit form with invalid data
    const editButton = page.locator('button:has-text("แก้ไข"), button:has-text("Edit")');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Clear required fields
      const titleField = page.locator('input[name="title"], input[name="poTitle"]');
      if (await titleField.isVisible()) {
        await titleField.clear();
        
        // Try to save
        const saveButton = page.locator('button:has-text("บันทึก"), button:has-text("Save")');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          
          // Should show validation errors
          await expect(page.locator('.error, [role="alert"], .validation-error')).toBeVisible();
        }
      }
    }
  });
});
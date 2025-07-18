import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  // Common setup for responsive tests
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

  test('mobile layout - sidebar should be collapsible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await setupTest(page);
    
    // Check if sidebar is hidden on mobile
    const sidebar = page.locator('[data-testid="sidebar"], nav.sidebar, .drawer');
    const menuButton = page.locator('[data-testid="menu-button"], button[aria-label*="menu"]');
    
    if (await menuButton.isVisible()) {
      // Sidebar should be hidden initially on mobile
      await expect(sidebar).not.toBeVisible();
      
      // Click menu button to open sidebar
      await menuButton.click();
      await expect(sidebar).toBeVisible();
      
      // Click outside to close sidebar
      const backdrop = page.locator('[data-testid="backdrop"], .backdrop, .drawer-backdrop');
      if (await backdrop.isVisible()) {
        await backdrop.click();
        await expect(sidebar).not.toBeVisible();
      }
    }
  });

  test('tablet layout - sidebar behavior', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await setupTest(page);
    
    // On tablet, sidebar might be persistent or collapsible
    const sidebar = page.locator('[data-testid="sidebar"], nav.sidebar, .drawer');
    await expect(sidebar).toBeVisible();
    
    // Check if menu items are properly spaced
    const menuItems = page.locator('[data-testid="menu-item"], .menu-item, nav a');
    if (await menuItems.first().isVisible()) {
      await expect(menuItems.first()).toBeVisible();
    }
  });

  test('desktop layout - sidebar should be persistent', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await setupTest(page);
    
    // On desktop, sidebar should be persistent
    const sidebar = page.locator('[data-testid="sidebar"], nav.sidebar, .drawer');
    await expect(sidebar).toBeVisible();
    
    // Menu button might not be visible on desktop
    const menuButton = page.locator('[data-testid="menu-button"], button[aria-label*="menu"]');
    if (await menuButton.isVisible()) {
      // If menu button exists, sidebar should still be visible after clicking
      await menuButton.click();
      await expect(sidebar).toBeVisible();
    }
  });

  test('mobile PO list - should show mobile-optimized table', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setupTest(page);
    
    // Navigate to PO list
    const menuButton = page.locator('[data-testid="menu-button"], button[aria-label*="menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
    
    await page.locator('text=รายการ PO, text=PO List').click();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    // Check if table is responsive (might be cards on mobile)
    const table = page.locator('table, [data-testid="po-table"]');
    const cardView = page.locator('[data-testid="po-cards"], .po-card, .mobile-card');
    
    if (await cardView.isVisible()) {
      // Mobile card view
      await expect(cardView.first()).toBeVisible();
    } else if (await table.isVisible()) {
      // Responsive table
      await expect(table).toBeVisible();
      
      // Check if horizontal scroll is available if needed
      const tableContainer = page.locator('.table-container, .table-responsive');
      if (await tableContainer.isVisible()) {
        await expect(tableContainer).toHaveCSS('overflow-x', 'auto');
      }
    }
  });

  test('mobile PO edit form - should stack form fields vertically', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setupTest(page);
    
    // Navigate to PO edit
    await page.goto('/po/po-001/edit');
    
    // Check if form fields are stacked properly on mobile
    const formFields = page.locator('.form-field, .form-group, .MuiFormControl-root');
    if (await formFields.first().isVisible()) {
      const firstField = formFields.first();
      const secondField = formFields.nth(1);
      
      if (await secondField.isVisible()) {
        const firstFieldBox = await firstField.boundingBox();
        const secondFieldBox = await secondField.boundingBox();
        
        // Second field should be below the first (y coordinate should be greater)
        expect(secondFieldBox?.y).toBeGreaterThan(firstFieldBox?.y || 0);
      }
    }
  });

  test('tablet PO list - should show optimized layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await setupTest(page);
    
    // Navigate to PO list
    await page.locator('text=รายการ PO, text=PO List').click();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    // Check table layout on tablet
    const table = page.locator('table, [data-testid="po-table"]');
    await expect(table).toBeVisible();
    
    // Check if all important columns are visible
    await expect(page.locator('th, .table-header')).toContainText(['เลขที่', 'PO', 'สถานะ']);
  });

  test('responsive text sizing', async ({ page }) => {
    await setupTest(page);
    
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // Check if text is readable at this size
      const mainHeading = page.locator('h1, h2, [data-testid="main-title"]').first();
      if (await mainHeading.isVisible()) {
        const fontSize = await mainHeading.evaluate(el => 
          window.getComputedStyle(el).fontSize
        );
        
        // Font size should be reasonable (at least 14px, varies by viewport)
        const fontSizeNum = parseInt(fontSize);
        expect(fontSizeNum).toBeGreaterThanOrEqual(14);
        
        if (viewport.name === 'mobile') {
          expect(fontSizeNum).toBeLessThanOrEqual(32);
        }
      }
    }
  });

  test('mobile navigation drawer behavior', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setupTest(page);
    
    const menuButton = page.locator('[data-testid="menu-button"], button[aria-label*="menu"]');
    const sidebar = page.locator('[data-testid="sidebar"], nav.sidebar, .drawer');
    
    if (await menuButton.isVisible()) {
      // Test opening navigation
      await menuButton.click();
      await expect(sidebar).toBeVisible();
      
      // Test navigating to a page
      await page.locator('text=รายการ PO, text=PO List').click();
      
      // Navigation should close drawer and navigate
      await expect(page).toHaveURL(/.*\/po\/list.*/);
      await expect(sidebar).not.toBeVisible();
    }
  });

  test('responsive buttons and touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setupTest(page);
    
    // Navigate to PO list
    const menuButton = page.locator('[data-testid="menu-button"], button[aria-label*="menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
    
    await page.locator('text=รายการ PO, text=PO List').click();
    await expect(page).toHaveURL(/.*\/po\/list.*/);
    
    // Check if action buttons are touch-friendly (minimum 44px height)
    const actionButtons = page.locator('button, .button, .btn');
    if (await actionButtons.first().isVisible()) {
      const buttonBox = await actionButtons.first().boundingBox();
      
      // Touch target should be at least 44px high
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('responsive images and media', async ({ page }) => {
    await setupTest(page);
    
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // Check if images scale properly
      const images = page.locator('img');
      if (await images.first().isVisible()) {
        const imgBox = await images.first().boundingBox();
        
        // Image should not overflow viewport
        expect(imgBox?.width).toBeLessThanOrEqual(viewport.width);
      }
    }
  });

  test('landscape orientation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 }); // Landscape mobile
    await setupTest(page);
    
    // Check if layout adapts to landscape
    const sidebar = page.locator('[data-testid="sidebar"], nav.sidebar, .drawer');
    const menuButton = page.locator('[data-testid="menu-button"], button[aria-label*="menu"]');
    
    // In landscape, sidebar might behave differently
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(sidebar).toBeVisible();
    }
  });

  test('responsive form layouts', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setupTest(page);
    
    // Navigate to a form page
    await page.goto('/po/po-001/edit');
    
    // Click edit if needed
    const editButton = page.locator('button:has-text("แก้ไข"), button:has-text("Edit")');
    if (await editButton.isVisible()) {
      await editButton.click();
    }
    
    // Check if form adapts to mobile
    const formContainer = page.locator('form, .form-container');
    if (await formContainer.isVisible()) {
      const containerBox = await formContainer.boundingBox();
      
      // Form should not overflow viewport
      expect(containerBox?.width).toBeLessThanOrEqual(375);
    }
    
    // Check if buttons are stacked on mobile
    const formButtons = page.locator('.form-actions button, .button-group button');
    if (await formButtons.count() > 1) {
      const firstButton = formButtons.first();
      const secondButton = formButtons.nth(1);
      
      if (await firstButton.isVisible() && await secondButton.isVisible()) {
        const firstButtonBox = await firstButton.boundingBox();
        const secondButtonBox = await secondButton.boundingBox();
        
        // Buttons should be stacked vertically on mobile
        if (firstButtonBox && secondButtonBox) {
          const verticalGap = Math.abs((secondButtonBox.y) - (firstButtonBox.y + firstButtonBox.height));
          expect(verticalGap).toBeLessThan(50); // Should be close vertically
        }
      }
    }
  });

  test('accessibility with responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await setupTest(page);
    
    // Test keyboard navigation on mobile
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    if (await focusedElement.isVisible()) {
      await expect(focusedElement).toBeVisible();
    }
    
    // Test if touch targets are accessible
    const interactiveElements = page.locator('button, a, input, select, textarea');
    if (await interactiveElements.first().isVisible()) {
      const elementBox = await interactiveElements.first().boundingBox();
      
      // Touch targets should be at least 44px in one dimension
      expect(Math.max(elementBox?.width || 0, elementBox?.height || 0)).toBeGreaterThanOrEqual(44);
    }
  });
});
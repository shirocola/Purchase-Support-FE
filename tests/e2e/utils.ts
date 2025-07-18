import { Page, expect } from '@playwright/test';

/**
 * Common test utilities for E2E tests
 */

export interface LoginOptions {
  email?: string;
  password?: string;
  role?: 'Admin' | 'MaterialControl' | 'AppUser' | 'Vendor';
}

/**
 * Perform login with specified options
 */
export async function loginUser(page: Page, options: LoginOptions = {}) {
  const {
    email = 'admin@test.com',
    password = 'password123',
    role
  } = options;

  // Check if already logged in
  const isLoggedIn = await page.locator('text=หน้าแรก, text=Dashboard, text=Welcome').isVisible();
  
  if (!isLoggedIn) {
    // Navigate to login if not already there
    await page.goto('/');
    
    // Wait for login form
    await expect(page.locator('[data-testid="login-form"], [data-testid="login-page"]')).toBeVisible();
    
    // Fill login form
    const emailField = page.locator('input[type="email"], input[name="email"], input[name="username"]').first();
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailField.isVisible()) {
      await emailField.fill(email);
    }
    if (await passwordField.isVisible()) {
      await passwordField.fill(password);
    }
    
    // Click login button
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("เข้าสู่ระบบ")').first();
    await loginButton.click();
    
    // Wait for successful login
    await expect(page.locator('text=หน้าแรก, text=Dashboard, text=Welcome')).toBeVisible({ timeout: 10000 });
  }
  
  // Switch to specific role if specified
  if (role) {
    await switchRole(page, role);
  }
}

/**
 * Switch user role using role switcher
 */
export async function switchRole(page: Page, role: string) {
  const roleSwitcher = page.locator('[data-testid="role-switcher"], button:has-text("เปลี่ยนบทบาท")');
  if (await roleSwitcher.isVisible()) {
    await roleSwitcher.click();
    
    const roleOption = page.locator(`text=${role}, [data-testid="role-${role.toLowerCase()}"]`);
    if (await roleOption.isVisible()) {
      await roleOption.click();
    }
  }
}

/**
 * Wait for loading to complete
 */
export async function waitForLoading(page: Page, timeout = 10000) {
  try {
    await page.locator('[data-testid="loading"], .loading, .spinner').waitFor({ 
      state: 'visible', 
      timeout: 1000 
    });
    await page.locator('[data-testid="loading"], .loading, .spinner').waitFor({ 
      state: 'hidden', 
      timeout 
    });
  } catch {
    // Loading indicator might not appear for fast operations
  }
}

/**
 * Open mobile navigation menu
 */
export async function openMobileMenu(page: Page) {
  const menuButton = page.locator('[data-testid="menu-button"], button[aria-label*="menu"]');
  if (await menuButton.isVisible()) {
    await menuButton.click();
    
    // Wait for sidebar to appear
    const sidebar = page.locator('[data-testid="sidebar"], nav.sidebar, .drawer');
    await expect(sidebar).toBeVisible();
  }
}

/**
 * Navigate to PO list page
 */
export async function navigateToPOList(page: Page) {
  // Open mobile menu if needed
  const viewport = page.viewportSize();
  if (viewport && viewport.width < 768) {
    await openMobileMenu(page);
  }
  
  await page.locator('text=รายการ PO, text=PO List').click();
  await expect(page).toHaveURL(/.*\/po\/list.*/);
}

/**
 * Navigate to specific PO edit page
 */
export async function navigateToPOEdit(page: Page, poId: string) {
  await page.goto(`/po/${poId}/edit`);
  await expect(page).toHaveURL(new RegExp(`.*\\/po\\/${poId}\\/edit.*`));
}

/**
 * Check if element is visible with retry
 */
export async function waitForElement(page: Page, selector: string, timeout = 5000) {
  try {
    await page.locator(selector).waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Take screenshot with timestamp
 */
export async function takeTimestampedScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
}

/**
 * Mock API response
 */
export async function mockApiResponse(page: Page, url: string, response: any, status = 200) {
  await page.route(url, route => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });
}

/**
 * Mock network error
 */
export async function mockNetworkError(page: Page, url: string) {
  await page.route(url, route => {
    route.abort('internetdisconnected');
  });
}

/**
 * Check responsive breakpoints
 */
export const BREAKPOINTS = {
  mobile: { width: 375, height: 667 },
  mobileLandscape: { width: 667, height: 375 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
} as const;

/**
 * Test element accessibility
 */
export async function checkAccessibility(page: Page, selector: string) {
  const element = page.locator(selector);
  
  if (await element.isVisible()) {
    const boundingBox = await element.boundingBox();
    
    // Check minimum touch target size (44px)
    if (boundingBox) {
      const minTouchTarget = Math.max(boundingBox.width, boundingBox.height);
      expect(minTouchTarget).toBeGreaterThanOrEqual(44);
    }
    
    // Check if element is focusable
    const tagName = await element.evaluate(el => el.tagName.toLowerCase());
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
    
    if (interactiveTags.includes(tagName)) {
      await element.focus();
      await expect(element).toBeFocused();
    }
  }
}

/**
 * Validate form field with error message
 */
export async function validateFormField(page: Page, fieldSelector: string, invalidValue: string, expectedError: string) {
  const field = page.locator(fieldSelector);
  
  if (await field.isVisible()) {
    await field.fill(invalidValue);
    await field.blur();
    
    // Check for validation error
    await expect(page.locator(`text=${expectedError}, .error, [role="alert"]`)).toBeVisible();
  }
}

/**
 * Wait for API call to complete
 */
export async function waitForApiCall(page: Page, urlPattern: string | RegExp, timeout = 10000) {
  return page.waitForResponse(
    response => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      } else {
        return urlPattern.test(url);
      }
    },
    { timeout }
  );
}
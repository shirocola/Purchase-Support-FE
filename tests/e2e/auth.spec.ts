import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test from the home page
    await page.goto('/');
  });

  test('should show login page when not authenticated', async ({ page }) => {
    // Check if we're redirected to login page or login form is visible
    await expect(page.locator('[data-testid="login-form"], [data-testid="login-page"]')).toBeVisible();
  });

  test('should login successfully and redirect to dashboard', async ({ page }) => {
    // Wait for login form to be visible
    await expect(page.locator('[data-testid="login-form"], [data-testid="login-page"]')).toBeVisible();
    
    // Fill login form (assuming email/password fields exist)
    const emailField = page.locator('input[type="email"], input[name="email"], input[name="username"]').first();
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailField.isVisible()) {
      await emailField.fill('admin@test.com');
    }
    if (await passwordField.isVisible()) {
      await passwordField.fill('password123');
    }
    
    // Click login button
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("เข้าสู่ระบบ")').first();
    await loginButton.click();
    
    // Wait for successful login and redirect
    await expect(page.locator('text=หน้าแรก, text=Dashboard, text=Welcome')).toBeVisible({ timeout: 10000 });
  });

  test('should show proper error for invalid credentials', async ({ page }) => {
    // Wait for login form
    await expect(page.locator('[data-testid="login-form"], [data-testid="login-page"]')).toBeVisible();
    
    // Fill with invalid credentials
    const emailField = page.locator('input[type="email"], input[name="email"], input[name="username"]').first();
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailField.isVisible()) {
      await emailField.fill('invalid@test.com');
    }
    if (await passwordField.isVisible()) {
      await passwordField.fill('wrongpassword');
    }
    
    // Click login button
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("เข้าสู่ระบบ")').first();
    await loginButton.click();
    
    // Wait for error message
    await expect(page.locator('text=Invalid, text=Error, text=ผิดพลาด, .error, [role="alert"]')).toBeVisible({ timeout: 5000 });
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/');
    
    // Check if already logged in, if not, login first
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
    
    // Find and click logout button
    const userMenu = page.locator('[data-testid="user-menu"], button:has-text("Logout"), button:has-text("ออกจากระบบ")').first();
    await userMenu.click();
    
    // If it's a dropdown menu, click the logout option
    const logoutOption = page.locator('text=Logout, text=ออกจากระบบ').last();
    if (await logoutOption.isVisible()) {
      await logoutOption.click();
    }
    
    // Confirm we're back to login page
    await expect(page.locator('[data-testid="login-form"], [data-testid="login-page"]')).toBeVisible({ timeout: 5000 });
  });

  test('should handle session timeout', async ({ page }) => {
    // Login first
    await page.goto('/');
    
    // Simulate session timeout by clearing localStorage/sessionStorage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Navigate to a protected page
    await page.goto('/po/list');
    
    // Should be redirected to login
    await expect(page.locator('[data-testid="login-form"], [data-testid="login-page"]')).toBeVisible({ timeout: 5000 });
  });

  test('should redirect authenticated user away from login page', async ({ page }) => {
    // First ensure we're logged in
    await page.goto('/');
    
    const isLoggedIn = await page.locator('text=หน้าแรก, text=Dashboard, text=Welcome').isVisible();
    
    if (!isLoggedIn) {
      // Perform login first
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
    
    // Now try to visit login page
    await page.goto('/auth');
    
    // Should be redirected away from login page
    await expect(page).not.toHaveURL(/.*\/auth.*/);
    await expect(page.locator('text=หน้าแรก, text=Dashboard, text=Welcome')).toBeVisible();
  });
});
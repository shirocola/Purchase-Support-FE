# E2E Testing Guide

## Overview
This project uses Playwright for end-to-end (E2E) testing to ensure all user flows work correctly across different browsers and devices.

## Test Coverage

### 🔐 Authentication Tests (`auth.spec.ts`)
- ✅ Login/logout functionality
- ✅ Invalid credentials handling
- ✅ Session timeout scenarios
- ✅ Authentication redirects
- ✅ Auto-redirect authenticated users

### 🧭 Navigation Tests (`menu-navigation.spec.ts`)
- ✅ Role-based menu display (Admin, MaterialControl, AppUser, Vendor)
- ✅ Dynamic menu updates on role changes
- ✅ Responsive sidebar behavior (mobile/desktop)
- ✅ Menu highlighting and navigation
- ✅ Multi-level menu expansion

### 📋 PO Workflow Tests (`po-workflow.spec.ts`)
- ✅ PO list display and pagination
- ✅ Search and filtering functionality
- ✅ PO creation and editing
- ✅ Email sending to vendors
- ✅ Vendor acknowledge tracking
- ✅ Role-based data visibility
- ✅ Form validation

### 📱 Responsive Design Tests (`responsive.spec.ts`)
- ✅ Mobile layout (375px width)
- ✅ Tablet layout (768px width)
- ✅ Desktop layout (1920px width)
- ✅ Touch-friendly button sizes (44px minimum)
- ✅ Responsive typography
- ✅ Mobile navigation drawer
- ✅ Form layout adaptation
- ✅ Accessibility compliance

### ⚠️ Error Handling Tests (`error-handling.spec.ts`)
- ✅ Network errors and retry mechanisms
- ✅ API timeout handling
- ✅ 404 error pages
- ✅ Unauthorized access errors
- ✅ Form validation errors
- ✅ Empty data states
- ✅ Concurrent editing conflicts
- ✅ Session expiration handling
- ✅ Malformed API responses

### 🔄 Main Flow Tests (`main-flow.spec.ts`)
- ✅ Complete PO management workflow
- ✅ Cross-role functionality testing
- ✅ End-to-end integration scenarios

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers (if not done)
npx playwright install
```

### Test Commands
```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npm run test:e2e tests/e2e/auth.spec.ts

# Run tests for specific browser
npm run test:e2e -- --project=chromium

# Debug mode (step through tests)
npm run test:e2e:debug

# Generate and view HTML report
npm run test:e2e:report
```

### Mobile Testing
```bash
# Run tests on mobile devices
npm run test:e2e -- --project="Mobile Chrome"
npm run test:e2e -- --project="Mobile Safari"
```

## Test Structure

```
tests/e2e/
├── auth.spec.ts              # Authentication flow tests
├── menu-navigation.spec.ts   # Role-based navigation tests  
├── po-workflow.spec.ts       # PO management workflows
├── responsive.spec.ts        # Responsive design tests
├── error-handling.spec.ts    # Error scenarios
├── main-flow.spec.ts         # Integration tests
└── utils.ts                  # Helper functions
```

## Test Results

### Reports
- **HTML Report**: `playwright-report/index.html`
- **Test Results**: `test-results/`
- **Screenshots**: `test-results/screenshots/`
- **Videos**: Captured on test failures

### CI/CD Integration
Tests run automatically on:
- ✅ Pull requests
- ✅ Main branch pushes
- ✅ Release deployments

## Writing New Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';
import { loginUser } from './utils';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Setup
    await loginUser(page, { role: 'Admin' });
    
    // Action
    await page.locator('button').click();
    
    // Assertion
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### Helper Functions
Use utilities from `utils.ts`:
```typescript
import { 
  loginUser, 
  navigateToPOList, 
  waitForLoading,
  BREAKPOINTS 
} from './utils';

// Login with specific role
await loginUser(page, { role: 'MaterialControl' });

// Navigate to common pages
await navigateToPOList(page);

// Test responsive layouts
await page.setViewportSize(BREAKPOINTS.mobile);
```

### Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Test user behavior, not implementation details**
3. **Include error scenarios and edge cases**
4. **Test responsive design across viewports**
5. **Mock API responses for consistent tests**
6. **Use descriptive test names**
7. **Group related tests in describe blocks**

### Mock API Responses
```typescript
// Mock successful response
await page.route('**/api/po**', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: mockPOData })
  });
});

// Mock error response
await page.route('**/api/po**', route => {
  route.abort('internetdisconnected');
});
```

## Debugging Tests

### Debug Mode
```bash
# Run in debug mode
npm run test:e2e:debug

# Debug specific test
npx playwright test auth.spec.ts --debug
```

### Screenshots and Videos
- Automatic screenshots on failure
- Video recording for failed tests
- Full page screenshots available

### Browser DevTools
```typescript
// Pause execution for manual debugging
await page.pause();

// Open browser developer tools
await page.locator('button').click();
```

## Performance Testing

Tests include performance checks:
- ✅ Page load times
- ✅ API response times  
- ✅ Loading state visibility
- ✅ Timeout handling

## Accessibility Testing

Responsive tests include accessibility checks:
- ✅ Minimum touch target sizes (44px)
- ✅ Keyboard navigation
- ✅ Focus visibility
- ✅ Screen reader compatibility

## Browser Support

Tests run on:
- ✅ **Chromium** (Chrome, Edge)
- ✅ **Firefox**
- ✅ **WebKit** (Safari)
- ✅ **Mobile Chrome** (Android)
- ✅ **Mobile Safari** (iOS)

## Continuous Integration

### GitHub Actions
Tests run automatically on:
- Pull request creation/updates
- Merges to main branch
- Release workflows

### Test Reports
- HTML reports uploaded as artifacts
- Screenshots attached to failed test runs
- Performance metrics tracked over time

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout in playwright.config.ts
   - Check for slow API responses
   - Verify test setup is correct

2. **Element not found**
   - Use data-testid attributes
   - Wait for elements to load
   - Check responsive layout changes

3. **Flaky tests**
   - Add proper wait conditions
   - Use stable selectors
   - Mock external dependencies

### Getting Help
- Check test output and screenshots
- Review HTML report for detailed failure info
- Use debug mode to step through tests
- Consult Playwright documentation

## Test Metrics

Current test coverage:
- **285 total tests** across 6 test files
- **5 browser/device combinations**
- **Core user flows**: Login, Navigation, PO Management
- **Error scenarios**: Network, Validation, Session
- **Responsive design**: Mobile, Tablet, Desktop
- **Accessibility**: Touch targets, Keyboard navigation
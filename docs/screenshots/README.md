# E2E Test Screenshots

This directory contains example screenshots from E2E test runs to demonstrate the testing coverage.

## Test Coverage Examples

### ✅ Authentication Flow
- Login page validation
- Role-based redirects
- Session handling

### ✅ Responsive Design
- Mobile layout (375px)
- Tablet layout (768px)  
- Desktop layout (1920px)

### ✅ PO Management
- PO list with filtering
- PO edit forms
- Email workflow
- Vendor acknowledge tracking

### ✅ Error Handling
- Network error states
- Form validation messages
- Empty data states

### ✅ Cross-browser Testing
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)
- Mobile browsers

## Automated Screenshot Capture

Screenshots are automatically captured:
- ✅ On test failures
- ✅ At key workflow steps
- ✅ For responsive breakpoints
- ✅ During error scenarios

Test results and screenshots are available in:
- `test-results/` directory
- `playwright-report/` HTML report
- CI/CD pipeline artifacts

## Example Test Run Output

```
Running 285 tests using 5 workers

✓ auth.spec.ts:9:7 › Authentication Flow › should show login page when not authenticated
✓ auth.spec.ts:14:7 › Authentication Flow › should login successfully and redirect to dashboard  
✓ menu-navigation.spec.ts:44:7 › Role-based Menu › Admin should see all menu items
✓ po-workflow.spec.ts:42:7 › PO Management › should display PO list with correct columns
✓ responsive.spec.ts:31:7 › Responsive Design › mobile layout - sidebar should be collapsible
✓ error-handling.spec.ts:31:7 › Error Handling › should handle network errors gracefully

285 passed (2m 34s)
```

## Viewing Test Reports

```bash
# Generate and open HTML report
npm run test:e2e:report

# The report includes:
# - Test results summary
# - Screenshots of failures  
# - Video recordings
# - Performance metrics
# - Cross-browser results
```
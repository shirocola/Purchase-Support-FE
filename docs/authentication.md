# Authentication System Documentation

## Overview

This document describes the authentication system implemented for the Purchase Order Management System frontend.

## Features

### 🔐 Core Authentication
- **Login/Logout Flow**: Complete authentication with username/password
- **Session Management**: JWT token handling with automatic refresh
- **Secure Storage**: Token management with localStorage fallback
- **Auto-logout**: Automatic logout on token expiry or 401 errors

### 🛡️ Security Features
- **Route Protection**: AuthGuard component for protecting authenticated routes
- **Token Refresh**: Automatic token refresh to maintain sessions
- **Session Timeout**: Proper handling of expired sessions
- **Error Handling**: Comprehensive error states and user feedback

### 🎨 User Interface
- **Responsive Design**: Mobile-first login page design
- **Form Validation**: Client-side validation with error messages
- **Loading States**: Visual feedback during authentication
- **Password Toggle**: Show/hide password functionality
- **User Menu**: User information display and logout functionality

### 🔧 Development Features
- **Mock Authentication**: Development mode with mock users for testing
- **Role Switching**: Development feature for testing different user roles
- **Environment Controls**: Configurable mock auth via environment variables

## Architecture

### Authentication Flow

1. **Login Process**:
   ```
   User enters credentials → Validation → API call → Token storage → Redirect
   ```

2. **Token Management**:
   ```
   Token stored → Auto-refresh → 401 handling → Logout on expiry
   ```

3. **Route Protection**:
   ```
   Route access → Auth check → Redirect if needed → Render content
   ```

### Key Components

#### AuthService (`lib/api/auth.ts`)
- Handles all authentication API calls
- Manages token storage and refresh
- Provides methods for login, logout, profile fetching

#### AuthContext (`lib/contexts/auth-context.tsx`)
- React context for authentication state
- Supports both real API and mock authentication
- Provides authentication hooks and methods

#### AuthGuard (`components/auth/AuthGuard.tsx`)
- Route protection component
- Conditional rendering based on auth state
- Redirect handling for unauthenticated users

#### LoginPage (`app/auth/login/page.tsx`)
- Responsive login form
- Form validation and error handling
- Integration with authentication context

## Configuration

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

# Authentication Configuration
NEXT_PUBLIC_ENABLE_MOCK_AUTH=true  # Enable mock auth for development
```

### Mock Users

The system includes mock users for development:

- **Admin**: `admin` / `password`
- **Material Control**: `material.control` / `password`
- **App User**: `app.user` / `password`
- **Vendor**: `vendor` / `password`

## Usage

### Protecting Routes

```tsx
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <YourProtectedContent />
    </AuthGuard>
  );
}
```

### Using Authentication Hook

```tsx
import { useAuth } from '@/lib/contexts/auth-context';

export default function YourComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Your component logic
}
```

### Higher-Order Component

```tsx
import { withAuthGuard } from '@/components/auth/AuthGuard';

const ProtectedComponent = withAuthGuard(YourComponent);
```

## API Integration

### Backend Endpoints

The system integrates with these backend endpoints:

- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh
- `GET /user/profile` - Get user profile and permissions

### API Response Format

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}
```

## Testing

The system includes comprehensive tests for:

- Login form validation and submission
- Authentication context state management
- Route protection with AuthGuard
- Error handling and edge cases
- Responsive design verification

### Running Tests

```bash
npm test -- __tests__/LoginPage.test.tsx
npm test -- __tests__/AuthGuard.test.tsx
npm test -- __tests__/auth-context.test.tsx
```

## Screenshots

### Login Page
![Login Page](https://github.com/user-attachments/assets/37f4122d-e117-4ce7-a7f4-5421368a2ea5)

The login page features:
- Clean, modern design with gradient background
- Responsive form layout
- Input validation with error states
- Password visibility toggle
- Loading states during authentication
- Professional branding with company logo

### User Menu
The authenticated user interface includes:
- User information display in the header
- Role-based menu visibility
- Logout functionality
- Role switching for development

## Security Considerations

1. **Token Storage**: Uses localStorage with plans for httpOnly cookies in production
2. **Session Management**: Automatic logout on token expiry
3. **API Security**: All API calls include authorization headers
4. **Route Protection**: Unauthenticated users are redirected to login
5. **Error Handling**: Secure error messages without exposing sensitive information

## Future Enhancements

1. **SSO Integration**: Support for Single Sign-On providers
2. **Multi-factor Authentication**: Additional security layer
3. **Password Recovery**: Forgot password functionality
4. **Session Persistence**: Remember me functionality
5. **Audit Logging**: Track authentication events
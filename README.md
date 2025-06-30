# Purchase Support System - Frontend

A modern React/Next.js frontend application for managing Purchase Orders (PO) with role-based access control, audit logging, and responsive design.

## 🚀 Features

### PO Detail Page
- **Comprehensive PO Information**: Display detailed purchase order information including vendor details, items, quantities, prices, and status
- **Role-Based Access Control**: Show/hide sensitive information (financial data, action buttons) based on user permissions
- **Status Tracking**: Real-time status display with historical status changes
- **Audit Log**: Complete audit trail of all changes and actions performed on the PO
- **Action Buttons**: Send emails to vendors, acknowledge POs, download PDFs (based on permissions)
- **Responsive Design**: Optimized for both desktop and mobile devices

### Technical Features
- **React Query**: Efficient data fetching and caching
- **TypeScript**: Full type safety and better development experience
- **Tailwind CSS**: Modern, responsive styling
- **Component-Based Architecture**: Reusable and maintainable components
- **Comprehensive Testing**: Unit tests for all components
- **Error Handling**: Graceful error states and user feedback

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/shirocola/Purchase-Support-FE.git
cd Purchase-Support-FE

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── po/[poId]/         # PO detail page
├── components/            # Reusable components
│   ├── po/               # PO-specific components
│   │   ├── PODetailPage.tsx
│   │   ├── POHeader.tsx
│   │   ├── POItemsTable.tsx
│   │   ├── POStatusDisplay.tsx
│   │   ├── POActionButtons.tsx
│   │   └── AuditLog.tsx
│   ├── LoadingComponents.tsx
│   ├── ErrorComponents.tsx
│   └── Tabs.tsx
├── hooks/                # Custom React hooks
│   └── usePO.ts          # PO data fetching hooks
├── lib/                  # Utility libraries
│   ├── api.ts           # API client
│   ├── mockData.ts      # Mock data for development
│   ├── providers.tsx    # React Query provider
│   └── utils.ts         # Utility functions
├── types/               # TypeScript type definitions
│   └── po.ts           # PO-related types
└── __tests__/          # Test files
```

## 🎯 Usage Examples

### Viewing a PO Detail Page

Navigate to `/po/{poId}` to view a specific purchase order:

```
http://localhost:3000/po/po-001
```

### Sample PO Data

The application includes mock data for development. Sample PO includes:

- **PO Number**: PO-001
- **Vendor**: ABC Supplies Co., Ltd.
- **Items**: Steel Pipes, Industrial Bolts, Safety Equipment
- **Status**: Sent to Vendor
- **Audit Log**: Complete history of changes

### Role-Based Features

The application adapts based on user permissions:

#### MaterialControl Role (Full Access)
- View all PO details including financial data
- Send emails to vendors
- Acknowledge POs
- View complete audit log

#### AppUser Role (Limited Access)
- View PO details (financial data may be masked)
- Limited action capabilities

#### Vendor Role
- View PO details
- Acknowledge PO receipt
- Limited audit log access

## 🧪 Testing

The application includes comprehensive tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test PODetail.test.tsx
```

### Test Coverage
- **Component Tests**: All UI components
- **Integration Tests**: Component interactions
- **Permission Tests**: Role-based access control
- **Error Handling**: Error states and edge cases

## 🎨 UI Components

### PODetailPage
Main page component that orchestrates all PO detail functionality.

**Features:**
- Navigation breadcrumbs
- Success/error messages
- Responsive layout with sidebar
- Tab-based content organization

### POHeader
Displays essential PO information at the top of the page.

**Contents:**
- PO number and basic information
- Vendor contact details
- Notes and attachments
- Creation and update timestamps

### POItemsTable
Shows the list of items in the purchase order.

**Features:**
- Responsive table layout
- Financial data masking based on permissions
- Item descriptions and quantities
- Total amount calculation

### POStatusDisplay
Shows current status and complete status history.

**Features:**
- Current status highlight
- Timeline of status changes
- Status descriptions and timestamps
- Visual indicators for status progression

### AuditLog
Complete audit trail of all actions performed on the PO.

**Features:**
- Chronological list of actions
- User information for each action
- Before/after values for changes
- Metadata for additional context

### POActionButtons
Action buttons available based on user permissions.

**Available Actions:**
- Send email to vendor
- Acknowledge PO
- Download PDF
- Copy link
- Confirmation dialogs for critical actions

## 🔒 Security & Permissions

The application implements comprehensive role-based access control:

### Permission Types
- `canView`: Basic viewing permissions
- `canEdit`: Editing capabilities
- `canDelete`: Deletion rights
- `canSendEmail`: Email sending permissions
- `canViewAuditLog`: Audit log access
- `canViewFinancialData`: Financial information access

### Data Masking
Financial information is automatically hidden when users lack appropriate permissions.

## 📱 Responsive Design

The application is fully responsive with optimized layouts for:

- **Desktop**: Full-featured layout with sidebar
- **Tablet**: Adapted grid layout
- **Mobile**: Stacked layout with touch-friendly interactions

## 🚦 Error Handling

Comprehensive error handling for various scenarios:

- **404 Not Found**: PO doesn't exist
- **403 Forbidden**: Insufficient permissions
- **Network Errors**: Connection issues
- **Loading States**: User feedback during data fetching
- **Empty States**: No data available

## 🛣️ API Integration

The application is designed to work with a backend API:

```typescript
// Example API endpoints
GET /api/po/{id}              // Get PO details
GET /api/po/{id}/audit-log    // Get audit log
GET /api/po/{id}/permissions  // Get user permissions
POST /api/po/{id}/send-email  // Send email to vendor
POST /api/po/{id}/acknowledge // Acknowledge PO
```

For development, mock data is used to simulate API responses.

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NODE_ENV=development
```

### Build Configuration
- Next.js 15+ with App Router
- TypeScript strict mode
- Tailwind CSS for styling
- PostCSS for CSS processing

## 📈 Performance

- **React Query**: Efficient data caching and synchronization
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js image optimization
- **Bundle Analysis**: Webpack bundle analyzer for optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🐛 Known Issues

- Mock data is used for development - replace with actual API integration
- Some advanced features may require backend implementation
- Email functionality requires SMTP configuration

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced filtering and search
- [ ] Bulk operations
- [ ] File upload for attachments
- [ ] Print-friendly views
- [ ] Export to Excel/PDF
- [ ] Multi-language support

---

For more information, please refer to the [API documentation](../openapi.yaml) and [project guidelines](../.github/copilot-instructions.md).
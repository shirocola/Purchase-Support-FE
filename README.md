# Purchase Order Management System - Frontend

ระบบจัดการใบสั่งซื้อ (Purchase Order) สำหรับองค์กร

## ภาพรวม

โปรเจกต์นี้เป็น Frontend Application สำหรับระบบจัดการ Purchase Order ที่พัฒนาด้วย Next.js, TypeScript, และ Material-UI

### เทคโนโลยีที่ใช้

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: React Query (@tanstack/react-query)
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS + Material-UI
- **Testing**: Jest + React Testing Library
- **Form Management**: React Hook Form + Zod

## การติดตั้งและเริ่มต้น

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm หรือ bun

### Installation

```bash
# Clone repository
git clone [repository-url]
cd Purchase-Support-FE

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Environment Variables

สร้างไฟล์ `.env.local` และกำหนดค่าตัวแปรต่อไปนี้:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## การใช้งาน

เปิดเบราว์เซอร์และไปที่ [http://localhost:3000](http://localhost:3000)

### หน้าสำคัญ

- `/` - หน้าหลัก
- `/po` - รายการ Purchase Order
- `/po/[id]` - รายละเอียด PO (จะพัฒนาในงานต่อไป)
- `/po/create` - สร้าง PO ใหม่ (จะพัฒนาในงานต่อไป)

## ฟีเจอร์หลัก - PO List

### การแสดงผล

- ✅ ตารางแสดงรายการ PO พร้อมข้อมูลสำคัญ
- ✅ Responsive design (desktop/mobile)
- ✅ Pagination แบบ server-side
- ✅ Sorting ตามคอลัมน์ต่าง ๆ

### การค้นหาและกรอง

- ✅ ค้นหาด้วยเลข PO
- ✅ กรองตามสถานะ PO
- ✅ Debounced search (500ms)

### การจัดการสิทธิ์

- ✅ แสดง/ซ่อนปุ่มตาม role และ permission
- ✅ ปุ่มดูรายละเอียด (ทุก role ที่มีสิทธิ์ดู PO)
- ✅ ปุ่มแก้ไข (เฉพาะผู้มี EDIT_PO permission)
- ✅ ปุ่มส่งอีเมล (เฉพาะผู้มี SEND_PO_EMAIL permission)
- ✅ ปุ่มลบ (เฉพาะผู้มี DELETE_PO permission)

### State Management

- ✅ Loading state
- ✅ Error state พร้อม retry
- ✅ Empty state เมื่อไม่มีข้อมูล

## Screenshots

### Desktop View
![PO List Desktop](docs/screenshots/po-list-desktop.png)

### Mobile View  
![PO List Mobile](docs/screenshots/po-list-mobile.png)

### Search & Filter
![Search and Filter](docs/screenshots/po-list-search.png)

## การทดสอบ

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

- ✅ Component rendering
- ✅ Data fetching และ display
- ✅ Search functionality
- ✅ Filter functionality  
- ✅ Permission-based UI
- ✅ Error handling
- ✅ Loading states
- ✅ User interactions

## โครงสร้างโปรเจกต์

```
src/
├── app/                 # Next.js App Router pages
│   ├── po/             # PO related pages
│   │   └── page.tsx    # PO List page
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   └── POList.tsx     # Main PO List component
├── hooks/             # Custom React hooks
│   └── usePO.ts       # PO related hooks
├── services/          # API services
│   └── poService.ts   # PO API service
├── types/             # TypeScript type definitions
│   └── po.ts          # PO related types
├── utils/             # Utility functions
│   └── helpers.ts     # Helper functions
└── __tests__/         # Test files
    └── POList.test.tsx
```

## API Integration

### Endpoints ที่ใช้

- `GET /api/po` - ดึงรายการ PO (พร้อม pagination, search, filter)
- `GET /api/po/:id` - ดึงรายละเอียด PO
- `POST /api/po/:id/send-email` - ส่งอีเมล PO ให้ vendor

### Response Format

```typescript
interface POListResponse {
  data: PurchaseOrder[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
```

## Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing  
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## การพัฒนาต่อ

### งานที่ยังไม่เสร็จ

- [ ] หน้ารายละเอียด PO
- [ ] หน้าสร้าง/แก้ไข PO
- [ ] ระบบ Authentication
- [ ] Role-based routing
- [ ] Real-time notifications
- [ ] Export เป็น PDF/Excel

### การเพิ่มฟีเจอร์ใหม่

1. สร้าง component ใน `src/components/`
2. เพิ่ม API service ใน `src/services/`
3. สร้าง hooks ใน `src/hooks/`
4. เพิ่ม types ใน `src/types/`
5. เขียน tests ใน `src/__tests__/`

## การ Deploy

### Vercel (แนะนำ)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### อื่น ๆ

```bash
# Build static files
npm run build

# Serve static files
npm run start
```

## การแก้ปัญหา

### ปัญหาเกี่ยวกับ Material-UI

หาก component ไม่แสดงผลหรือ styling ไม่ถูกต้อง:

1. ตรวจสอบ ThemeProvider wrapper
2. ตรวจสอบ CssBaseline import
3. ตรวจสอบ emotion cache

### ปัญหาเกี่ยวกับ React Query

หาก data ไม่ update:

1. ตรวจสอบ queryKey
2. ตรวจสอบ invalidateQueries
3. ตรวจสอบ staleTime และ cacheTime

## License

Private Project - All Rights Reserved

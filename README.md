# Purchase Order Management System (Frontend)

ระบบจัดการใบสั่งซื้อ (Purchase Order) ฝั่ง Frontend ที่สร้างด้วย Next.js, TypeScript และ Material-UI พร้อมระบบการควบคุมสิทธิ์ตามบทบาทผู้ใช้

## 🎯 Overview

โปรเจกต์นี้เป็นส่วน Frontend ของระบบจัดการ Purchase Order (PO) ที่มีฟีเจอร์หลัก:
- **หน้า Preview & แก้ไข PO** พร้อมระบบสิทธิ์ตามบทบาทผู้ใช้
- **ระบบ Role-based Access Control (RBAC)** สำหรับ AppUser, MaterialControl, Admin, Vendor
- **การแสดง/ซ่อนข้อมูลตามสิทธิ์** (Data Masking)
- **Responsive Design** รองรับ Desktop และ Mobile
- **Form Validation และ Error Handling**
- **Loading และ Empty States**

## 🚀 Features

### ✅ หน้า PO Preview & Edit (Task 3)
- แสดงข้อมูล PO ครบถ้วน (รายการสินค้า, ราคา, vendor details)
- แก้ไขข้อมูลตามสิทธิ์ของ user role
- ปุ่ม action ตามสิทธิ์: "บันทึก", "ส่งอีเมล", "ย้อนกลับ"
- Dialog ยืนยันสำหรับการบันทึกและส่งอีเมล
- Validation ทุก field พร้อม error handling
- Loading, error, empty states ครบถ้วน

### ✅ ฟอร์มส่งอีเมล PO (Task 4)
- **ฟอร์มส่งอีเมลแบบละเอียด** พร้อมการปรับแต่งผู้รับและข้อความ
- **หลายผู้รับอีเมล** สามารถเพิ่ม/ลดอีเมลผู้รับได้
- **ข้อความที่กำหนดเอง** แก้ไขข้อความในอีเมลได้
- **Preview ก่อนส่ง** ดูตัวอย่างอีเมลก่อนส่ง
- **สถานะการส่งอีเมล** แสดงประวัติการส่ง, วันเวลา, สถานะ error
- **การป้องกันส่งซ้ำ** Confirmation dialog และ loading states
- **Form Validation** ตรวจสอบรูปแบบอีเมลและข้อมูลที่จำเป็น
- **Permission Control** แสดง/ซ่อนตามสิทธิ์ผู้ใช้
- **Responsive Design** รองรับทั้ง desktop และ mobile

### ✅ ระบบ Tracking Vendor Acknowledge (Task 5)
- **สถานะการรับทราบ** แสดงสถานะ: ยังไม่ส่ง, รอรับทราบ, รับทราบแล้ว, ปฏิเสธ
- **ประวัติการส่งอีเมล** แสดงวันเวลาส่ง, ผู้ส่ง, จำนวนครั้งที่ส่ง
- **ข้อมูล Vendor** แสดงชื่อ vendor และอีเมลที่ส่งไป
- **Timeline การรับทราบ** วันเวลาที่ vendor กดยืนยัน/ปฏิเสธ พร้อมเหตุผล
- **ปุ่ม Action ตามสิทธิ์** ส่งอีเมลซ้ำ, คัดลอกลิงก์ยืนยัน
- **Real-time Updates** อัปเดตสถานะแบบอัตโนมัติหรือ manual refresh
- **Error Handling** แสดงข้อผิดพลาดการส่งอีเมลล่าสุด
- **Responsive Design** รองรับ desktop และ mobile
- **Permission Control** แสดง/ซ่อนตามสิทธิ์ของ user role

### 🎨 UI/UX Design
- **Material-UI v7** สำหรับ component library
- **Responsive Design** รองรับ desktop และ mobile
- **Thai Language Support** UI ในภาษาไทย
- **Consistent Design System** ตามมาตรฐาน Material Design

### 🔐 Role-based Permissions
- **AppUser**: ดูข้อมูลทั่วไป, แก้ไขหมายเหตุเท่านั้น, ซ่อนราคา
- **MaterialControl**: แก้ไขข้อมูลหลัก, รายการสินค้า, ส่งอีเมล
- **Admin**: สิทธิ์เต็ม รวมถึงอนุมัติและยกเลิก PO
- **Vendor**: ดูข้อมูลอย่างจำกัด, ซ่อนข้อมูลสำคัญ

## 🛠 Tech Stack

- **Framework**: Next.js 15.3.4 (App Router)
- **Language**: TypeScript
- **UI Library**: Material-UI v7 + Material Icons
- **State Management**: TanStack React Query v5
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Testing**: Jest + React Testing Library
- **Styling**: Material-UI + CSS-in-JS

## 📁 Project Structure

```
├── app/                      # Next.js App Router
│   ├── page.tsx             # หน้าแรก
│   ├── layout.tsx           # Root layout
│   ├── providers.tsx        # React Query & Theme providers
│   └── po/[id]/             # PO routes
│       ├── edit/page.tsx    # PO Edit page
│       ├── send-email/page.tsx  # PO Email Form page
│       └── acknowledge-status/page.tsx  # PO Acknowledge Status page
├── components/              # React components
│   ├── po/                 # PO-related components
│   │   ├── POEditPreview.tsx    # Main edit/preview component
│   │   ├── POEmailForm.tsx      # Email form component
│   │   └── POAcknowledgeStatus.tsx  # Vendor acknowledge tracking
│   └── ui/                 # Reusable UI components
│       ├── States.tsx      # Loading/Error/Empty states
│       └── ConfirmDialog.tsx    # Confirmation dialog
├── lib/                    # Utilities & business logic
│   ├── api/               # API service layer
│   │   └── po.ts          # PO API services
│   ├── hooks/             # React Query hooks
│   │   └── usePO.ts       # PO-related hooks
│   ├── types/             # TypeScript types
│   │   └── po.ts          # PO type definitions
│   └── utils/             # Utility functions
│       └── permissions.ts  # Role-based permissions
├── __tests__/             # Test files
│   ├── POEditPreview.test.tsx
│   ├── POEmailForm.test.tsx
│   └── POAcknowledgeStatus.test.tsx
└── public/                # Static assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn หรือ pnpm

### Installation

```bash
# Clone repository
git clone <repository-url>
cd Purchase-Support-FE

# Install dependencies
npm install

# Start development server
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในบราวเซอร์

## 🗺️ Routes & Navigation

### Main Routes
- `/` - หน้าแรก
- `/po/[id]/edit` - หน้าแก้ไข/ดู PO
- `/po/[id]/send-email` - หน้าส่งอีเมล PO
- `/po/[id]/acknowledge-status` - หน้าติดตาม vendor acknowledge

### Example URLs
```
http://localhost:3000/po/po-001/edit              # แก้ไข PO
http://localhost:3000/po/po-001/send-email        # ส่งอีเมล PO
http://localhost:3000/po/po-001/acknowledge-status # ติดตาม vendor acknowledge
```

### การใช้งาน
1. **หน้าแก้ไข PO**: แสดงข้อมูล PO พร้อมปุ่มแก้ไข และส่งอีเมล
2. **หน้าส่งอีเมล**: ฟอร์มส่งอีเมลแบบละเอียด พร้อมการตั้งค่าผู้รับและข้อความ
3. **หน้าติดตาม Vendor Acknowledge**: แสดงสถานะการรับทราบ PO ของ vendor พร้อมประวัติและการดำเนินการ
4. **การสลับระหว่างหน้า**: ใช้ปุ่ม "ส่งอีเมล (แบบละเอียด)" หรือ "ติดตาม Vendor Acknowledge" จากหน้าแก้ไข

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run test:ci     # Run tests with coverage
```

## 📱 Usage Examples

### ตัวอย่างการใช้งาน PO Preview & Edit

1. **เข้าใสหน้าตัวอย่าง**: ไปที่ [http://localhost:3000](http://localhost:3000)
2. **คลิก "ดูตัวอย่าง"** เพื่อไปหน้า PO Preview
3. **ทดสอบการแก้ไข**: คลิกปุ่ม "แก้ไข" (สำหรับ role ที่มีสิทธิ์)
4. **บันทึกข้อมูล**: แก้ไขข้อมูลและคลิก "บันทึก"
5. **ส่งอีเมล**: คลิกปุ่ม "ส่งอีเมล" (สำหรับ PO ที่อนุมัติแล้ว)
6. **ติดตาม Vendor Acknowledge**: คลิกปุ่ม "ติดตาม Vendor Acknowledge" เพื่อดูสถานะการรับทราบ

### ตัวอย่างการใช้งาน Vendor Acknowledge Tracking

1. **เข้าหน้าติดตาม**: ไปที่ `/po/[id]/acknowledge-status`
2. **ดูสถานะปัจจุบัน**: ตรวจสอบสถานะการรับทราบของ vendor
3. **ดูประวัติการส่ง**: ดูข้อมูลการส่งอีเมลและการตอบสนองของ vendor
4. **ส่งอีเมลซ้ำ**: (สำหรับ Admin/MaterialControl) กดปุ่ม "ส่งอีเมลซ้ำ" หากต้องการ
5. **คัดลอกลิงก์**: กดปุ่ม "คัดลอกลิงก์ยืนยัน" เพื่อแชร์ลิงก์ให้ vendor
6. **รีเฟรชข้อมูล**: กดปุ่ม refresh เพื่ออัปเดตสถานะล่าสุด

### Role-based Testing

สามารถทดสอบ role ต่างๆ ได้โดยแก้ไข `mockUser.role` ใน `app/po/[id]/edit/page.tsx`:

```typescript
const mockUser = {
  role: UserRole.MATERIAL_CONTROL, // เปลี่ยนเป็น AppUser, Admin, Vendor
};
```

## 🧪 Testing

โปรเจกต์มี test coverage ครอบคลุม:
- **Component rendering** และ UI behavior
- **Role-based permissions** และ data masking
- **Form validation** และ error handling
- **API integration** และ loading states
- **Responsive design** testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:ci

# Run specific test file
npm test POEditPreview.test.tsx
```

## 🎨 Screenshots

### หน้าแรก (Homepage)
แสดงภาพรวมของระบบและลิงก์ไปยังฟีเจอร์ต่างๆ

### PO Preview & Edit Page
- แสดงข้อมูล PO ครบถ้วน
- ปุ่ม action ตามสิทธิ์ user
- Form แก้ไขข้อมูลแบบ responsive
- ตารางรายการสินค้าพร้อม data masking

### Mobile Responsive
- การแสดงผลที่เหมาะสำหรับหน้าจอมือถือ
- ปรับ layout และ font size อัตโนมัติ

## 🔧 Configuration

### Environment Variables

สร้างไฟล์ `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### API Integration

Component จะเรียก API ตาม endpoint ที่กำหนดใน `lib/api/po.ts`:
- `GET /po/:id` - ดึงข้อมูล PO
- `PATCH /po/:id` - อัปเดต PO
- `POST /po/:id/send-email` - ส่งอีเมล PO
- `GET /po/:id/email-status` - ดึงสถานะการส่งอีเมล
- `GET /po/:id/acknowledge-status` - ดึงสถานะการรับทราบ vendor
- `POST /po/:id/resend-email` - ส่งอีเมลซ้ำ
- `GET /po/:id/acknowledge-link` - ดึงลิงก์ยืนยันสำหรับ vendor

## 🚧 Development Notes

### Business Logic
- **Permission System**: ดู `lib/utils/permissions.ts` สำหรับ logic การควบคุมสิทธิ์
- **Data Masking**: ใช้ `maskValue()` function สำหรับซ่อนข้อมูลตาม role
- **Form Validation**: ใช้ React Hook Form พร้อม validation rules

### Code Style
- ใช้ TypeScript strict mode
- ESLint configuration สำหรับ Next.js
- Component naming convention: PascalCase
- File naming: camelCase สำหรับ utilities, PascalCase สำหรับ components

## 🔄 API Mock Data

ในระหว่างการพัฒนา component จะใช้ mock data จาก React Query hooks ที่ `lib/hooks/usePO.ts`

ตัวอย่าง PO data structure:
```typescript
{
  id: 'po-001',
  poNumber: 'PO-2024-001',
  title: 'Test Purchase Order',
  status: 'DRAFT',
  vendor: { name: 'Test Vendor', email: 'vendor@test.com' },
  items: [{ productName: 'Product 1', quantity: 10, unitPrice: 100 }],
  totalAmount: 1000,
  // ... other fields
}
```

## 🤝 Contributing

1. Fork repository
2. สร้าง feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. เปิด Pull Request

## 📝 Todo / Roadmap

### Phase 1 (Current)
- [x] PO Preview & Edit page
- [x] Role-based permissions
- [x] Responsive design
- [x] Basic testing
- [x] Advanced email form (Task 4)
- [x] Vendor acknowledge tracking (Task 5)

### Phase 2 (Planned)
- [ ] PO List page
- [ ] Advanced search & filtering
- [ ] Audit log display
- [ ] Print functionality

### Phase 3 (Future)
- [ ] Real-time notifications
- [ ] Bulk operations
- [ ] Export to Excel/PDF
- [ ] Advanced reporting

## 📄 License

This project is private and proprietary.

## 🙋‍♂️ Support

สำหรับคำถามหรือปัญหา กรุณา:
- เปิด Issue ใน GitHub repository
- ติดต่อทีมพัฒนา
- ดู documentation ใน `/docs` folder (หากมี)

---

**ข้อมูลเพิ่มเติม**: ดู [Copilot Instructions](./.github/copilot-instructions.md) สำหรับ guidelines การพัฒนา

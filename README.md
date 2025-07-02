# Purchase Order Management System (Frontend)

ระบบจัดการใบสั่งซื้อ (Purchase Order) ฝั่ง Frontend ที่สร้างด้วย Next.js, TypeScript และ Material-UI พร้อมระบบการควบคุมสิทธิ์ตามบทบาทผู้ใช้

## 🎯 Overview

โปรเจกต์นี้เป็นส่วน Frontend ของระบบจัดการ Purchase Order (PO) ที่มีฟีเจอร์หลัก:
- **หน้ารายการ PO** แสดงรายการใบสั่งซื้อจากระบบ SAP พร้อมการค้นหาและกรอง
- **หน้า Preview & แก้ไข PO** พร้อมระบบสิทธิ์ตามบทบาทผู้ใช้
- **ระบบ Role-based Access Control (RBAC)** สำหรับ AppUser, MaterialControl, Admin, Vendor
- **การแสดง/ซ่อนข้อมูลตามสิทธิ์** (Data Masking)
- **Responsive Design** รองรับ Desktop และ Mobile
- **Form Validation และ Error Handling**
- **Loading และ Empty States**

## 🚀 Features

### ✅ รายการ PO (PO List) - ใหม่!
- **หน้ารายการ PO** แสดงรายการใบสั่งซื้อทั้งหมดในระบบ
- **ระบบค้นหาและกรองข้อมูล** ค้นหาตามเลขที่ PO, ชื่อ, หรือ vendor
- **กรองตามสถานะ** เลือกดูเฉพาะ PO ในสถานะที่สนใจ
- **กรองตามวันที่** ระบุช่วงวันที่สร้าง PO
- **กรองตาม Vendor และผู้สร้าง** เลือกดูตาม vendor หรือผู้สร้าง PO
- **การเรียงลำดับ** เรียงตามเลขที่, ชื่อ, สถานะ, vendor, มูลค่า, วันที่
- **Pagination** แบ่งหน้าพร้อมเลือกจำนวนรายการต่อหน้า
- **Role-based Display** ซ่อนข้อมูลราคาสำหรับ AppUser
- **Quick Actions** ปุ่มดู, แก้ไข, ส่งอีเมล, ติดตาม acknowledge
- **Responsive Table** ปรับรูปแบบตารางให้เหมาะกับหน้าจอ
- **Loading และ Empty States** แสดงสถานะการโหลดและกรณีไม่มีข้อมูล

### ✅ จัดการวัสดุ (PO Material) - ใหม่!
- **การค้นหาวัสดุ** ค้นหาด้วย autocomplete ตามรหัสหรือชื่อวัสดุ
- **ระบบกรองข้อมูล** กรองตามหมวดหมู่, วัสดุลับ, หรือมีชื่อเทียบเท่า
- **ปุ่ม Search และ Reset** สำหรับการค้นหาและล้างตัวกรอง (นำมาใช้ซ้ำจาก POFilter)
- **ตารางแสดงรายการวัสดุ** พร้อมข้อมูลรหัส, ชื่อ, หมวดหมู่, สถานะความลับ
- **การแก้ไขชื่อเทียบเท่า** สำหรับ Material Control เพื่อตั้งชื่อสมมติให้วัสดุลับ
- **Role-based Permissions** แสดง/ซ่อนข้อมูลตามสิทธิ์ (Vendor ไม่เห็นข้อมูลลับ)
- **Data Masking** ซ่อนชื่อจริงของวัสดุลับสำหรับ Vendor
- **Responsive Design** รองรับ desktop และ mobile
- **Sorting และ Pagination** เรียงลำดับและแบ่งหน้าข้อมูล

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

### ✅ ระบบแสดงสถานะ PO & AuditLog (Task 6)
- **POStatusTimeline Component** แสดงสถานะการไหลของ PO แบบ timeline/stepper
- **POAuditLog Component** ประวัติการเปลี่ยนแปลงพร้อมระบบกรองข้อมูล
- **Status Progression** DRAFT → PENDING → APPROVED → SENT → ACKNOWLEDGED
- **Timeline/Stepper Layout** ปรับเปลี่ยนแบบ responsive (timeline บน mobile, stepper บน desktop)
- **Enhanced Filtering** กรองตาม action, user, และ date range
- **Field Change Details** แสดงรายละเอียดการเปลี่ยนแปลง field พร้อม old/new values
- **Role-based Permissions** แสดง/ซ่อนข้อมูลตาม user role
- **Metadata Support** แสดงข้อมูลเพิ่มเติมเมื่อมี

### ✅ ระบบแสดง/ซ่อนเมนูตาม role (Task 7)
- **Dynamic Menu/Sidebar** เมนู sidebar ที่ปรับเปลี่ยนตาม user role
- **Role-based Access Control** แสดงเฉพาะเมนูที่ user มีสิทธิ์เข้าถึง (ซ่อน ไม่ใช่ disable)
- **Multi-level Menu** รองรับ dropdown menu และ submenu
- **Responsive Layout** ใช้ Drawer แบบ modal บน mobile, persistent บน desktop
- **Role Switching** ฟีเจอร์เปลี่ยน role สำหรับ development และ testing
- **Auth Context** ระบบจัดการ authentication และ role management
- **Menu Configuration** config file ที่แยกสิทธิ์เมนูต่อ role อย่างชัดเจน
- **User Information Display** แสดงข้อมูล user และ role ปัจจุบัน
- **Navigation Integration** ทำงานร่วมกับ Next.js App Router
- **Change Tracking** แสดงการเปลี่ยนแปลงฟิลด์ พร้อมค่าเก่า/ใหม่
- **Advanced Filtering** กรองตาม action type, วันที่, ผู้ใช้
- **Metadata Display** แสดงข้อมูลเพิ่มเติมเมื่อมี
- **Responsive Design** Timeline สำหรับ mobile, Stepper สำหรับ desktop
- **Permission Control** แสดง/ซ่อนข้อมูลตามสิทธิ์ผู้ใช้

### ✅ ระบบ Auth/Login & token management (Task 8)
- **Authentication System** ระบบ login/logout พร้อม token management
- **Login Page** หน้า login ที่สวยงามและ responsive
- **Route Protection** ป้องกันหน้าที่ต้องการสิทธิ์ด้วย AuthGuard component
- **Session Management** จัดการ session และ auto-refresh token
- **User Menu** แสดงข้อมูล user และ logout functionality
- **Mock Authentication** โหมดพัฒนาที่ใช้ mock users สำหรับ testing
- **Security Features** การจัดการ token อย่างปลอดภัยและ error handling
- **Form Validation** ตรวจสอบฟอร์ม login พร้อม error states
- **Development Tools** เครื่องมือสำหรับพัฒนาและ debug authentication
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
│   ├── components-showcase/page.tsx # Component showcase (Task 6)
│   ├── material/page.tsx    # Material management page - ใหม่!
│   └── po/[id]/             # PO routes
│       ├── edit/page.tsx    # PO Edit page
│       ├── send-email/page.tsx  # PO Email Form page
│       └── acknowledge-status/page.tsx  # PO Acknowledge Status page
├── components/              # React components
│   ├── layout/              # Layout components (Task 7)
│   │   ├── MainLayout.tsx   # Main layout with sidebar
│   │   └── Sidebar.tsx      # Dynamic sidebar with role-based menu
│   ├── po/                 # PO-related components
│   │   ├── POEditPreview.tsx    # Main edit/preview component
│   │   ├── POEmailForm.tsx      # Email form component
│   │   ├── POAcknowledgeStatus.tsx  # Vendor acknowledge tracking
│   │   ├── POStatusTimeline.tsx # Status timeline/stepper (Task 6)
│   │   ├── POAuditLog.tsx      # Enhanced audit log with filters (Task 6)
│   │   ├── MaterialManagement.tsx # Material management component - ใหม่!
│   │   ├── MaterialFilter.tsx  # Material search/filter component - ใหม่!
│   │   ├── AuditLog.tsx        # Basic audit log component
│   │   ├── POHeader.tsx        # PO header information
│   │   ├── POItemsTable.tsx    # Items table with permissions
│   │   ├── POStatusDisplay.tsx # Status display component
│   │   └── POActionButtons.tsx # Action buttons component
│   └── ui/                 # Reusable UI components
│       ├── States.tsx      # Loading/Error/Empty states
│       └── ConfirmDialog.tsx    # Confirmation dialog
├── config/                  # Configuration files (Task 7)
│   └── menu-config.ts      # Menu structure and role-based permissions
├── lib/                    # Utilities & business logic
│   ├── contexts/           # React contexts (Task 7)
│   │   └── auth-context.tsx # Authentication and role management
│   ├── api/               # API service layer
│   │   ├── po.ts          # PO API services
│   │   └── material.ts    # Material API services - ใหม่!
│   ├── hooks/             # React Query hooks
│   │   ├── usePO.ts       # PO-related hooks
│   │   └── useMaterial.ts # Material-related hooks - ใหม่!
│   ├── types/             # TypeScript types
│   │   └── po.ts          # PO & Material type definitions
│   ├── utils/             # Utility functions
│   │   └── permissions.ts  # Role-based permissions (updated for Material)
│   └── mockData.ts        # Mock data for testing/demo
├── __tests__/             # Test files
│   ├── POEditPreview.test.tsx
│   ├── POEmailForm.test.tsx
│   ├── POAcknowledgeStatus.test.tsx
│   ├── POStatusTimeline.test.tsx  # Task 6 tests
│   ├── POAuditLog.test.tsx       # Task 6 tests
│   ├── Sidebar.test.tsx          # Task 7 tests
│   ├── MainLayout.test.tsx       # Task 7 tests
│   ├── auth-context.test.tsx     # Task 7 tests
│   ├── menu-config.test.ts       # Task 7 tests
│   ├── AuditLog.test.tsx
│   ├── PODetail.test.tsx
│   └── POItemsTable.test.tsx
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
- `/po/list` - หน้ารายการ PO - ใหม่!
- `/material` - หน้าจัดการวัสดุ - ใหม่!
- `/components-showcase` - ตัวอย่างการใช้งาน POStatusTimeline & POAuditLog
- `/po/[id]/edit` - หน้าแก้ไข/ดู PO
- `/po/[id]/send-email` - หน้าส่งอีเมล PO
- `/po/[id]/acknowledge-status` - หน้าติดตาม vendor acknowledge

### Example URLs
```
http://localhost:3002/                             # หน้าแรก (หรือพอร์ตที่ระบบใช้งาน)
http://localhost:3002/po/list                      # รายการ PO - ใหม่!
http://localhost:3002/material                     # จัดการวัสดุ - ใหม่!
http://localhost:3002/components-showcase          # Component showcase (Task 6)
http://localhost:3002/po/po-001/edit              # แก้ไข PO
http://localhost:3002/po/po-001/send-email        # ส่งอีเมล PO
http://localhost:3002/po/po-001/acknowledge-status # ติดตาม vendor acknowledge
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

### ตัวอย่างการใช้งาน PO List (รายการ PO) - ใหม่!

1. **เข้าหน้ารายการ PO**: ไปที่ [http://localhost:3000/po/list](http://localhost:3000/po/list)
2. **ดูรายการ PO**: สังเกตตารางแสดงรายการ PO ทั้งหมดพร้อมข้อมูลสำคัญ
3. **ทดสอบการค้นหา**:
   - กรอกคำค้นหาในช่อง "ค้นหา" (เลขที่ PO, ชื่อ, หรือ vendor)
   - คลิกปุ่ม "ค้นหา" เพื่อกรองผลลัพธ์
4. **ทดสอบการกรองข้อมูล**:
   - คลิกที่ "ตัวกรองข้อมูล" เพื่อขยายตัวกรอง
   - เลือกสถานะ PO ที่ต้องการดู
   - เลือก vendor หรือผู้สร้าง
   - ระบุช่วงวันที่
   - คลิก "ค้นหา" เพื่อใช้งานตัวกรอง
5. **ทดสอบการเรียงลำดับ**:
   - คลิกที่หัวตาราง (เลขที่ PO, ชื่อ, สถานะ, vendor, มูลค่า, วันที่) เพื่อเรียงลำดับ
   - คลิกซ้ำเพื่อเปลี่ยนจาก asc เป็น desc
6. **ทดสอบ Quick Actions**:
   - คลิกปุ่ม "ดู" เพื่อไปหน้ารายละเอียด PO
   - คลิกปุ่ม "แก้ไข" เพื่อแก้ไข PO (ตามสิทธิ์)
   - คลิกปุ่ม "ส่งอีเมล" สำหรับ PO ที่อนุมัติแล้ว
   - คลิกปุ่ม "ติดตาม" เพื่อดู vendor acknowledge status
7. **ทดสอบ Pagination**:
   - เปลี่ยนจำนวนรายการต่อหน้า (5, 10, 25, 50)
   - เปลี่ยนหน้าด้วยปุ่ม previous/next
8. **ทดสอบ Role-based Display**:
   - เปลี่ยน user role เป็น AppUser เพื่อดูการซ่อนคอลัมน์ "มูลค่า"
   - เปลี่ยนกลับเป็น Admin/MaterialControl เพื่อดูข้อมูลครบถ้วน

### ตัวอย่างการใช้งาน Material Management (จัดการวัสดุ) - ใหม่!

1. **เข้าหน้าจัดการวัสดุ**: ไปที่ [http://localhost:3000/material](http://localhost:3000/material)
2. **ดูรายการวัสดุ**: สังเกตตารางแสดงรายการวัสดุทั้งหมดพร้อมข้อมูลสำคัญ
3. **ทดสอบการค้นหาวัสดุ**:
   - พิมพ์ในช่อง "ค้นหาวัสดุ" เพื่อใช้ autocomplete search
   - ระบบจะแสดงรายการวัสดุที่ตรงกับคำค้นหา
   - เลือกวัสดุจาก dropdown หรือพิมพ์ต่อไป
4. **ทดสอบการกรองข้อมูล**:
   - คลิกที่ "ตัวกรองการค้นหา" เพื่อขยายตัวกรอง
   - เลือกหมวดหมู่วัสดุ
   - เปิด/ปิด switch "เฉพาะวัสดุลับ" และ "มีชื่อเทียบเท่า"
   - คลิก "ค้นหา" เพื่อใช้งานตัวกรอง
5. **ทดสอบการแก้ไขชื่อเทียบเท่า** (Material Control เท่านั้น):
   - มองหาวัสดุที่มี chip "ความลับ" (สีแดง)
   - คลิกปุ่ม "แก้ไข" (ไอคอนดินสอ)
   - ระบุชื่อเทียบเท่าในกล่องโต้ตอบ
   - คลิก "บันทึก" เพื่อบันทึกการเปลี่ยนแปลง
6. **ทดสอบการเรียงลำดับ**:
   - คลิกที่หัวตาราง (รหัสวัสดุ, ชื่อวัสดุ, หมวดหมู่, ชื่อเทียบเท่า) เพื่อเรียงลำดับ
   - คลิกซ้ำเพื่อเปลี่ยนจาก asc เป็น desc
7. **ทดสอบ Pagination**:
   - เปลี่ยนจำนวนรายการต่อหน้า (5, 10, 25, 50)
   - เปลี่ยนหน้าด้วยปุ่ม previous/next
8. **ทดสอบ Role-based Display**:
   - เปลี่ยน user role เป็น Vendor เพื่อดูการซ่อนข้อมูลลับ
   - เปลี่ยนกลับเป็น Material Control เพื่อดูข้อมูลครบถ้วน
   - สังเกตการ masking ของชื่อวัสดุที่เป็นความลับ

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

### ตัวอย่างการใช้งาน Component Showcase (Task 6)

1. **เข้าหน้าตัวอย่าง**: ไปที่ [http://localhost:3000/components-showcase](http://localhost:3000/components-showcase)
2. **เลือก User Role**: ใช้ dropdown เลือก role เพื่อดูการแสดงผลตามสิทธิ์
3. **เลือก Status**: เปลี่ยน current status เพื่อดูการทำงานของ timeline
4. **ดู POStatusTimeline**: 
   - Tab แรก - ดูแสดงการไหลของสถานะ PO
   - เปรียบเทียบ timeline กับ stepper layout
5. **ทดสอบ POAuditLog**:
   - Tab ที่สอง - ดูระบบ audit log พร้อมฟิลเตอร์
   - ลองกรองข้อมูลตาม action type, user name, หรือวันที่
   - ดูการแสดงผลของ field changes และ metadata
6. **ดู Supporting Components**: Tab ที่สาม - ดู POHeader และ POItemsTable
7. **เปรียบเทียบ**: Tab สุดท้าย - ดู basic AuditLog component

### ตัวอย่างการใช้งาน Dynamic Menu/Sidebar System (Task 7)

1. **ดูเมนูพื้นฐาน**: เข้าหน้าแรก [http://localhost:3000](http://localhost:3000) 
   - สังเกตเมนู sidebar ที่แสดงตาม MaterialControl role (default)
   - ดูข้อมูล user และ role ที่ footer ของ sidebar
2. **ทดสอบ Role Switching**: 
   - คลิกปุ่ม "เปลี่ยนบทบาท" ใน AppBar
   - เลือก role ต่างๆ เพื่อดูการเปลี่ยนแปลงเมนู
3. **ทดสอบแต่ละ Role**:
   - **Admin**: ดูเมนูครบทั้งหมด รวมถึง "ระบบจัดการ"
   - **MaterialControl**: ดูเมนูหลักๆ ยกเว้นระบบจัดการ
   - **AppUser**: ดูเมนูจำกัด ไม่มีการส่งอีเมล
   - **Vendor**: ดูเฉพาะ "หน้าแรก" และ "Vendor Portal"
4. **ทดสอบ Multi-level Menu**:
   - คลิกที่เมนูที่มีลูกศร (เช่น "ระบบจัดการ" สำหรับ Admin)
   - ดูการ expand/collapse ของ submenu
5. **ทดสอบ Responsive**: 
   - ลดขนาดหน้าจอให้เป็น mobile
   - สังเกตการเปลี่ยนจาก persistent sidebar เป็น modal drawer
   - ทดสอบปุ่มเปิด/ปิดเมนู
6. **ทดสอบ Navigation**:
   - คลิกเมนูต่างๆ เพื่อทดสอบการ navigate
   - สังเกตการ highlight ของเมนูที่เลือก
   - ทดสอบ breadcrumb path

### Component Features Details

#### POStatusTimeline
- **Responsive Design**: Timeline บน mobile, Stepper บน desktop
- **Status Progression**: แสดงขั้นตอนจาก DRAFT → ACKNOWLEDGED
- **Role-based Display**: ซ่อน/แสดงข้อมูลตามสิทธิ์
- **Custom History**: รองรับ status history หรือใช้ default progression

#### POAuditLog  
- **Advanced Filtering**: กรองตาม action type, user name, date range
- **Change Tracking**: แสดงการเปลี่ยนแปลงฟิลด์พร้อมค่าเก่า/ใหม่
- **Metadata Support**: แสดงข้อมูลเพิ่มเติมเมื่อมี
- **Interactive UI**: Filter panel ที่ expand/collapse ได้
- **Permission Control**: ควบคุมการแสดงผลตาม user role

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
- [x] PO Status Timeline & Audit Log (Task 6)

### Phase 2 (Planned)
- [ ] PO List page
- [ ] Advanced search & filtering
- [ ] Print functionality
- [ ] Status history API integration

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

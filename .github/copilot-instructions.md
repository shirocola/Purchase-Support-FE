# Copilot Instructions for This Repository

## Overview

โปรเจกต์นี้เป็นระบบจัดการ Purchase Order (PO) สำหรับองค์กร ที่มีทั้ง **Backend (API Service)** และ **Frontend (Web Application)**  
Copilot จำเป็นต้องเข้าใจโครงสร้าง, business logic, role permission, และ requirement สำคัญต่อไปนี้

---

## Business Requirement Summary

- ผู้ใช้หลัก: AppUser, MaterialControl, Admin, Vendor
- ฟีเจอร์หลักฝั่ง BE:  
  - สร้าง/ดู/แก้ไข/ลบ PO
  - ส่งอีเมล PO ให้ vendor พร้อมลิงก์ acknowledge
  - Vendor สามารถกดยืนยันรับทราบ PO ผ่าน public link
  - ระบบ log, audit, permission (RBAC), masking ข้อมูล
  - แสดงสถานะ/ประวัติการเปลี่ยนแปลง PO, AuditLog
  - API คืนเมนู/feature ตาม role

- ฟีเจอร์หลักฝั่ง FE:
  - แสดงรายการ PO, รายละเอียด, สถานะ, AuditLog
  - ค้นหา/กรอง/ส่งอีเมล/track vendor acknowledge
  - UI/UX ต้อง responsive
  - ระบบ login, token management, dynamic menu ตาม role
  - Validation, error handling, masking ข้อมูลตาม role

---

## Guideline สำหรับ Copilot

### 1. Coding Standard

- ใช้มาตรฐาน code ตาม framework (เช่น TypeScript + React/NextJS, Node.js + Express)
- เน้น readable, maintainable, testable
- สำหรับ BE: ใช้ RESTful API, JWT, RBAC, logging, validation ครบ
- สำหรับ FE: ใช้ React function component, React Query/Redux, Styled Components/Material UI, test (Jest/React Testing Library)

### 2. Security & Permission

- ทุก endpoint/api/หน้า UI ต้องตรวจสอบสิทธิ์ (RBAC) และ masking ข้อมูลที่ user ไม่มีสิทธิ์
- หลีกเลี่ยง hardcoded secret, API key, sensitive info ใน code

### 3. Documentation

- ทุก feature/endpoint/component ใหม่ ต้องมี doc/screenshot/example
- อัปเดต OpenAPI spec (สำหรับ backend)
- README อัปเดตตลอด

### 4. Testing

- ทุก feature ต้องมี unit/integration test
- Test ครอบคลุม edge case, error, permission, masking
- FE ต้องมี test UI, BE ต้อง test API

### 5. UI/UX (สำหรับ FE)

- Responsive design (desktop/mobile)
- Loading, error, empty state ครบ
- แสดง/ซ่อนเมนูและปุ่มตาม role
- ใช้ design system ที่กำหนด (ถ้ามี)

### 6. Copilot Prompt Example (BE/FE)

**เพิ่มฟีเจอร์:**  
- "สร้าง endpoint สำหรับ vendor acknowledge PO"
- "สร้างหน้า PO List และค้นหา PO"

**ปรับปรุง:**  
- "เพิ่ม input validation และ error handling ให้ /api/po"
- "แก้ไข UI ให้รองรับ masking ข้อมูล ตาม role"

**ทดสอบ:**  
- "เพิ่ม unit test ให้ logic ส่งอีเมล"
- "เพิ่ม test กรณี permission denied"

---

## หลีกเลี่ยง

- หลีกเลี่ยงการ generate code ที่ไม่ตรงกับ business logic หรือ security guideline ข้างต้น
- หลีกเลี่ยง code ซ้ำซ้อน, magic value, หรือ comment ที่ไม่จำเป็น

---

## Reference

- [README.md](../README.md)
- [OpenAPI Spec](../openapi.yaml)
- [Frontend/Backend structure & doc]
- [ตัวอย่าง test, doc ในโปรเจกต์]

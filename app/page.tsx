'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button,
} from '@mui/material';
import { ShoppingCart, Assignment, Email, Inventory } from '@mui/icons-material';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          ระบบจัดการใบสั่งซื้อ
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Purchase Order Management System
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ระบบสำหรับจัดการใบสั่งซื้อ (PO) พร้อมการควบคุมสิทธิ์ตามบทบาทผู้ใช้
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, flexWrap: 'wrap' }}>
        <Card sx={{ flex: '1 1 300px', minWidth: { xs: '100%', md: '300px' } }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <ShoppingCart sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              รายการ PO
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              ดูรายการใบสั่งซื้อทั้งหมด พร้อมการค้นหาและกรองข้อมูล
            </Typography>
            <Link href="/po/list" passHref>
              <Button variant="contained" fullWidth>
                ดูรายการ PO
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 300px', minWidth: { xs: '100%', md: '300px' } }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Inventory sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              จัดการวัสดุ
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              จัดการชื่อเทียบเท่าสำหรับวัสดุที่เป็นความลับ (Material Control เท่านั้น)
            </Typography>
            <Link href="/material" passHref>
              <Button variant="contained" fullWidth>
                จัดการวัสดุ
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 300px', minWidth: { xs: '100%', md: '300px' } }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Assignment sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              ตัวอย่าง PO Preview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              ดูตัวอย่างหน้าแสดงและแก้ไข PO
            </Typography>
            <Button
              variant="contained"
              fullWidth
              component={Link}
              href="/po/demo-po-001/edit"
            >
              ดูตัวอย่าง
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 300px', minWidth: { xs: '100%', md: '300px' } }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Email sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              การส่งอีเมล
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              ส่งอีเมล PO ให้ vendor พร้อม tracking
            </Typography>
            <Button variant="outlined" fullWidth disabled>
              เร็วๆ นี้
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Assignment sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              สถานะ & Audit Log
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              ดูสถานะ PO และประวัติการเปลี่ยนแปลง
            </Typography>
            <Button
              variant="contained"
              fullWidth
              component={Link}
              href="/components-showcase"
            >
              ดูตัวอย่าง
            </Button>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 6, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          ฟีเจอร์ที่พัฒนาแล้ว
        </Typography>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>หน้า Preview & แก้ไข PO พร้อมระบบสิทธิ์ตามบทบาทผู้ใช้</li>
          <li>หน้ารายการ PO พร้อมการค้นหา กรอง และเรียงลำดับข้อมูล</li>
          <li>ระบบจัดการวัสดุและชื่อเทียบเท่าสำหรับวัสดุลับ</li>
          <li>การแสดงข้อมูล PO ทั้งหมดที่จะส่งให้ vendor</li>
          <li>ระบบ validation และ error handling</li>
          <li>Responsive design รองรับ desktop และ mobile</li>
          <li>Loading และ error states</li>
          <li>ยืนยันการกระทำผ่าน confirmation dialog</li>
        </ul>
      </Box>
    </Container>
  );
}

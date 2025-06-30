import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ - Purchase Order Management System",
  description: "เข้าสู่ระบบจัดการใบสั่งซื้อ",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from './providers';
import { MainLayout } from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: "Purchase Order Management System",
  description: "ระบบจัดการใบสั่งซื้อ (Purchase Order)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
        </Providers>
      </body>
    </html>
  );
}

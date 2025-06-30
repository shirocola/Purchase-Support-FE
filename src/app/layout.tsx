import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}

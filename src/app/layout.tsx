import type { Metadata } from 'next'
import { QueryProvider } from '@/lib/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Purchase Support System',
  description: 'Purchase Order Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
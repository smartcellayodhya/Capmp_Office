import type { Metadata } from 'next'
import './globals.css'
import { DashboardLayoutWrapper } from '@/components/DashboardLayoutWrapper'

export const metadata: Metadata = {
  title: 'Ayodhya Police | Camp Office Portal',
  description: 'Force Management, Posting Overstay Tracker & Personnel Analytics Portal for Camp Office, SSP Ayodhya.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased font-sans">
        <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>
      </body>
    </html>
  )
}

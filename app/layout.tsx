import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UP Police Force Management System | Headquarters Lucknow',
  description: 'Advanced Force Management, Posting Overstay Tracker & Cadre Analytics Dashboard for Uttar Pradesh Police.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-police-950 text-slate-100 flex min-h-screen`}>
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-police-950 via-police-900 to-police-950">
          <Header />
          <main className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

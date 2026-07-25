import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

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
      <body className="bg-slate-50 text-slate-900 flex min-h-screen antialiased font-sans selection:bg-blue-600 selection:text-white">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          <Header />
          <main className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

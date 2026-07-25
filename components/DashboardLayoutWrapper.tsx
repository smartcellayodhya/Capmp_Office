'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

export function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  if (isLoginPage) {
    return <main className="w-full min-h-screen">{children}</main>
  }

  return (
    <div className="flex min-h-screen w-full antialiased font-sans selection:bg-blue-600 selection:text-white bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <Header />
        <main className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

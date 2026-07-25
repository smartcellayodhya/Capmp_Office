'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Building2,
  FileText,
  Award,
  Shield,
  ChevronRight
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Live Dashboard',
      href: '/dashboard/live',
      icon: LayoutDashboard,
    },
    {
      name: 'Gazetted Officers (GOs)',
      href: '/dashboard/gazetted',
      icon: ShieldCheck,
    },
    {
      name: 'Non-Gazetted (NGOs)',
      href: '/dashboard/non-gazetted',
      icon: Users,
    },
    {
      name: 'Camp Office Staff',
      href: '/dashboard/staff',
      icon: Building2,
    },
    {
      name: 'Transfer Applications',
      href: '/dashboard/transfers',
      icon: FileText,
    },
    {
      name: 'Nodal Officer Duties',
      href: '/dashboard/nodal',
      icon: Award,
    },
  ]

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between shrink-0 shadow-xs selection:bg-blue-600 selection:text-white">
      <div>
        {/* Ayodhya Police Portal Branding Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md shrink-0">
            <Shield className="w-6 h-6 text-white fill-white/20" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
              Ayodhya Police
            </h1>
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-0.5">
              Camp Office Portal
            </p>
          </div>
        </div>

        {/* Module Navigation List */}
        <div className="p-4 space-y-1.5">
          <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            Command Modules
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard/live')
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 group ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-white opacity-80" />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900 text-[11px]">SSP Ayodhya</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[10px] text-slate-500 font-semibold">
            HQ Command Active
          </p>
        </div>
      </div>
    </aside>
  )
}

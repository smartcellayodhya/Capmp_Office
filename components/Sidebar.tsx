'use client'

import { useState } from 'react'
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
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Settings,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard/live',
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: 'Gazetted Officers',
      href: '/dashboard/gazetted',
      icon: ShieldCheck,
      badge: 'IPS/PPS'
    },
    {
      name: 'Non-Gazetted (NGOs)',
      href: '/dashboard/non-gazetted',
      icon: Users,
      badge: null
    },
    {
      name: 'Camp Office Staff',
      href: '/dashboard/staff',
      icon: Building2,
      badge: null
    },
    {
      name: 'Transfers',
      href: '/dashboard/transfers',
      icon: FileText,
      badge: 'Action'
    },
    {
      name: 'Nodal Officer Duties',
      href: '/dashboard/nodal',
      icon: Award,
      badge: null
    },
  ]

  return (
    <aside
      className={`bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between shrink-0 shadow-xs transition-all duration-300 z-30 sticky top-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Branding & Collapse Toggle */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md shrink-0">
              <Shield className="w-6 h-6 text-white fill-white/20" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                  Ayodhya Police
                </h1>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-0.5">
                  Command & Control
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Command Modules Menu */}
        <div className="p-3 space-y-1.5">
          {!collapsed && (
            <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Command Modules
            </p>
          )}

          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard/live')
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`flex items-center justify-between px-3 py-3 rounded-xl text-xs font-bold transition-all duration-200 group ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </div>

                {!collapsed && (
                  <div className="flex items-center gap-1">
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white opacity-80" />}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        {!collapsed ? (
          <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-[11px]">SSP Ayodhya</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-500 font-semibold">
              Command HQ Active
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center p-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  )
}

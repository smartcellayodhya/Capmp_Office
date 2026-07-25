'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ShieldAlert, 
  Users, 
  UserCheck, 
  FileText, 
  Award, 
  Database, 
  ChevronRight,
  ShieldCheck,
  Briefcase
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Gazetted Officers (GOs)',
      path: '/dashboard/gazetted',
      icon: ShieldCheck,
      badge: 'IPS / PPS',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      name: 'Non-Gazetted (NGOs)',
      path: '/dashboard/non-gazetted',
      icon: Users,
      badge: 'SHO / SI / HC',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    {
      name: 'Transfer Applications',
      path: '/dashboard/transfers',
      icon: FileText,
      badge: 'Requests',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      name: 'Nodal Officer Duties',
      path: '/dashboard/nodal',
      icon: Award,
      badge: 'Special',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    }
  ]

  return (
    <aside className="w-72 bg-police-900 border-r border-police-700/60 text-slate-100 flex flex-col justify-between h-screen sticky top-0 z-30 shadow-2xl">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-police-700/60 bg-gradient-to-r from-police-950 via-police-900 to-police-850 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-police-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-wider text-base bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent">
                UP POLICE
              </span>
              <span className="text-[10px] font-semibold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                HQ
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Force Management Portal</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-4 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Officer Tiers & Cadres
            </p>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.path || (item.path === '/dashboard/gazetted' && pathname === '/')
                const Icon = item.icon

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-police-700 to-police-800 text-white shadow-lg shadow-police-950/50 border border-police-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-police-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                      {isActive && <ChevronRight className="w-4 h-4 text-amber-400" />}
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick System Stats
            </p>
            <div className="px-3 py-3 rounded-xl bg-police-850/80 border border-police-700/50 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" /> Gazetted Strength:
                </span>
                <span className="font-semibold text-amber-300">6 Active</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" /> Non-Gazetted Strength:
                </span>
                <span className="font-semibold text-emerald-400">9 Active</span>
              </div>
              <div className="w-full bg-police-700/50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full w-[60%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-police-700/60 bg-police-950/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-police-700 flex items-center justify-center text-amber-400 font-bold text-xs">
              UPP
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Directorate PHQ</p>
              <p className="text-[10px] text-slate-400">Supabase Connected</p>
            </div>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Live
          </span>
        </div>
      </div>
    </aside>
  )
}

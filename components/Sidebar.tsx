'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { 
  ShieldAlert, 
  Users, 
  FileText, 
  Award, 
  ChevronRight,
  ShieldCheck,
  Briefcase,
  Loader2
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

  // Dynamic counts fetched live from Supabase officers table
  const [gazettedCount, setGazettedCount] = useState<number>(0)
  const [nonGazettedCount, setNonGazettedCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    async function fetchCounts() {
      try {
        setLoading(true)

        // Query count for Gazetted Officers (officer_tier = 'Gazetted')
        const { count: gCount, error: gError } = await supabase
          .from('officers')
          .select('*', { count: 'exact', head: true })
          .eq('officer_tier', 'Gazetted')

        if (gError) {
          console.error('Supabase Error [Sidebar Gazetted Count]:', gError.message, gError)
        }

        // Query count for Non-Gazetted Officers (officer_tier = 'Non-Gazetted')
        const { count: ngCount, error: ngError } = await supabase
          .from('officers')
          .select('*', { count: 'exact', head: true })
          .eq('officer_tier', 'Non-Gazetted')

        if (ngError) {
          console.error('Supabase Error [Sidebar Non-Gazetted Count]:', ngError.message, ngError)
        }

        if (isMounted) {
          setGazettedCount(gCount || 0)
          setNonGazettedCount(ngCount || 0)
        }
      } catch (err) {
        console.error('Catch Error [Sidebar Counts]:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchCounts()

    return () => {
      isMounted = false
    }
  }, [pathname])

  const navItems = [
    {
      name: 'Gazetted Officers (GOs)',
      path: '/dashboard/gazetted',
      icon: ShieldCheck,
      badge: 'IPS / PPS',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    {
      name: 'Non-Gazetted (NGOs)',
      path: '/dashboard/non-gazetted',
      icon: Users,
      badge: 'SHO / SI / HC',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      name: 'Transfer Applications',
      path: '/dashboard/transfers',
      icon: FileText,
      badge: 'Requests',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      name: 'Nodal Officer Duties',
      path: '/dashboard/nodal',
      icon: Award,
      badge: 'Special',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
    }
  ]

  const totalStrength = gazettedCount + nonGazettedCount
  const gazettedPercentage = totalStrength > 0 ? Math.round((gazettedCount / totalStrength) * 100) : 50

  return (
    <aside className="w-72 bg-white border-r border-slate-200 text-slate-800 flex flex-col justify-between h-screen sticky top-0 z-30 shadow-sm">
      <div>
        {/* Rebranded Logo & Header for Ayodhya Police */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-wider text-base text-amber-300">
                Ayodhya Police
              </span>
              <span className="text-[10px] font-semibold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                DISTRICT
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">Camp Office Portal</p>
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
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                      {isActive && <ChevronRight className="w-4 h-4 text-blue-600" />}
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Quick System Stats - Light Theme */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Quick System Stats</span>
              {loading && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
            </p>
            <div className="px-3.5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Gazetted Strength:
                </span>
                <span className="font-bold text-slate-900">
                  {loading ? '...' : `${gazettedCount} Active`}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-emerald-600" /> Non-Gazetted Strength:
                </span>
                <span className="font-bold text-emerald-700">
                  {loading ? '...' : `${nonGazettedCount} Active`}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${gazettedPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center text-amber-400 font-bold text-xs shadow-sm">
              AYO
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Camp Office Ayodhya</p>
              <p className="text-[10px] text-slate-500 font-medium">Supabase Connected</p>
            </div>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Live
          </span>
        </div>
      </div>
    </aside>
  )
}

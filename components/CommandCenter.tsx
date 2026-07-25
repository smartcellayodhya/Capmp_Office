'use client'

import { OfficerWithCalculated } from '@/types/police'
import { 
  AlertTriangle, 
  UserX, 
  FileText, 
  Clock, 
  UserPlus, 
  PhoneOff, 
  FileSpreadsheet,
  ChevronRight,
  ShieldAlert
} from 'lucide-react'

interface CommandCenterProps {
  officers: OfficerWithCalculated[]
  pendingAppsCount: number
  onSelectFilter: (filterKey: string) => void
  activeFilter: string
}

export function CommandCenter({
  officers,
  pendingAppsCount,
  onSelectFilter,
  activeFilter
}: CommandCenterProps) {
  // Calculated Alert Counts
  const suspendedCount = officers.filter((o) => o.status === 'Suspended').length
  const retiringCount = officers.filter((o) => o.isRetiringSoon || o.retirementMonthsRemaining <= 12).length
  const missingMobileCount = officers.filter((o) => !o.mobile_number || o.mobile_number === 'N/A' || o.mobile_number.length < 10).length
  const incompleteProfileCount = officers.filter((o) => !o.dob || !o.joining_date || o.seat_assigned === 'Unassigned Desk').length
  const overstayCount = officers.filter((o) => o.isOverstay && o.status !== 'Suspended').length

  const alerts = [
    {
      id: 'SUSPENDED',
      title: 'Suspended Officers',
      count: suspendedCount,
      color: 'bg-rose-500/10 border-rose-500/30 text-rose-700',
      badgeBg: 'bg-rose-600 text-white',
      icon: UserX,
      pulse: suspendedCount > 0,
      description: 'Departmental inquiry & suspension roster',
    },
    {
      id: 'PENDING_TRANSFERS',
      title: 'Pending Transfers',
      count: pendingAppsCount,
      color: 'bg-amber-500/10 border-amber-500/30 text-amber-800',
      badgeBg: 'bg-amber-600 text-white',
      icon: FileText,
      pulse: pendingAppsCount > 0,
      description: 'Awaiting decision by SSP Command Office',
    },
    {
      id: 'RETIRING_SOON',
      title: 'Retiring Soon',
      count: retiringCount,
      color: 'bg-orange-500/10 border-orange-500/30 text-orange-800',
      badgeBg: 'bg-orange-600 text-white',
      icon: Clock,
      pulse: retiringCount > 0,
      description: 'Retirement due within next 12 months',
    },
    {
      id: 'OVERSTAY',
      title: 'Tenure Overstay (>36m)',
      count: overstayCount,
      color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-800',
      badgeBg: 'bg-indigo-600 text-white',
      icon: AlertTriangle,
      pulse: overstayCount > 0,
      description: 'Posting tenure exceeding 36 months',
    },
    {
      id: 'MISSING_MOBILE',
      title: 'Missing Mobile Numbers',
      count: missingMobileCount,
      color: 'bg-blue-500/10 border-blue-500/30 text-blue-800',
      badgeBg: 'bg-blue-600 text-white',
      icon: PhoneOff,
      pulse: false,
      description: 'Contact record missing or unverified',
    },
    {
      id: 'INCOMPLETE_PROFILES',
      title: 'Incomplete Profiles',
      count: incompleteProfileCount,
      color: 'bg-slate-500/10 border-slate-500/30 text-slate-800',
      badgeBg: 'bg-slate-700 text-white',
      icon: FileSpreadsheet,
      pulse: false,
      description: 'Profile details require clerk review',
    },
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-xs">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              Today's Operational Command Center
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Real-time operational alerts requiring immediate decision & administrative review
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live HQ Monitor
          </span>
        </div>
      </div>

      {/* Grid of Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        {alerts.map((item) => {
          const Icon = item.icon
          const isSelected = activeFilter === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectFilter(item.id)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${item.color} ${
                isSelected ? 'ring-2 ring-slate-900 shadow-md scale-[1.02]' : 'hover:shadow-md'
              }`}
            >
              {/* Pulse Light */}
              {item.pulse && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                </span>
              )}

              <div className="flex items-center justify-between mb-2">
                <Icon className="w-4 h-4" />
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${item.badgeBg}`}>
                  {item.count}
                </span>
              </div>

              <h3 className="text-xs font-extrabold text-slate-900 leading-tight">
                {item.title}
              </h3>

              <p className="text-[10px] text-slate-600 font-medium mt-1 line-clamp-2">
                {item.description}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] font-bold group-hover:text-blue-700 transition-colors">
                <span>View Details</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

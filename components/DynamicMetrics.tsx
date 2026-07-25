'use client'

import { OfficerTier } from '@/types/supabase'
import { OfficerWithCalculated } from '@/types/police'
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Award, 
  AlertTriangle, 
  Clock, 
  FileCheck, 
  MapPin, 
  Building2 
} from 'lucide-react'

interface DynamicMetricsProps {
  tier: OfficerTier
  officers: OfficerWithCalculated[]
  pendingApplicationsCount?: number
  activeNodalCount?: number
}

export function DynamicMetrics({
  tier,
  officers = [],
  pendingApplicationsCount = 0,
  activeNodalCount = 0
}: DynamicMetricsProps) {
  const isGazetted = tier === 'Gazetted'

  // Filter officers for active tier using snake_case officer_tier
  const tierOfficers = officers.filter((o) => (o.officer_tier || 'Non-Gazetted') === tier)

  // Calculations for Gazetted View
  const totalGOs = tierOfficers.length
  const activeCOs = tierOfficers.filter((o) => {
    const role = (o.role_type || '').toLowerCase()
    const r = (o.rank || '').toLowerCase()
    return role.includes('circle officer') || r.includes('circle officer') || r.includes('deputy sp') || r.includes('dsp') || r.includes('co')
  }).length

  const addlSPs = tierOfficers.filter((o) => {
    const r = (o.rank || '').toLowerCase()
    return r.includes('addl sp') || r.includes('additional superintendent')
  }).length

  // Calculations for Non-Gazetted View
  const totalNGOs = tierOfficers.length
  const activeSHOs = tierOfficers.filter((o) => {
    const role = (o.role_type || '').toLowerCase()
    const r = (o.rank || '').toLowerCase()
    return role.includes('thana prabhari') || r.includes('sho') || r.includes('inspector')
  }).length

  const chowkiIncharges = tierOfficers.filter((o) => {
    const role = (o.role_type || '').toLowerCase()
    return role.includes('chowki incharge')
  }).length

  // Universal alerts
  const overstayCount = tierOfficers.filter((o) => o.isOverstay).length
  const retiringSoonCount = tierOfficers.filter((o) => o.isRetiringSoon).length

  const gazettedMetrics = [
    {
      title: 'Total GOs (IPS / PPS)',
      value: totalGOs,
      subtitle: `${overstayCount} Overstay (>36 Mos) Flagged`,
      icon: ShieldCheck,
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      badge: 'Gazetted Cadre',
      badgeColor: 'text-amber-400 bg-amber-400/10'
    },
    {
      title: 'Active Circle Officers (COs)',
      value: activeCOs,
      subtitle: 'Sub-Divisional Law & Order Heads',
      icon: Building2,
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      badge: 'CO / DSP Rank',
      badgeColor: 'text-blue-400 bg-blue-400/10'
    },
    {
      title: 'Addl SPs Posted',
      value: addlSPs,
      subtitle: 'District & Wing Chiefs',
      icon: Briefcase,
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      badge: 'Senior PPS',
      badgeColor: 'text-purple-400 bg-purple-400/10'
    },
    {
      title: 'Active Nodal Officers',
      value: activeNodalCount,
      subtitle: 'VIP Security, Cyber & Special Wings',
      icon: Award,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      badge: 'Special Duties',
      badgeColor: 'text-emerald-400 bg-emerald-400/10'
    }
  ]

  const nonGazettedMetrics = [
    {
      title: 'Total NGOs Active',
      value: totalNGOs,
      subtitle: `${overstayCount} Overstay (>36 Mos) Flagged`,
      icon: Users,
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      badge: 'NGO Cadre',
      badgeColor: 'text-blue-400 bg-blue-400/10'
    },
    {
      title: 'Active SHOs (Thana Prabhari)',
      value: activeSHOs,
      subtitle: 'Station House Officers',
      icon: Building2,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      badge: 'Inspectors',
      badgeColor: 'text-emerald-400 bg-emerald-400/10'
    },
    {
      title: 'Chowki Incharges',
      value: chowkiIncharges,
      subtitle: 'Outpost & Sector Commanders',
      icon: MapPin,
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      badge: 'Sub-Inspectors',
      badgeColor: 'text-purple-400 bg-purple-400/10'
    },
    {
      title: 'Pending Transfer Apps',
      value: pendingApplicationsCount,
      subtitle: 'Awaiting PHQ Approval',
      icon: FileCheck,
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      badge: 'Requires Action',
      badgeColor: 'text-rose-400 bg-rose-400/10'
    }
  ]

  const currentMetrics = isGazetted ? gazettedMetrics : nonGazettedMetrics

  return (
    <div className="space-y-4">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentMetrics.map((m, idx) => {
          const Icon = m.icon
          return (
            <div
              key={idx}
              className="bg-police-900/80 backdrop-blur-sm border border-police-700/60 rounded-2xl p-5 shadow-lg hover:border-police-600 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${m.badgeColor}`}>
                  {m.badge}
                </span>
                <div className={`p-2.5 rounded-xl border ${m.iconBg} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">{m.value}</h3>
              <p className="text-xs font-semibold text-slate-300 mt-1">{m.title}</p>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                {m.subtitle}
              </p>
            </div>
          )
        })}
      </div>

      {/* Critical Alert Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-police-900 to-amber-950/40 border border-red-500/30 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-200">
              Tenure & Retirement Automated Alert Engine
            </p>
            <p className="text-slate-400 text-[11px]">
              Found <strong className="text-red-400">{overstayCount} officer(s)</strong> exceeding 36 months in current posting and{' '}
              <strong className="text-amber-400">{retiringSoonCount} officer(s)</strong> retiring within 12 months in this active tier.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 font-semibold border border-red-500/40 text-[11px] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {overstayCount} Overstay Due
          </span>
        </div>
      </div>
    </div>
  )
}

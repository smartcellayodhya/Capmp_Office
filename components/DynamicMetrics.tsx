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

  // Filter officers for active tier
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
      iconBg: 'bg-amber-100 text-amber-800 border-amber-200',
      badge: 'Gazetted Cadre',
      badgeColor: 'text-amber-800 bg-amber-50 border border-amber-200'
    },
    {
      title: 'Active Circle Officers (COs)',
      value: activeCOs,
      subtitle: 'Sub-Divisional Law & Order Heads',
      icon: Building2,
      iconBg: 'bg-blue-100 text-blue-800 border-blue-200',
      badge: 'CO / DSP Rank',
      badgeColor: 'text-blue-800 bg-blue-50 border border-blue-200'
    },
    {
      title: 'Addl SPs Posted',
      value: addlSPs,
      subtitle: 'District & Wing Chiefs',
      icon: Briefcase,
      iconBg: 'bg-purple-100 text-purple-800 border-purple-200',
      badge: 'Senior PPS',
      badgeColor: 'text-purple-800 bg-purple-50 border border-purple-200'
    },
    {
      title: 'Active Nodal Officers',
      value: activeNodalCount,
      subtitle: 'VIP Security, Cyber & Special Wings',
      icon: Award,
      iconBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      badge: 'Special Duties',
      badgeColor: 'text-emerald-800 bg-emerald-50 border border-emerald-200'
    }
  ]

  const nonGazettedMetrics = [
    {
      title: 'Total NGOs Active',
      value: totalNGOs,
      subtitle: `${overstayCount} Overstay (>36 Mos) Flagged`,
      icon: Users,
      iconBg: 'bg-blue-100 text-blue-800 border-blue-200',
      badge: 'NGO Cadre',
      badgeColor: 'text-blue-800 bg-blue-50 border border-blue-200'
    },
    {
      title: 'Active SHOs (Thana Prabhari)',
      value: activeSHOs,
      subtitle: 'Station House Officers',
      icon: Building2,
      iconBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      badge: 'Inspectors',
      badgeColor: 'text-emerald-800 bg-emerald-50 border border-emerald-200'
    },
    {
      title: 'Chowki Incharges',
      value: chowkiIncharges,
      subtitle: 'Outpost & Sector Commanders',
      icon: MapPin,
      iconBg: 'bg-purple-100 text-purple-800 border-purple-200',
      badge: 'Sub-Inspectors',
      badgeColor: 'text-purple-800 bg-purple-50 border border-purple-200'
    },
    {
      title: 'Pending Transfer Apps',
      value: pendingApplicationsCount,
      subtitle: 'Awaiting Camp Office Approval',
      icon: FileCheck,
      iconBg: 'bg-rose-100 text-rose-800 border-rose-200',
      badge: 'Requires Action',
      badgeColor: 'text-rose-800 bg-rose-50 border border-rose-200'
    }
  ]

  const currentMetrics = isGazetted ? gazettedMetrics : nonGazettedMetrics

  return (
    <div className="space-y-4">
      {/* Metric Cards Grid - Light Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentMetrics.map((m, idx) => {
          const Icon = m.icon
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${m.badgeColor}`}>
                  {m.badge}
                </span>
                <div className={`p-2.5 rounded-xl border ${m.iconBg} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{m.value}</h3>
              <p className="text-xs font-bold text-slate-800 mt-1">{m.title}</p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center gap-1">
                {m.subtitle}
              </p>
            </div>
          )
        })}
      </div>

      {/* Critical Alert Bar - Crisp Light Theme */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-200/60 text-amber-900 border border-amber-300/80 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="font-extrabold text-amber-950">
              Tenure & Retirement Automated Alert Engine
            </p>
            <p className="text-amber-800 text-[11px] font-medium">
              Found <strong className="text-rose-700 font-bold">{overstayCount} officer(s)</strong> exceeding 36 months in current posting and{' '}
              <strong className="text-amber-900 font-bold">{retiringSoonCount} officer(s)</strong> retiring within 12 months in this active tier.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="px-3 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold border border-rose-300 text-[11px] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {overstayCount} Overstay Due
          </span>
        </div>
      </div>
    </div>
  )
}

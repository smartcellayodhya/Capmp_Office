'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getAllOfficers } from '@/services/database'
import { enrichOfficerData } from '@/lib/policeUtils'
import { getCachedOfficers, setCachedOfficers } from '@/lib/cache'
import { OfficerWithCalculated } from '@/types/police'
import { ChartsSection } from '@/components/ChartsSection'
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  AlertTriangle,
  RefreshCw,
  Loader2,
  ChevronRight,
  Clock,
  Briefcase,
  UserX,
  MapPin
} from 'lucide-react'
import Link from 'next/link'

export default function LiveDashboardPage() {
  const [allOfficers, setAllOfficers] = useState<OfficerWithCalculated[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fast fetch using 0ms Instant Cache + SWR
  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true)

    // Step 1: Instant cache load (0ms)
    const cached = getCachedOfficers()
    if (cached && cached.length > 0) {
      setAllOfficers(cached)
      setLoading(false)
    }

    // Step 2: Background sync from Supabase
    try {
      const { data, error } = await getAllOfficers()
      if (error) {
        if (!cached || cached.length === 0) setErrorMessage(error.message)
      } else if (data) {
        const enriched = data.map((o) => enrichOfficerData(o))
        setAllOfficers(enriched)
        setCachedOfficers(enriched)
        setErrorMessage(null)
      }
    } catch (err: any) {
      console.error('Background sync notice:', err)
      if (!cached || cached.length === 0) setErrorMessage(err.message || 'Fetch failed')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Active force list (excluding status === 'Transferred')
  const activeForce = useMemo(() => {
    return allOfficers.filter((o) => o.status !== 'Transferred')
  }, [allOfficers])

  // High-Level Administrative Metrics
  const metrics = useMemo(() => {
    const totalForce = activeForce.length

    // Gazetted Officers (GOs)
    const gosCount = activeForce.filter((o) => o.officer_tier === 'Gazetted' && o.status !== 'Suspended').length

    // Non-Gazetted (NGOs)
    const ngosCount = activeForce.filter((o) => o.officer_tier === 'Non-Gazetted' && o.status !== 'Suspended').length

    // Thana Prabhari (SHO / SO)
    const thanaPrabhariCount = activeForce.filter((o) => {
      const d = (o.smartDutyDisplay || o.specialDuty || '').toLowerCase()
      return (d.includes('sho') || d.includes('so') || d.includes('thana prabhari')) && o.status !== 'Suspended'
    }).length

    // Chowki Incharges
    const chowkiInchargeCount = activeForce.filter((o) => {
      const d = (o.smartDutyDisplay || o.specialDuty || '').toLowerCase()
      return d.includes('chowki incharge') && o.status !== 'Suspended'
    }).length

    // Suspended Personnel
    const suspendedCount = allOfficers.filter((o) => o.status === 'Suspended').length

    // Overstay & Retirement
    const overstayCount = activeForce.filter((o) => o.isOverstay && o.status !== 'Suspended').length
    const retiringSoonCount = activeForce.filter((o) => o.isRetiringSoon).length

    return {
      totalForce,
      gosCount,
      ngosCount,
      thanaPrabhariCount,
      chowkiInchargeCount,
      suspendedCount,
      overstayCount,
      retiringSoonCount
    }
  }, [allOfficers, activeForce])

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            📊 Executive Analytics Command Dashboard
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            District Force Analytics, Cadre Breakdown & Field Leadership • Camp Office, SSP Ayodhya
          </p>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors border border-slate-300 shadow-sm self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{refreshing ? 'Syncing...' : 'Refresh Roster'}</span>
        </button>
      </div>

      {loading && allOfficers.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-bold text-slate-900">Loading Personnel Analytics...</p>
        </div>
      ) : errorMessage && allOfficers.length === 0 ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
          <div className="flex-1">
            <p className="font-extrabold text-rose-950">Notice</p>
            <p className="text-xs text-rose-800 font-medium mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={() => loadData(true)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* 1. HIGH-LEVEL ADMINISTRATIVE METRIC CARDS (Exact 6 vibrant cards - Instruction 1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Card 1: Total Force */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Force</span>
                <Briefcase className="w-5 h-5 text-slate-300" />
              </div>
              <h3 className="text-3xl font-black tracking-tight">{metrics.totalForce}</h3>
              <p className="text-[11px] font-bold text-slate-300 mt-1">Entire Active Roster</p>
            </div>

            {/* Card 2: Gazetted Officers (GOs) */}
            <Link
              href="/dashboard/gazetted"
              className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Gazetted GOs</span>
                <ShieldCheck className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-3xl font-black tracking-tight">{metrics.gosCount}</h3>
              <p className="text-[11px] font-bold opacity-90 mt-1 flex items-center justify-between">
                <span>IPS / PPS Leaders</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </p>
            </Link>

            {/* Card 3: Non-Gazetted (NGOs) */}
            <Link
              href="/dashboard/non-gazetted"
              className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Non-Gazetted</span>
                <Users className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-3xl font-black tracking-tight">{metrics.ngosCount}</h3>
              <p className="text-[11px] font-bold opacity-90 mt-1 flex items-center justify-between">
                <span>Inspectors & Field Force</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </p>
            </Link>

            {/* Card 4: Thana Prabhari (SHO/SO) */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Thana Prabhari</span>
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-3xl font-black tracking-tight">{metrics.thanaPrabhariCount}</h3>
              <p className="text-[11px] font-bold opacity-90 mt-1">SHO / SO Station Chiefs</p>
            </div>

            {/* Card 5: Chowki Incharges */}
            <div className="bg-gradient-to-br from-purple-600 via-indigo-700 to-indigo-900 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Chowki Incharges</span>
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-3xl font-black tracking-tight">{metrics.chowkiInchargeCount}</h3>
              <p className="text-[11px] font-bold opacity-90 mt-1">Outpost Commanders</p>
            </div>

            {/* Card 6: Suspended (Red Background) */}
            <div className="bg-gradient-to-br from-rose-600 via-red-700 to-red-900 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Suspended</span>
                <UserX className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-3xl font-black tracking-tight">{metrics.suspendedCount}</h3>
              <p className="text-[11px] font-bold opacity-90 mt-1">Disciplinary Action</p>
            </div>
          </div>

          {/* Automated Tenure & Retirement Alert Banner */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-200/60 text-amber-900 border border-amber-300/80 shrink-0">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="font-extrabold text-amber-950">
                  Tenure & Retirement Automated Alert Engine
                </p>
                <p className="text-amber-800 text-[11px] font-medium">
                  Flagged <strong className="text-rose-700 font-bold">{metrics.overstayCount} officer(s)</strong> exceeding 36 months in current posting and{' '}
                  <strong className="text-amber-900 font-bold">{metrics.retiringSoonCount} officer(s)</strong> retiring within 12 months across active district cadres.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <span className="px-3 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold border border-rose-300 text-[11px] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {metrics.overstayCount} Overstay Flagged
              </span>
            </div>
          </div>

          {/* 2. RESTORED ANALYTICAL CHARTS (Instruction 2) */}
          <ChartsSection officers={activeForce} tierName="Entire District Force" />
        </>
      )}
    </div>
  )
}

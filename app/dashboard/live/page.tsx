'use client'

import { useState, useEffect, useCallback } from 'react'
import { getOfficersByTier, getPostingApplications, getNodalOfficers } from '@/services/database'
import { enrichOfficerData } from '@/lib/policeUtils'
import { OfficerWithCalculated } from '@/types/police'
import { ChartsSection } from '@/components/ChartsSection'
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  FileText, 
  Award, 
  AlertTriangle,
  RefreshCw,
  Loader2,
  ChevronRight,
  Clock,
  Briefcase
} from 'lucide-react'
import Link from 'next/link'

export default function LiveDashboardPage() {
  const [allOfficers, setAllOfficers] = useState<OfficerWithCalculated[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [pendingAppsCount, setPendingAppsCount] = useState<number>(0)
  const [nodalCount, setNodalCount] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    const timeoutPromise = new Promise<{ timeout: true }>((resolve) =>
      setTimeout(() => resolve({ timeout: true }), 8000)
    )

    try {
      const fetchPromise = Promise.all([
        getOfficersByTier('Gazetted'),
        getOfficersByTier('Non-Gazetted'),
        getOfficersByTier('Camp Staff'),
        getPostingApplications(),
        getNodalOfficers()
      ])

      const result = await Promise.race([fetchPromise, timeoutPromise])

      if ('timeout' in result) {
        console.warn('Live Dashboard query timed out')
        setErrorMessage('Connection timed out. Click Refresh Roster to try again.')
        setAllOfficers([])
        return
      }

      const [gosRes, ngosRes, staffRes, appsRes, nodalsRes] = result

      const combined = [
        ...(gosRes.data || []),
        ...(ngosRes.data || []),
        ...(staffRes.data || [])
      ].map((o) => enrichOfficerData(o))

      setAllOfficers(combined)
      if (appsRes.data) setPendingAppsCount(appsRes.data.filter((a) => a.status === 'Pending').length)
      if (nodalsRes.data) setNodalCount(nodalsRes.data.length)
    } catch (err: any) {
      console.error('Error loading live dashboard analytics:', err)
      setErrorMessage(err.message || 'Failed to load executive summary')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Active force metrics (excluding status === 'Transferred')
  const activeOfficers = allOfficers.filter((o) => o.status !== 'Transferred')
  const goOfficers = activeOfficers.filter((o) => o.officer_tier === 'Gazetted')
  const ngoOfficers = activeOfficers.filter((o) => o.officer_tier === 'Non-Gazetted')
  const staffOfficers = activeOfficers.filter((o) => o.officer_tier === 'Camp Staff')

  const totalActiveForce = activeOfficers.length
  const overstayCount = activeOfficers.filter((o) => o.isOverstay).length
  const retiringSoonCount = activeOfficers.filter((o) => o.isRetiringSoon).length

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            📊 Executive Analytics Command Dashboard
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            District Force Analytics, Personnel Distribution & Automated Alert Engine • Camp Office, SSP Ayodhya
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors border border-slate-300 shadow-sm self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Roster</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-bold text-slate-900">Loading Personnel Records...</p>
          <p className="text-xs text-slate-500 font-medium">Aggregating Force Analytics & Cadre Strength</p>
        </div>
      ) : errorMessage ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
          <div className="flex-1">
            <p className="font-extrabold text-rose-950">Notice</p>
            <p className="text-xs text-rose-800 font-medium mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Summary Executive Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Total Force Strength */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                  Total Active
                </span>
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                  <Briefcase className="w-5 h-5 text-slate-700" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalActiveForce}</h3>
              <p className="text-xs font-bold text-slate-800 mt-1">Total Force Strength</p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">All Cadres Active</p>
            </div>

            {/* Card 2: Gazetted GOs */}
            <Link
              href="/dashboard/gazetted"
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  GO Cadre
                </span>
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{goOfficers.length}</h3>
              <p className="text-xs font-bold text-slate-800 mt-1">Gazetted Officers (GOs)</p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center justify-between">
                <span>IPS / PPS Leaders</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
              </p>
            </Link>

            {/* Card 3: Non-Gazetted NGOs */}
            <Link
              href="/dashboard/non-gazetted"
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  NGO Cadre
                </span>
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800 border border-blue-200 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{ngoOfficers.length}</h3>
              <p className="text-xs font-bold text-slate-800 mt-1">Non-Gazetted (NGOs)</p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center justify-between">
                <span>Inspectors & Field Force</span>
                <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
              </p>
            </Link>

            {/* Card 4: Camp Office Staff */}
            <Link
              href="/dashboard/staff"
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  Secretariat
                </span>
                <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800 border border-teal-200 group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{staffOfficers.length}</h3>
              <p className="text-xs font-bold text-slate-800 mt-1">Camp Office Staff</p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center justify-between">
                <span>Secretariat & Desks</span>
                <ChevronRight className="w-3.5 h-3.5 text-teal-600" />
              </p>
            </Link>

            {/* Card 5: Pending Transfer Requests */}
            <Link
              href="/dashboard/transfers"
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  Action Due
                </span>
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-800 border border-rose-200 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{pendingAppsCount}</h3>
              <p className="text-xs font-bold text-slate-800 mt-1">Pending Transfers</p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center justify-between">
                <span>Awaiting Decision</span>
                <ChevronRight className="w-3.5 h-3.5 text-rose-600" />
              </p>
            </Link>
          </div>

          {/* Automated Tenure & Retirement Alert Engine */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-200/60 text-amber-900 border border-amber-300/80 shrink-0">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="font-extrabold text-amber-950">
                  Tenure & Retirement Automated Alert Engine
                </p>
                <p className="text-amber-800 text-[11px] font-medium">
                  Flagged <strong className="text-rose-700 font-bold">{overstayCount} officer(s)</strong> exceeding 36 months in current posting and{' '}
                  <strong className="text-amber-900 font-bold">{retiringSoonCount} officer(s)</strong> retiring within 12 months across active district cadres.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <span className="px-3 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold border border-rose-300 text-[11px] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {overstayCount} Overstay Flagged
              </span>
            </div>
          </div>

          {/* High-Level Recharts Analytics Visualizations */}
          <ChartsSection officers={activeOfficers} tierName="Entire District Force" />
        </>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { getOfficersByTier, getPostingApplications, getNodalOfficers } from '@/services/database'
import { enrichOfficerData } from '@/lib/policeUtils'
import { OfficerWithCalculated } from '@/types/police'
import { DynamicMetrics } from '@/components/DynamicMetrics'
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
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

export default function LiveDashboardPage() {
  const [allOfficers, setAllOfficers] = useState<OfficerWithCalculated[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [pendingAppsCount, setPendingAppsCount] = useState<number>(0)
  const [nodalCount, setNodalCount] = useState<number>(0)

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: gos } = await getOfficersByTier('Gazetted')
      const { data: ngos } = await getOfficersByTier('Non-Gazetted')
      const { data: staff } = await getOfficersByTier('Camp Staff')
      const { data: apps } = await getPostingApplications()
      const { data: nodals } = await getNodalOfficers()

      const combined = [
        ...(gos || []),
        ...(ngos || []),
        ...(staff || [])
      ].map((o) => enrichOfficerData(o))

      setAllOfficers(combined)
      if (apps) setPendingAppsCount(apps.filter((a) => a.status === 'Pending').length)
      if (nodals) setNodalCount(nodals.length)
    } catch (err) {
      console.error('Error loading live dashboard overview:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const goCount = allOfficers.filter((o) => o.officer_tier === 'Gazetted' && o.status !== 'Transferred').length
  const ngoCount = allOfficers.filter((o) => o.officer_tier === 'Non-Gazetted' && o.status !== 'Transferred').length
  const staffCount = allOfficers.filter((o) => o.officer_tier === 'Camp Staff' && o.status !== 'Transferred').length
  const overstayCount = allOfficers.filter((o) => o.isOverstay && o.status !== 'Transferred').length

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            📊 Live Executive Dashboard Overview
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            District Force Command Overview & Personnel Summary • Camp Office, SSP Ayodhya
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
          <p className="text-xs text-slate-500 font-medium">Preparing Executive Roster Summary</p>
        </div>
      ) : (
        <>
          {/* Executive Overview Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/gazetted"
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Gazetted Cadre
                </span>
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{goCount}</h3>
              <p className="text-xs font-bold text-slate-800 mt-1">Gazetted Officers (GOs)</p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center justify-between">
                <span>IPS / PPS Leadership</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
              </p>
            </Link>

            <Link
              href="/dashboard/non-gazetted"
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Field Force
                </span>
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800 border border-blue-200 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{ngoCount}</h3>
              <p className="text-xs font-bold text-slate-800 mt-1">Non-Gazetted Cadre (NGOs)</p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center justify-between">
                <span>Inspectors & Field Officers</span>
                <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
              </p>
            </Link>

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
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{staffCount}</h3>
              <p className="text-xs font-bold text-slate-800 mt-1">Camp Office Staff</p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center justify-between">
                <span>Secretariat & Desks</span>
                <ChevronRight className="w-3.5 h-3.5 text-teal-600" />
              </p>
            </Link>

            <Link
              href="/dashboard/transfers"
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  Action Required
                </span>
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-800 border border-rose-200 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{pendingAppsCount}</h3>
              <p className="text-xs font-bold text-slate-800 mt-1">Pending Transfer Requests</p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center justify-between">
                <span>Awaiting Decision</span>
                <ChevronRight className="w-3.5 h-3.5 text-rose-600" />
              </p>
            </Link>
          </div>

          {/* Overstay Warning Banner */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-200 text-amber-900 border border-amber-300 shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-800" />
              </div>
              <div>
                <p className="font-extrabold">District Posting Tenure Advisory</p>
                <p className="text-amber-800 text-[11px] font-medium">
                  Found <strong>{overstayCount} officer(s)</strong> exceeding 36 months in current posting across active district cadres.
                </p>
              </div>
            </div>
          </div>

          {/* Recharts Visualizations */}
          <ChartsSection officers={allOfficers} tierName="Entire District Force" />
        </>
      )}
    </div>
  )
}

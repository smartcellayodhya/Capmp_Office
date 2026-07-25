'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getAllOfficers } from '@/services/database'
import { enrichOfficerData } from '@/lib/policeUtils'
import { getCachedOfficers, setCachedOfficers } from '@/lib/cache'
import { OfficerWithCalculated } from '@/types/police'
import { ChartsSection } from '@/components/ChartsSection'
import { FloatingAIAssistant } from '@/components/FloatingAIAssistant'
import { AddOfficerModal } from '@/components/AddOfficerModal'
import { TimelineModal } from '@/components/TimelineModal'
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  AlertTriangle,
  Loader2,
  ChevronRight,
  Briefcase,
  UserX,
  MapPin
} from 'lucide-react'
import Link from 'next/link'

export default function LiveDashboardPage() {
  const [allOfficers, setAllOfficers] = useState<OfficerWithCalculated[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedOfficerForTimeline, setSelectedOfficerForTimeline] = useState<OfficerWithCalculated | null>(null)

  // Fast fetch using 0ms Instant Cache + SWR
  const loadData = useCallback(async (isManualRefresh = false) => {
    // Step 1: Instant cache load (0ms)
    const cached = getCachedOfficers()
    if (cached && cached.length > 0) {
      setAllOfficers(cached)
      setLoading(false)
    }

    // Step 2: Background sync from Supabase
    try {
      const officersRes = await getAllOfficers()

      if (officersRes.error) {
        if (!cached || cached.length === 0) setErrorMessage(officersRes.error.message)
      } else if (officersRes.data) {
        const enriched = officersRes.data.map((o) => enrichOfficerData(o))
        setAllOfficers(enriched)
        setCachedOfficers(enriched)
        setErrorMessage(null)
      }
    } catch (err: any) {
      console.error('Background sync notice:', err)
      if (!cached || cached.length === 0) setErrorMessage(err.message || 'Fetch failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Active force list
  const activeForce = useMemo(() => {
    return allOfficers.filter((o) => o.status !== 'Transferred')
  }, [allOfficers])

  // Executive KPI Counts
  const kpis = useMemo(() => {
    const total = activeForce.length
    const gos = activeForce.filter((o) => o.officer_tier === 'Gazetted' && o.status !== 'Suspended').length
    const ngos = activeForce.filter((o) => o.officer_tier === 'Non-Gazetted' && o.status !== 'Suspended').length
    const thanaPrabhari = activeForce.filter((o) => {
      const d = (o.smartDutyDisplay || o.specialDuty || '').toLowerCase()
      return (d.includes('sho') || d.includes('so') || d.includes('thana prabhari')) && o.status !== 'Suspended'
    }).length
    const chowkiIncharge = activeForce.filter((o) => {
      const d = (o.smartDutyDisplay || o.specialDuty || '').toLowerCase()
      return d.includes('chowki incharge') && o.status !== 'Suspended'
    }).length
    const suspended = allOfficers.filter((o) => o.status === 'Suspended').length

    return { total, gos, ngos, thanaPrabhari, chowkiIncharge, suspended }
  }, [allOfficers, activeForce])

  return (
    <div className="space-y-6 pb-12 pt-2">
      {loading && allOfficers.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-bold text-slate-900">Loading Command Dashboard Overview...</p>
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
          {/* ROW 1: THE 6 MAIN COLORED METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
            {/* 1. Total Force */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl text-white shadow-md flex flex-col justify-between h-32 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Force</span>
                <Briefcase className="w-4 h-4 text-slate-300" />
              </div>
              <h3 className="text-3xl font-black">{kpis.total}</h3>
              <p className="text-[11px] text-slate-300 font-bold">Entire Active Roster</p>
            </div>

            {/* 2. Gazetted Officers */}
            <Link href="/dashboard/gazetted" className="bg-gradient-to-br from-amber-500 to-amber-700 p-5 rounded-2xl text-white shadow-md hover:shadow-lg transition-all group flex flex-col justify-between h-32 border border-amber-600">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Gazetted GOs</span>
                <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-3xl font-black">{kpis.gos}</h3>
              <p className="text-[11px] opacity-90 font-bold flex items-center justify-between">
                <span>IPS / PPS Roster</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </p>
            </Link>

            {/* 3. Non-Gazetted */}
            <Link href="/dashboard/non-gazetted" className="bg-gradient-to-br from-blue-600 to-indigo-800 p-5 rounded-2xl text-white shadow-md hover:shadow-lg transition-all group flex flex-col justify-between h-32 border border-blue-700">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Non-Gazetted</span>
                <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-3xl font-black">{kpis.ngos}</h3>
              <p className="text-[11px] opacity-90 font-bold flex items-center justify-between">
                <span>Inspectors & Cadre</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </p>
            </Link>

            {/* 4. Thana Prabhari */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-5 rounded-2xl text-white shadow-md flex flex-col justify-between h-32 border border-emerald-700">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Thana Prabhari</span>
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-3xl font-black">{kpis.thanaPrabhari}</h3>
              <p className="text-[11px] opacity-90 font-bold">SHO / SO Chiefs</p>
            </div>

            {/* 5. Chowki Incharges */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-900 p-5 rounded-2xl text-white shadow-md flex flex-col justify-between h-32 border border-purple-700">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Chowki Incharges</span>
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-3xl font-black">{kpis.chowkiIncharge}</h3>
              <p className="text-[11px] opacity-90 font-bold">Outpost Commanders</p>
            </div>

            {/* 6. Suspended */}
            <div className="bg-gradient-to-br from-rose-600 to-red-900 p-5 rounded-2xl text-white shadow-md flex flex-col justify-between h-32 border border-rose-700">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Suspended</span>
                <UserX className="w-4 h-4" />
              </div>
              <h3 className="text-3xl font-black">{kpis.suspended}</h3>
              <p className="text-[11px] opacity-90 font-bold">Disciplinary Roster</p>
            </div>
          </div>

          {/* ROW 2: THE TWO CHARTS (Bar Chart on left 2-cols, Donut Chart on right 1-col) */}
          <ChartsSection officers={activeForce} tierName="Entire District Force" />

          {/* FLOATING AI ASSISTANT COPILOT */}
          <FloatingAIAssistant officers={allOfficers} />
        </>
      )}

      {/* Add Personnel Modal */}
      {isAddModalOpen && (
        <AddOfficerModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => loadData(true)}
        />
      )}

      {/* Timeline Modal */}
      {selectedOfficerForTimeline && (
        <TimelineModal
          officer={selectedOfficerForTimeline}
          onClose={() => setSelectedOfficerForTimeline(null)}
        />
      )}
    </div>
  )
}

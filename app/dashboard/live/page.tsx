'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getAllOfficers, getPostingApplications } from '@/services/database'
import { enrichOfficerData } from '@/lib/policeUtils'
import { getCachedOfficers, setCachedOfficers } from '@/lib/cache'
import { OfficerWithCalculated, FilterState } from '@/types/police'
import { Header } from '@/components/Header'
import { CommandCenter } from '@/components/CommandCenter'
import { NaturalLanguageQuery } from '@/components/NaturalLanguageQuery'
import { AIInsightsPanel } from '@/components/AIInsightsPanel'
import { StickyFilterToolbar } from '@/components/StickyFilterToolbar'
import { ChartsSection } from '@/components/ChartsSection'
import { ActivityTimeline } from '@/components/ActivityTimeline'
import { OfficerTable } from '@/components/OfficerTable'
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
  MapPin,
  Award
} from 'lucide-react'
import Link from 'next/link'

export default function LiveDashboardPage() {
  const [allOfficers, setAllOfficers] = useState<OfficerWithCalculated[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [pendingAppsCount, setPendingAppsCount] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedOfficerForTimeline, setSelectedOfficerForTimeline] = useState<OfficerWithCalculated | null>(null)

  // Filter Toolbar State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    rank: 'ALL',
    caste: 'ALL',
    role: 'ALL',
    status: 'ALL',
    overstayOnly: false,
    retiringSoonOnly: false
  })

  const [activeAlertKey, setActiveAlertKey] = useState<string>('ALL')

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
      const [officersRes, appsRes] = await Promise.all([
        getAllOfficers(),
        getPostingApplications()
      ])

      if (officersRes.error) {
        if (!cached || cached.length === 0) setErrorMessage(officersRes.error.message)
      } else if (officersRes.data) {
        const enriched = officersRes.data.map((o) => enrichOfficerData(o))
        setAllOfficers(enriched)
        setCachedOfficers(enriched)
        setErrorMessage(null)
      }

      if (appsRes.data) {
        setPendingAppsCount(appsRes.data.filter((a) => a.status === 'Pending').length)
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

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      rank: 'ALL',
      caste: 'ALL',
      role: 'ALL',
      status: 'ALL',
      overstayOnly: false,
      retiringSoonOnly: false
    })
    setActiveAlertKey('ALL')
  }

  const handleAlertFilterSelect = (filterKey: string) => {
    setActiveAlertKey(filterKey)
    if (filterKey === 'SUSPENDED') handleFilterChange('status', 'Suspended')
    else if (filterKey === 'OVERSTAY') handleFilterChange('overstayOnly', true)
    else if (filterKey === 'RETIRING_SOON') handleFilterChange('retiringSoonOnly', true)
    else handleResetFilters()
  }

  // Active force list
  const activeForce = useMemo(() => {
    return allOfficers.filter((o) => o.status !== 'Transferred')
  }, [allOfficers])

  // Filtered officers list
  const filteredOfficers = useMemo(() => {
    return allOfficers.filter((o) => {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        const combined = `${o.name} ${o.pno} ${o.rank} ${o.coreRank} ${o.current_posting} ${o.specialDuty}`.toLowerCase()
        if (!combined.includes(q)) return false
      }

      if (filters.rank !== 'ALL' && o.coreRank !== filters.rank) return false
      if (filters.caste !== 'ALL' && o.caste_category !== filters.caste) return false
      if (filters.role !== 'ALL') {
        const d = (o.smartDutyDisplay || o.specialDuty || '').toLowerCase()
        if (!d.includes(filters.role.toLowerCase())) return false
      }
      if (filters.status !== 'ALL' && o.status !== filters.status) return false
      if (filters.overstayOnly && !o.isOverstay) return false
      if (filters.retiringSoonOnly && (!o.isRetiringSoon && o.retirementMonthsRemaining > 12)) return false

      return true
    })
  }, [allOfficers, filters])

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
    <div className="space-y-6 pb-20">
      {/* 1. SINGLE SLEEK TOP HEADER (No duplicates!) */}
      <Header
        activeTierName="Ayodhya Police Command Office"
        officers={allOfficers}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onRefresh={() => loadData(true)}
        onSelectOfficer={(o) => setSelectedOfficerForTimeline(o)}
      />

      {loading && allOfficers.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-bold text-slate-900">Loading Command Dashboard...</p>
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
          {/* ROW 1: THE 6 MAIN COLORED METRIC CARDS (Uniform height & size - Instruction 3) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* 1. Total Force */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl text-white shadow-md flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Force</span>
                <Briefcase className="w-4 h-4 text-slate-300" />
              </div>
              <h3 className="text-3xl font-black">{kpis.total}</h3>
              <p className="text-[11px] text-slate-300 font-bold">Entire Active Roster</p>
            </div>

            {/* 2. Gazetted Officers */}
            <Link href="/dashboard/gazetted" className="bg-gradient-to-br from-amber-500 to-amber-700 p-5 rounded-2xl text-white shadow-md hover:shadow-lg transition-all group flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Gazetted GOs</span>
                <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-3xl font-black">{kpis.gos}</h3>
              <p className="text-[11px] opacity-90 font-bold flex items-center justify-between">
                <span>IPS / PPS Leaders</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </p>
            </Link>

            {/* 3. Non-Gazetted */}
            <Link href="/dashboard/non-gazetted" className="bg-gradient-to-br from-blue-600 to-indigo-800 p-5 rounded-2xl text-white shadow-md hover:shadow-lg transition-all group flex flex-col justify-between h-32">
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
            <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-5 rounded-2xl text-white shadow-md flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Thana Prabhari</span>
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-3xl font-black">{kpis.thanaPrabhari}</h3>
              <p className="text-[11px] opacity-90 font-bold">SHO / SO Chiefs</p>
            </div>

            {/* 5. Chowki Incharges */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-900 p-5 rounded-2xl text-white shadow-md flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Chowki Incharges</span>
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-3xl font-black">{kpis.chowkiIncharge}</h3>
              <p className="text-[11px] opacity-90 font-bold">Outpost Commanders</p>
            </div>

            {/* 6. Suspended */}
            <div className="bg-gradient-to-br from-rose-600 to-red-900 p-5 rounded-2xl text-white shadow-md flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Suspended</span>
                <UserX className="w-4 h-4" />
              </div>
              <h3 className="text-3xl font-black">{kpis.suspended}</h3>
              <p className="text-[11px] opacity-90 font-bold">Disciplinary Action</p>
            </div>
          </div>

          {/* ROW 2: THE TWO CHARTS (Bar Chart on left 2-cols, Clean 5-Category Donut Chart on right 1-col) */}
          <ChartsSection officers={activeForce} tierName="Entire District Force" />

          {/* ROW 3: SLEEK SLIM AI SEARCH BAR + OPERATIONAL ALERTS & AI INSIGHTS */}
          <div className="space-y-6">
            {/* Sleek Slim AI Search Bar (Instruction 3) */}
            <NaturalLanguageQuery
              officers={allOfficers}
              onSelectFilterResult={(results) => {
                setAllOfficers(results)
              }}
            />

            {/* Today's Operational Alerts Grid */}
            <CommandCenter
              officers={allOfficers}
              pendingAppsCount={pendingAppsCount}
              onSelectFilter={handleAlertFilterSelect}
              activeFilter={activeAlertKey}
            />

            {/* AI Insights Recommendations */}
            <AIInsightsPanel
              officers={activeForce}
              onExecuteAction={(actionKey) => {
                if (actionKey === 'FILTER_OVERSTAY') handleFilterChange('overstayOnly', true)
                else if (actionKey === 'FILTER_SUSPENDED') handleFilterChange('status', 'Suspended')
                else if (actionKey === 'FILTER_RETIRING') handleFilterChange('retiringSoonOnly', true)
              }}
            />
          </div>

          {/* ROW 4: STICKY FILTER TOOLBAR & PERSONNEL DATA TABLE */}
          <div className="space-y-4">
            <StickyFilterToolbar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              activeCount={filteredOfficers.length}
              totalCount={allOfficers.length}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>District Personnel Records Roster ({filteredOfficers.length} Records)</span>
                </h3>
              </div>
              <OfficerTable
                officers={filteredOfficers}
                onRefresh={() => loadData(true)}
              />
            </div>
          </div>

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

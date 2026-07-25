'use client'

import { useState, useEffect, useMemo } from 'react'
import { getOfficersByTier, getPostingApplications } from '@/services/database'
import { mockOfficers } from '@/lib/mockData'
import { enrichOfficerData } from '@/lib/policeUtils'
import { FilterState, OfficerWithCalculated } from '@/types/police'
import { DynamicMetrics } from '@/components/DynamicMetrics'
import { ChartsSection } from '@/components/ChartsSection'
import { Filters } from '@/components/Filters'
import { OfficerTable } from '@/components/OfficerTable'
import { Loader2, RefreshCw, Database } from 'lucide-react'

export default function NonGazettedDashboardPage() {
  const [officers, setOfficers] = useState<OfficerWithCalculated[]>([])
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState<number>(2)
  const [loading, setLoading] = useState<boolean>(true)
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false)

  // Fetch Non-Gazetted Officers from Supabase
  const loadNonGazettedData = async () => {
    setLoading(true)
    try {
      const { data: dbOfficers, error } = await getOfficersByTier('Non-Gazetted')
      if (error) {
        console.error('Supabase Error [Non-Gazetted Page]:', error)
      }

      // Fetch posting applications count from Supabase
      const { data: appsData, error: appsError } = await getPostingApplications()
      if (appsError) {
        console.error('Supabase Error [Posting Applications Fetch]:', appsError)
      } else if (appsData) {
        const pending = appsData.filter((a) => a.status === 'Pending').length
        setPendingApplicationsCount(pending)
      }

      if (dbOfficers && dbOfficers.length > 0) {
        // Enrich real Supabase officers (snake_case)
        const enriched = dbOfficers.map((o) => enrichOfficerData(o))
        setOfficers(enriched)
        setSupabaseConnected(true)
      } else {
        // Fallback to mock data if database is empty or not populated yet
        const rawMock = mockOfficers.filter((o) => o.officer_tier === 'Non-Gazetted')
        setOfficers(rawMock.map((o) => enrichOfficerData(o)))
        setSupabaseConnected(false)
      }
    } catch (err) {
      console.error('Catch error in loadNonGazettedData:', err)
      const rawMock = mockOfficers.filter((o) => o.officer_tier === 'Non-Gazetted')
      setOfficers(rawMock.map((o) => enrichOfficerData(o)))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNonGazettedData()
  }, [])

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    rank: 'ALL',
    caste: 'ALL',
    role: 'ALL',
    status: 'ALL',
    overstayOnly: false,
    retiringSoonOnly: false
  })

  // Unique Ranks and Roles for dropdowns (snake_case)
  const rankOptions = useMemo(
    () => Array.from(new Set(officers.map((o) => o.rank).filter(Boolean))),
    [officers]
  )
  const roleOptions = useMemo(
    () => Array.from(new Set(officers.map((o) => o.role_type).filter(Boolean))),
    [officers]
  )

  // Filtered officers list
  const filteredOfficers = useMemo(() => {
    return officers.filter((o) => {
      // Search query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        const matchesName = (o.name || '').toLowerCase().includes(q)
        const matchesPno = (o.pno || '').toLowerCase().includes(q)
        const matchesPosting = (o.current_posting || '').toLowerCase().includes(q)
        if (!matchesName && !matchesPno && !matchesPosting) return false
      }

      // Rank filter
      if (filters.rank !== 'ALL' && o.rank !== filters.rank) return false

      // Caste filter (snake_case caste_category)
      if (filters.caste !== 'ALL' && o.caste_category !== filters.caste) return false

      // Role filter (snake_case role_type)
      if (filters.role !== 'ALL' && o.role_type !== filters.role) return false

      // Status filter
      if (filters.status !== 'ALL' && o.status !== filters.status) return false

      // Overstay toggle
      if (filters.overstayOnly && !o.isOverstay) return false

      // Retiring soon toggle
      if (filters.retiringSoonOnly && !o.isRetiringSoon) return false

      return true
    })
  }, [officers, filters])

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-police-700/40">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Non-Gazetted Cadre Dashboard (NGOs)
          </h2>
          <p className="text-xs text-slate-400">
            Inspectors (SHO), Sub-Inspectors (SI), Chowki Incharges & Staff Field Force
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadNonGazettedData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-police-800 hover:bg-police-700 text-xs text-slate-300 transition-colors border border-police-700"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Sync</span>
          </button>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
            supabaseConnected
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          }`}>
            <Database className="w-3.5 h-3.5" />
            {supabaseConnected ? 'Supabase Live' : 'Demo Dataset'}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-police-900/60 rounded-2xl border border-police-700/60">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-sm font-semibold text-slate-200">Querying Supabase PostgreSQL Database...</p>
          <p className="text-xs text-slate-400">Fetching Non-Gazetted Officers records & calculating tenure alerts</p>
        </div>
      ) : (
        <>
          {/* Dynamic Metrics Cards for Non-Gazetted */}
          <DynamicMetrics
            tier="Non-Gazetted"
            officers={officers}
            pendingApplicationsCount={pendingApplicationsCount}
          />

          {/* Recharts Rank & Caste Visualizations */}
          <ChartsSection officers={officers} tierName="Non-Gazetted Officers" />

          {/* Advanced Filters & XLSX Export */}
          <Filters
            filters={filters}
            setFilters={setFilters}
            rankOptions={rankOptions}
            roleOptions={roleOptions}
            filteredOfficers={filteredOfficers}
            tierName="Non-Gazetted Officers Cadre"
          />

          {/* Main Data Table */}
          <OfficerTable officers={filteredOfficers} />
        </>
      )}
    </div>
  )
}

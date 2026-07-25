'use client'

import { useState, useEffect, useMemo } from 'react'
import { getOfficersByTier, getNodalOfficers } from '@/services/database'
import { mockOfficers } from '@/lib/mockData'
import { enrichOfficerData } from '@/lib/policeUtils'
import { FilterState, OfficerWithCalculated } from '@/types/police'
import { DynamicMetrics } from '@/components/DynamicMetrics'
import { ChartsSection } from '@/components/ChartsSection'
import { Filters } from '@/components/Filters'
import { OfficerTable } from '@/components/OfficerTable'
import { Loader2, RefreshCw, Database } from 'lucide-react'

export default function GazettedDashboardPage() {
  const [officers, setOfficers] = useState<OfficerWithCalculated[]>([])
  const [activeNodalCount, setActiveNodalCount] = useState<number>(3)
  const [loading, setLoading] = useState<boolean>(true)
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false)

  // Fetch Gazetted Officers from Supabase
  const loadGazettedData = async () => {
    setLoading(true)
    try {
      const { data: dbOfficers, error } = await getOfficersByTier('Gazetted')
      if (error) {
        console.error('Supabase Error [Gazetted Page]:', error)
      }

      // Also fetch nodal count from Supabase
      const { data: nodalData, error: nodalError } = await getNodalOfficers()
      if (nodalError) {
        console.error('Supabase Error [Nodal Officers Fetch]:', nodalError)
      } else if (nodalData && nodalData.length > 0) {
        setActiveNodalCount(nodalData.length)
      }

      if (dbOfficers && dbOfficers.length > 0) {
        // Enrich real Supabase officers (snake_case)
        const enriched = dbOfficers.map((o) => enrichOfficerData(o))
        setOfficers(enriched)
        setSupabaseConnected(true)
      } else {
        // Fallback to mock data if database is empty or not populated yet
        const rawMock = mockOfficers.filter((o) => o.officer_tier === 'Gazetted')
        setOfficers(rawMock.map((o) => enrichOfficerData(o)))
        setSupabaseConnected(false)
      }
    } catch (err) {
      console.error('Catch error in loadGazettedData:', err)
      const rawMock = mockOfficers.filter((o) => o.officer_tier === 'Gazetted')
      setOfficers(rawMock.map((o) => enrichOfficerData(o)))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGazettedData()
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

  // Unique Ranks and Roles for filter dropdowns (snake_case)
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
      // Search query (PNO, Name, Current Posting)
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
            Gazetted Officers Cadre (GOs)
          </h2>
          <p className="text-xs text-slate-400">
            IPS & PPS Cadre Leadership Dashboard • Headquarters Control
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadGazettedData}
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
          <p className="text-xs text-slate-400">Fetching Gazetted Officers records & calculating tenure alerts</p>
        </div>
      ) : (
        <>
          {/* Dynamic Metrics Cards for Gazetted */}
          <DynamicMetrics
            tier="Gazetted"
            officers={officers}
            activeNodalCount={activeNodalCount}
          />

          {/* Recharts Rank & Caste Visualizations */}
          <ChartsSection officers={officers} tierName="Gazetted Officers" />

          {/* Advanced Filters & XLSX Export */}
          <Filters
            filters={filters}
            setFilters={setFilters}
            rankOptions={rankOptions}
            roleOptions={roleOptions}
            filteredOfficers={filteredOfficers}
            tierName="Gazetted Officers Cadre"
          />

          {/* Main Data Table */}
          <OfficerTable officers={filteredOfficers} />
        </>
      )}
    </div>
  )
}

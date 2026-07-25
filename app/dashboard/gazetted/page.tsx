'use client'

import { useState, useEffect, useMemo } from 'react'
import { getOfficersByTier, getNodalOfficers } from '@/services/database'
import { enrichOfficerData } from '@/lib/policeUtils'
import { FilterState, OfficerWithCalculated } from '@/types/police'
import { DynamicMetrics } from '@/components/DynamicMetrics'
import { ChartsSection } from '@/components/ChartsSection'
import { Filters } from '@/components/Filters'
import { OfficerTable } from '@/components/OfficerTable'
import { Loader2, RefreshCw, Database, ShieldAlert } from 'lucide-react'

export default function GazettedDashboardPage() {
  const [officers, setOfficers] = useState<OfficerWithCalculated[]>([])
  const [activeNodalCount, setActiveNodalCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch Gazetted Officers directly from Supabase Database
  const loadGazettedData = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      // 1. Fetch Gazetted Tier Officers from Supabase
      const { data: dbOfficers, error } = await getOfficersByTier('Gazetted')
      if (error) {
        console.error('Supabase Error [Gazetted Page]:', error)
        setErrorMessage(error.message)
        setOfficers([])
      } else if (dbOfficers) {
        // Enrich real Supabase database records (using snake_case database schema)
        const enriched = dbOfficers.map((o) => enrichOfficerData(o))
        setOfficers(enriched)
      } else {
        setOfficers([])
      }

      // 2. Fetch Nodal Officers count from Supabase
      const { data: nodalData, error: nodalError } = await getNodalOfficers()
      if (nodalError) {
        console.error('Supabase Error [Nodal Officers Fetch]:', nodalError)
      } else if (nodalData) {
        setActiveNodalCount(nodalData.length)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Catch Error [Gazetted Page]:', err)
      setErrorMessage(msg)
      setOfficers([])
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

  // Unique Ranks and Roles extracted from real Supabase records
  const rankOptions = useMemo(
    () => Array.from(new Set(officers.map((o) => o.rank).filter(Boolean))),
    [officers]
  )
  const roleOptions = useMemo(
    () => Array.from(new Set(officers.map((o) => o.role_type).filter(Boolean))),
    [officers]
  )

  // Filtered officers dataset
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

      // Overstay toggle (>36 months)
      if (filters.overstayOnly && !o.isOverstay) return false

      // Retiring soon toggle (<12 months)
      if (filters.retiringSoonOnly && !o.isRetiringSoon) return false

      return true
    })
  }, [officers, filters])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-police-700/40">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Gazetted Officers Cadre (GOs)
          </h2>
          <p className="text-xs text-slate-400">
            IPS & PPS Cadre Leadership Dashboard • Live Supabase Database Connection
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadGazettedData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-police-800 hover:bg-police-700 text-xs text-slate-200 transition-colors border border-police-700 shadow-sm"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Sync Supabase</span>
          </button>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full border bg-emerald-500/10 text-emerald-300 border-emerald-500/30 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            Supabase Live
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-police-900/60 rounded-2xl border border-police-700/60">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-sm font-semibold text-slate-200">Querying Supabase Database...</p>
          <p className="text-xs text-slate-400">Fetching Gazetted Officers records (`officers` table)</p>
        </div>
      ) : errorMessage ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
          <div>
            <p className="font-bold">Supabase Query Error</p>
            <p className="text-xs text-red-300/80">{errorMessage}</p>
          </div>
        </div>
      ) : officers.length === 0 ? (
        <div className="py-16 text-center bg-police-900/80 rounded-2xl border border-police-700/60 p-8">
          <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No Gazetted Officer Records Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            No personnel found in Supabase 'officers' table with officer_tier = 'Gazetted'. Upload data to your Supabase project to display records.
          </p>
        </div>
      ) : (
        <>
          {/* Dynamic Metrics Cards */}
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

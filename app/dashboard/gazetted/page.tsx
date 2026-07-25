'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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

  // Fetch Gazetted Officers directly from Supabase Database with strict timeout safety
  const loadGazettedData = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    // 8-second timeout promise to guarantee loading spinner ALWAYS terminates
    const timeoutPromise = new Promise<{ timeout: true }>((resolve) =>
      setTimeout(() => resolve({ timeout: true }), 8000)
    )

    try {
      // 1. Query Gazetted Officers from Supabase
      const fetchPromise = getOfficersByTier('Gazetted')
      const result = await Promise.race([fetchPromise, timeoutPromise])

      if ('timeout' in result) {
        console.warn('Supabase Query Timed Out [Gazetted Page]: Database query took longer than 8s')
        setErrorMessage('Database connection timed out. Please check your Supabase URL & Key in .env.local')
        setOfficers([])
        return
      }

      const { data: dbOfficers, error } = result
      if (error) {
        console.error('Supabase Error [Gazetted Page]:', error.message, error)
        setErrorMessage(error.message)
        setOfficers([])
      } else if (dbOfficers && Array.isArray(dbOfficers)) {
        const enriched = dbOfficers.map((o) => enrichOfficerData(o))
        setOfficers(enriched)
      } else {
        setOfficers([])
      }

      // 2. Query Nodal Officers count from Supabase
      try {
        const { data: nodalData, error: nodalError } = await getNodalOfficers()
        if (nodalError) {
          console.error('Supabase Error [Nodal Officers Fetch]:', nodalError.message, nodalError)
        } else if (nodalData) {
          setActiveNodalCount(nodalData.length)
        }
      } catch (nodalErr) {
        console.error('Catch Error [Nodal Fetch]:', nodalErr)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Catch Error [Gazetted Page]:', err)
      setErrorMessage(msg)
      setOfficers([])
    } finally {
      // GUARANTEED execution: Always stops loading spinner
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGazettedData()
  }, [loadGazettedData])

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

  // Unique Ranks and Roles
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

      // Caste filter
      if (filters.caste !== 'ALL' && o.caste_category !== filters.caste) return false

      // Role filter
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Gazetted Officers Cadre (GOs)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            IPS & PPS Cadre Leadership Dashboard • Camp Office, SSP Ayodhya
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadGazettedData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors border border-slate-300 shadow-sm"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Sync Supabase</span>
          </button>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-1.5 shadow-sm">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            Supabase Live
          </span>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-bold text-slate-900">Querying Supabase Database...</p>
          <p className="text-xs text-slate-500 font-medium">Fetching Gazetted Officers records (`officers` table)</p>
        </div>
      ) : errorMessage ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 shadow-sm">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
          <div className="flex-1">
            <p className="font-extrabold text-rose-950">Supabase Connection Notice</p>
            <p className="text-xs text-rose-800 font-medium mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={loadGazettedData}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
          >
            Retry Fetch
          </button>
        </div>
      ) : officers.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Gazetted Officer Records Found</h3>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto mt-1">
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

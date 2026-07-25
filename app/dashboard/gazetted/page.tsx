'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { getOfficersByTier, getNodalOfficers, bulkDeleteOfficers } from '@/services/database'
import { enrichOfficerData } from '@/lib/policeUtils'
import { FilterState, OfficerWithCalculated } from '@/types/police'
import { DynamicMetrics } from '@/components/DynamicMetrics'
import { ChartsSection } from '@/components/ChartsSection'
import { Filters } from '@/components/Filters'
import { OfficerTable } from '@/components/OfficerTable'
import { AddOfficerModal } from '@/components/AddOfficerModal'
import { Loader2, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react'

export default function GazettedDashboardPage() {
  const [officers, setOfficers] = useState<OfficerWithCalculated[]>([])
  const [activeNodalCount, setActiveNodalCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState<boolean>(false)

  // Fetch Gazetted Officers with strict timeout safety
  const loadGazettedData = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    const timeoutPromise = new Promise<{ timeout: true }>((resolve) =>
      setTimeout(() => resolve({ timeout: true }), 8000)
    )

    try {
      const fetchPromise = getOfficersByTier('Gazetted')
      const result = await Promise.race([fetchPromise, timeoutPromise])

      if ('timeout' in result) {
        console.warn('Query Timed Out [Gazetted Page]')
        setErrorMessage('Connection timed out. Click Refresh Roster to try again.')
        setOfficers([])
        return
      }

      const { data: dbOfficers, error } = result
      if (error) {
        console.error('Error [Gazetted Page]:', error.message, error)
        setErrorMessage(error.message)
        setOfficers([])
      } else if (dbOfficers && Array.isArray(dbOfficers)) {
        const enriched = dbOfficers.map((o) => enrichOfficerData(o))
        setOfficers(enriched)
      } else {
        setOfficers([])
      }

      try {
        const { data: nodalData } = await getNodalOfficers()
        if (nodalData) setActiveNodalCount(nodalData.length)
      } catch (nodalErr) {
        console.error('Nodal fetch notice:', nodalErr)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Catch Error [Gazetted Page]:', err)
      setErrorMessage(msg)
      setOfficers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGazettedData()
  }, [loadGazettedData])

  const handleDeleteSingle = async (pno: string) => {
    if (!confirm(`Are you sure you want to delete officer record PNO: ${pno}?`)) return
    try {
      const { success, error } = await bulkDeleteOfficers([pno])
      if (error) alert(`Delete error: ${error.message}`)
      else if (success) loadGazettedData()
    } catch (err: any) {
      alert(`Delete error: ${err.message}`)
    }
  }

  const handleBulkDelete = async () => {
    const pnosPrompt = prompt('Enter comma-separated PNO numbers of officers to delete:')
    if (!pnosPrompt) return
    const pnos = pnosPrompt.split(',').map((p) => p.trim()).filter(Boolean)
    if (pnos.length === 0) return

    if (!confirm(`Confirm bulk deletion of ${pnos.length} officer record(s)?`)) return

    try {
      const { success, error } = await bulkDeleteOfficers(pnos)
      if (error) alert(`Bulk delete error: ${error.message}`)
      else if (success) {
        alert('Bulk deletion completed.')
        loadGazettedData()
      }
    } catch (err: any) {
      alert(`Bulk delete error: ${err.message}`)
    }
  }

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

  // Filter Active Officers (status !== 'Transferred') by default
  const filteredOfficers = useMemo(() => {
    return officers.filter((o) => {
      // Filter out Transferred officers by default
      if (o.status === 'Transferred') return false

      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        const matchesName = (o.name || '').toLowerCase().includes(q)
        const matchesPno = (o.pno || '').toLowerCase().includes(q)
        const matchesPosting = (o.current_posting || '').toLowerCase().includes(q)
        if (!matchesName && !matchesPno && !matchesPosting) return false
      }

      if (filters.rank !== 'ALL' && o.rank !== filters.rank) return false
      if (filters.caste !== 'ALL' && o.caste_category !== filters.caste) return false
      if (filters.role !== 'ALL' && o.role_type !== filters.role) return false
      if (filters.status !== 'ALL' && o.status !== filters.status) return false
      if (filters.overstayOnly && !o.isOverstay) return false
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
            <ShieldCheck className="w-5 h-5 text-amber-600" /> Gazetted Officers Cadre (GOs)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            IPS & PPS Cadre Leadership Management • Camp Office, SSP Ayodhya
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadGazettedData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors border border-slate-300 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh Roster</span>
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-bold text-slate-900">Loading Personnel Records...</p>
          <p className="text-xs text-slate-500 font-medium">Preparing Gazetted Officers Cadre Roster</p>
        </div>
      ) : errorMessage ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 shadow-sm">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
          <div className="flex-1">
            <p className="font-extrabold text-rose-950">Notice</p>
            <p className="text-xs text-rose-800 font-medium mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={loadGazettedData}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Dynamic Metrics Cards */}
          <DynamicMetrics
            tier="Gazetted"
            officers={officers.filter((o) => o.status !== 'Transferred')}
            activeNodalCount={activeNodalCount}
          />

          {/* Visualizations */}
          <ChartsSection officers={officers.filter((o) => o.status !== 'Transferred')} tierName="Gazetted Officers" />

          {/* Action Filters Bar */}
          <Filters
            filters={filters}
            setFilters={setFilters}
            rankOptions={rankOptions}
            roleOptions={roleOptions}
            filteredOfficers={filteredOfficers}
            tierName="Gazetted Officers Cadre"
            onAddClick={() => setShowAddModal(true)}
            onBulkUploadClick={() => alert('Bulk Upload: Select a CSV/Excel file containing Gazetted Officers columns (PNO, Name, Rank, Caste, Posting).')}
            onBulkDeleteClick={handleBulkDelete}
          />

          {/* Main Officer Data Table */}
          <OfficerTable
            officers={filteredOfficers}
            onRefresh={loadGazettedData}
            onDeleteOfficer={handleDeleteSingle}
          />
        </>
      )}

      {/* Add Officer Modal */}
      {showAddModal && (
        <AddOfficerModal
          defaultTier="Gazetted"
          onClose={() => setShowAddModal(false)}
          onSuccess={loadGazettedData}
        />
      )}
    </div>
  )
}

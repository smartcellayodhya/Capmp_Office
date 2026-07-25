'use client'

import { useState, useMemo } from 'react'
import { mockOfficers } from '@/lib/mockData'
import { enrichOfficerData } from '@/lib/policeUtils'
import { FilterState } from '@/types/police'
import { DynamicMetrics } from '@/components/DynamicMetrics'
import { ChartsSection } from '@/components/ChartsSection'
import { Filters } from '@/components/Filters'
import { OfficerTable } from '@/components/OfficerTable'

export default function NonGazettedDashboardPage() {
  // Enrich mock data with batch year, tenure, overstay, retirement calculations
  const rawNonGazetted = useMemo(
    () => mockOfficers.filter((o) => o.officer_tier === 'Non-Gazetted'),
    []
  )

  const enrichedNonGazetted = useMemo(
    () => rawNonGazetted.map((o) => enrichOfficerData(o)),
    [rawNonGazetted]
  )

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    rank: 'ALL',
    caste: 'ALL',
    role: 'ALL',
    status: 'ALL',
    overstayOnly: false,
    retiringSoonOnly: false
  })

  // Unique Ranks and Roles for dropdowns
  const rankOptions = useMemo(
    () => Array.from(new Set(enrichedNonGazetted.map((o) => o.rank))),
    [enrichedNonGazetted]
  )
  const roleOptions = useMemo(
    () => Array.from(new Set(enrichedNonGazetted.map((o) => o.role_type))),
    [enrichedNonGazetted]
  )

  // Filtered dataset
  const filteredOfficers = useMemo(() => {
    return enrichedNonGazetted.filter((o) => {
      // Search query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase()
        const matchesName = o.name.toLowerCase().includes(q)
        const matchesPno = o.pno.toLowerCase().includes(q)
        const matchesPosting = o.current_posting.toLowerCase().includes(q)
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
  }, [enrichedNonGazetted, filters])

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
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 self-start sm:self-auto">
          Tier: Non-Gazetted Officers
        </span>
      </div>

      {/* Requirement 3: Context-Aware Dynamic Metrics for Non-Gazetted */}
      <DynamicMetrics
        tier="Non-Gazetted"
        officers={enrichedNonGazetted}
        pendingApplicationsCount={2}
      />

      {/* Requirement 3: Recharts Rank & Caste Visualizations */}
      <ChartsSection officers={enrichedNonGazetted} tierName="Non-Gazetted Officers" />

      {/* Requirement 4: Filters & One-Click XLSX Export */}
      <Filters
        filters={filters}
        setFilters={setFilters}
        rankOptions={rankOptions}
        roleOptions={roleOptions}
        filteredOfficers={filteredOfficers}
        tierName="Non-Gazetted Officers Cadre"
      />

      {/* Requirement 4: Main Data Table */}
      <OfficerTable officers={filteredOfficers} />
    </div>
  )
}

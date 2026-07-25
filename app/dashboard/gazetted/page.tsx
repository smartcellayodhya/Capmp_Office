'use client'

import { useState, useMemo } from 'react'
import { mockOfficers } from '@/lib/mockData'
import { enrichOfficerData } from '@/lib/policeUtils'
import { FilterState } from '@/types/police'
import { DynamicMetrics } from '@/components/DynamicMetrics'
import { ChartsSection } from '@/components/ChartsSection'
import { Filters } from '@/components/Filters'
import { OfficerTable } from '@/components/OfficerTable'

export default function GazettedDashboardPage() {
  // Enrich mock data with batch year, tenure, overstay, retirement calculations
  const rawGazetted = useMemo(
    () => mockOfficers.filter((o) => o.officer_tier === 'Gazetted'),
    []
  )

  const enrichedGazetted = useMemo(
    () => rawGazetted.map((o) => enrichOfficerData(o)),
    [rawGazetted]
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
    () => Array.from(new Set(enrichedGazetted.map((o) => o.rank))),
    [enrichedGazetted]
  )
  const roleOptions = useMemo(
    () => Array.from(new Set(enrichedGazetted.map((o) => o.role_type))),
    [enrichedGazetted]
  )

  // Filtered dataset
  const filteredOfficers = useMemo(() => {
    return enrichedGazetted.filter((o) => {
      // Search query (PNO, Name, Current Posting)
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
  }, [enrichedGazetted, filters])

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
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 self-start sm:self-auto">
          Tier: Gazetted Officers
        </span>
      </div>

      {/* Requirement 3: Context-Aware Dynamic Metrics for Gazetted */}
      <DynamicMetrics
        tier="Gazetted"
        officers={enrichedGazetted}
        activeNodalCount={3}
      />

      {/* Requirement 3: Recharts Rank & Caste Visualizations */}
      <ChartsSection officers={enrichedGazetted} tierName="Gazetted Officers" />

      {/* Requirement 4: Filters & One-Click XLSX Export */}
      <Filters
        filters={filters}
        setFilters={setFilters}
        rankOptions={rankOptions}
        roleOptions={roleOptions}
        filteredOfficers={filteredOfficers}
        tierName="Gazetted Officers Cadre"
      />

      {/* Requirement 4: Main Data Table */}
      <OfficerTable officers={filteredOfficers} />
    </div>
  )
}

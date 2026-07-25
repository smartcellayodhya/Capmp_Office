'use client'

import { FilterState, OfficerWithCalculated } from '@/types/police'
import { ExportButton } from './ExportButton'
import { 
  Search, 
  Filter, 
  RotateCcw, 
  AlertTriangle, 
  Shield, 
  Users, 
  Briefcase,
  Clock
} from 'lucide-react'

interface FiltersProps {
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  rankOptions: string[]
  roleOptions: string[]
  filteredOfficers: OfficerWithCalculated[]
  tierName: string
}

export function Filters({
  filters,
  setFilters,
  rankOptions,
  roleOptions,
  filteredOfficers,
  tierName
}: FiltersProps) {
  const handleReset = () => {
    setFilters({
      searchQuery: '',
      rank: 'ALL',
      caste: 'ALL',
      role: 'ALL',
      status: 'ALL',
      overstayOnly: false,
      retiringSoonOnly: false
    })
  }

  const isFiltered =
    filters.searchQuery !== '' ||
    filters.rank !== 'ALL' ||
    filters.caste !== 'ALL' ||
    filters.role !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.overstayOnly ||
    filters.retiringSoonOnly

  return (
    <div className="bg-police-900/80 backdrop-blur-sm border border-police-700/60 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Top Search Bar & Export Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Officer Name, PNO Number (e.g., 182050012), or Posting..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full bg-police-950/80 border border-police-700/80 focus:border-amber-400/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {/* Action Controls & Excel Export */}
        <div className="flex items-center gap-2.5">
          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-police-800 hover:bg-police-700 text-slate-300 hover:text-white text-xs border border-police-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <ExportButton officers={filteredOfficers} tierName={tierName} />
        </div>
      </div>

      {/* Dropdown Filters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1 border-t border-police-700/40">
        {/* Rank Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Rank
          </label>
          <select
            value={filters.rank}
            onChange={(e) => setFilters((prev) => ({ ...prev, rank: e.target.value }))}
            className="w-full bg-police-950/80 border border-police-700 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Ranks</option>
            {rankOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Caste Category Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Caste Category
          </label>
          <select
            value={filters.caste}
            onChange={(e) => setFilters((prev) => ({ ...prev, caste: e.target.value }))}
            className="w-full bg-police-950/80 border border-police-700 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Categories</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>
        </div>

        {/* Role Type Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Role Assignment
          </label>
          <select
            value={filters.role}
            onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
            className="w-full bg-police-950/80 border border-police-700 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Roles</option>
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Service Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="w-full bg-police-950/80 border border-police-700 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Anumodit">Anumodit</option>
            <option value="On Leave">On Leave</option>
            <option value="Suspended">Suspended</option>
            <option value="Transfer Pending">Transfer Pending</option>
          </select>
        </div>

        {/* Overstay Badge Toggle */}
        <div className="col-span-2 sm:col-span-1 flex items-end">
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, overstayOnly: !prev.overstayOnly }))}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              filters.overstayOnly
                ? 'bg-red-500/20 text-red-300 border-red-500/60 shadow-lg shadow-red-500/10'
                : 'bg-police-950/80 text-slate-400 border-police-700 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${filters.overstayOnly ? 'text-red-400 animate-bounce' : ''}`} />
            <span>Overstay (&gt;36m)</span>
          </button>
        </div>
      </div>
    </div>
  )
}

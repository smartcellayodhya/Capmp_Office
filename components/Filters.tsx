'use client'

import { FilterState, OfficerWithCalculated } from '@/types/police'
import { ExportButton } from './ExportButton'
import { 
  Search, 
  RotateCcw, 
  AlertTriangle 
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
  roleOptions = [],
  filteredOfficers = [],
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
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Top Search Bar & Export Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Officer Name, PNO Number (e.g., 182050012), or Current Posting..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all font-medium"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold"
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
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-slate-300 transition-colors font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <ExportButton officers={filteredOfficers} tierName={tierName} />
        </div>
      </div>

      {/* Dropdown Filters Grid - Light Theme */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-200">
        {/* Rank Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
            Rank
          </label>
          <select
            value={filters.rank}
            onChange={(e) => setFilters((prev) => ({ ...prev, rank: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
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
          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
            Caste Category
          </label>
          <select
            value={filters.caste}
            onChange={(e) => setFilters((prev) => ({ ...prev, caste: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
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
          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
            Role Assignment
          </label>
          <select
            value={filters.role}
            onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
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
          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
            Service Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
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
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              filters.overstayOnly
                ? 'bg-rose-100 text-rose-800 border-rose-300 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${filters.overstayOnly ? 'text-rose-600 animate-bounce' : 'text-slate-500'}`} />
            <span>Overstay (&gt;36m)</span>
          </button>
        </div>
      </div>
    </div>
  )
}

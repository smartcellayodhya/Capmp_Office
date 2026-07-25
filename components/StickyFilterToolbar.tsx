'use client'

import { FilterState } from '@/types/police'
import { Filter, RotateCcw, X, Search } from 'lucide-react'

interface StickyFilterToolbarProps {
  filters: FilterState
  onFilterChange: (key: keyof FilterState, value: any) => void
  onResetFilters: () => void
  activeCount: number
  totalCount: number
}

export function StickyFilterToolbar({
  filters,
  onFilterChange,
  onResetFilters,
  activeCount,
  totalCount
}: StickyFilterToolbarProps) {
  const hasActiveFilters = 
    filters.searchQuery ||
    filters.rank !== 'ALL' ||
    filters.caste !== 'ALL' ||
    filters.role !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.overstayOnly ||
    filters.retiringSoonOnly

  return (
    <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Advanced Roster Filter Controls
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Showing <strong className="text-slate-900 font-extrabold">{activeCount}</strong> of <strong className="text-slate-900">{totalCount}</strong> personnel records
            </p>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 flex-1">
          {/* 1. Core Rank Filter */}
          <select
            value={filters.rank}
            onChange={(e) => onFilterChange('rank', e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Core Ranks</option>
            <option value="Inspector">Inspector</option>
            <option value="Sub-Inspector">Sub-Inspector</option>
            <option value="Head Constable">Head Constable</option>
            <option value="Constable">Constable</option>
            <option value="Computer Operator">Computer Operator</option>
            <option value="Gazetted">Gazetted Officer</option>
          </select>

          {/* 2. Caste Category Filter */}
          <select
            value={filters.caste}
            onChange={(e) => onFilterChange('caste', e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Categories</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>

          {/* 3. Special Duty Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => onFilterChange('role', e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Field Duties</option>
            <option value="Thana Prabhari">Thana Prabhari (SHO/SO)</option>
            <option value="Chowki Incharge">Chowki Incharge</option>
            <option value="CCTNS">CCTNS Desk</option>
            <option value="Munshi">Munshi</option>
            <option value="Head Moharir">Head Moharir</option>
            <option value="Maalkhana Incharge">Maalkhana Incharge</option>
            <option value="Driver">Driver</option>
            <option value="LIU">LIU Intelligence</option>
            <option value="Traffic">Traffic Duty</option>
          </select>

          {/* 4. Service Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Duty</option>
            <option value="Suspended">Suspended</option>
            <option value="Transferred">Transferred</option>
          </select>

          {/* 5. Overstay Flag Toggle */}
          <button
            type="button"
            onClick={() => onFilterChange('overstayOnly', !filters.overstayOnly)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              filters.overstayOnly
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Overstay (&gt;36m)
          </button>

          {/* 6. Retiring Soon Toggle */}
          <button
            type="button"
            onClick={() => onFilterChange('retiringSoonOnly', !filters.retiringSoonOnly)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              filters.retiringSoonOnly
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Retiring (&lt;12m)
          </button>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Active:</span>
          {filters.rank !== 'ALL' && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-bold flex items-center gap-1">
              Rank: {filters.rank}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange('rank', 'ALL')} />
            </span>
          )}
          {filters.caste !== 'ALL' && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
              Category: {filters.caste}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange('caste', 'ALL')} />
            </span>
          )}
          {filters.role !== 'ALL' && (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-bold flex items-center gap-1">
              Duty: {filters.role}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange('role', 'ALL')} />
            </span>
          )}
          {filters.status !== 'ALL' && (
            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-bold flex items-center gap-1">
              Status: {filters.status}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange('status', 'ALL')} />
            </span>
          )}
          {filters.overstayOnly && (
            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold flex items-center gap-1">
              Overstay Only
              <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange('overstayOnly', false)} />
            </span>
          )}
          {filters.retiringSoonOnly && (
            <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white font-bold flex items-center gap-1">
              Retiring Soon
              <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange('retiringSoonOnly', false)} />
            </span>
          )}
        </div>
      )}
    </div>
  )
}

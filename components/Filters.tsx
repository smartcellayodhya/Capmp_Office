'use client'

import { useState } from 'react'
import { FilterState, OfficerWithCalculated } from '@/types/police'
import { exportOfficersToExcel } from '@/lib/policeUtils'
import { 
  Search, 
  UserPlus, 
  FileSpreadsheet, 
  Trash2, 
  Upload, 
  RotateCcw, 
  Filter,
  MoreHorizontal
} from 'lucide-react'

interface FiltersProps {
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  rankOptions: string[]
  roleOptions: string[]
  filteredOfficers: OfficerWithCalculated[]
  tierName?: string
  onAddClick: () => void
  onBulkUploadClick: () => void
  onBulkDeleteClick: () => void
}

export function Filters({
  filters,
  setFilters,
  rankOptions,
  roleOptions,
  filteredOfficers,
  tierName = 'Personnel Cadre',
  onAddClick,
  onBulkUploadClick,
  onBulkDeleteClick
}: FiltersProps) {
  const [showMoreActions, setShowMoreActions] = useState(false)

  const handleExport = () => {
    exportOfficersToExcel(filteredOfficers, `${tierName.replace(/\s+/g, '_')}_Roster.xlsx`)
  }

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

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Bar & Filter Controls */}
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          {/* Search Query Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Name, PNO, Posting..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-500 text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 transition-all shadow-inner"
            />
          </div>

          {/* Core Rank Filter Dropdown */}
          <select
            value={filters.rank}
            onChange={(e) => setFilters((prev) => ({ ...prev, rank: e.target.value }))}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Ranks</option>
            {rankOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Caste Category Filter Dropdown */}
          <select
            value={filters.caste}
            onChange={(e) => setFilters((prev) => ({ ...prev, caste: e.target.value }))}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Categories</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>

          {/* Reset Filters Button */}
          {(filters.searchQuery || filters.rank !== 'ALL' || filters.caste !== 'ALL' || filters.role !== 'ALL' || filters.status !== 'ALL') && (
            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* STREAMLINED PRIMARY & SECONDARY ACTION BUTTONS (Rule 1) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Primary Action 1: Add New Personnel */}
          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Personnel</span>
          </button>

          {/* Primary Action 2: Export Excel */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs shadow-2xs transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Roster</span>
          </button>

          {/* Secondary Actions Dropdown (Bulk Upload, Bulk Delete) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              title="More Actions"
            >
              <MoreHorizontal className="w-4 h-4 text-slate-600" />
            </button>

            {showMoreActions && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-1 space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onBulkUploadClick()
                    setShowMoreActions(false)
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bulk Upload CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onBulkDeleteClick()
                    setShowMoreActions(false)
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2 border-t border-slate-100"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Bulk Delete PNOs</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

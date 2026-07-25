'use client'

import { useState } from 'react'
import { exportOfficersToExcel } from '@/lib/policeUtils'
import { OfficerWithCalculated } from '@/types/police'
import { UserPlus, FileSpreadsheet, Loader2 } from 'lucide-react'

interface QuickActionToolbarProps {
  officers: OfficerWithCalculated[]
  onOpenAddModal: () => void
  onRefresh: () => void
}

export function QuickActionToolbar({
  officers,
  onOpenAddModal
}: QuickActionToolbarProps) {
  const [exporting, setExporting] = useState(false)

  const handleExportExcel = () => {
    setExporting(true)
    setTimeout(() => {
      exportOfficersToExcel(officers)
      setExporting(false)
    }, 400)
  }

  return (
    <div className="flex flex-row items-center gap-2 shrink-0">
      {/* 1. Add Personnel Button */}
      <button
        type="button"
        onClick={onOpenAddModal}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors whitespace-nowrap"
        title="Add New Police Officer Record"
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>Add Personnel</span>
      </button>

      {/* 2. Export Excel Button */}
      <button
        type="button"
        onClick={handleExportExcel}
        disabled={exporting}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs shadow-2xs transition-colors whitespace-nowrap disabled:opacity-60"
        title="Export Roster to Excel"
      >
        {exporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
        ) : (
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
        )}
        <span>Export Excel</span>
      </button>
    </div>
  )
}

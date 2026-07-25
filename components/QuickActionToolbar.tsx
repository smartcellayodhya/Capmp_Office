'use client'

import { useState } from 'react'
import { exportOfficersToExcel } from '@/lib/policeUtils'
import { OfficerWithCalculated } from '@/types/police'
import { 
  UserPlus, 
  FileSpreadsheet, 
  Download, 
  Printer, 
  RefreshCw, 
  FileText,
  Loader2
} from 'lucide-react'

interface QuickActionToolbarProps {
  officers: OfficerWithCalculated[]
  onOpenAddModal: () => void
  onRefresh: () => void
}

export function QuickActionToolbar({
  officers,
  onOpenAddModal,
  onRefresh
}: QuickActionToolbarProps) {
  const [exporting, setExporting] = useState(false)

  const handleExportExcel = () => {
    setExporting(true)
    setTimeout(() => {
      exportOfficersToExcel(officers)
      setExporting(false)
    }, 500)
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* 1. Add Personnel Button */}
      <button
        type="button"
        onClick={onOpenAddModal}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm transition-all active:scale-95"
        title="Add New Police Officer Record"
      >
        <UserPlus className="w-4 h-4" />
        <span>Add Personnel</span>
      </button>

      {/* 2. Export Excel Button */}
      <button
        type="button"
        onClick={handleExportExcel}
        disabled={exporting}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-60"
        title="Export Entire Roster to Excel File"
      >
        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
        <span>Export Excel</span>
      </button>

      {/* 3. Generate Report Button */}
      <button
        type="button"
        onClick={handleExportExcel}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-sm transition-all active:scale-95"
        title="Generate Executive Roster Summary"
      >
        <FileText className="w-4 h-4" />
        <span>Generate Report</span>
      </button>

      {/* 4. Print Dashboard Button */}
      <button
        type="button"
        onClick={handlePrint}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs shadow-sm transition-all active:scale-95"
        title="Print Command Dashboard View"
      >
        <Printer className="w-4 h-4" />
        <span>Print</span>
      </button>

      {/* 5. Refresh Button */}
      <button
        type="button"
        onClick={onRefresh}
        className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-sm transition-colors"
        title="Refresh Data Roster"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  )
}

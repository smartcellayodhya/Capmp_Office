'use client'

import { useState } from 'react'
import { FileSpreadsheet, Download, Check } from 'lucide-react'
import { OfficerWithCalculated } from '@/types/police'
import { exportOfficersToExcel } from '@/lib/policeUtils'

interface ExportButtonProps {
  officers: OfficerWithCalculated[]
  tierName?: string
}

export function ExportButton({ officers, tierName = 'Officers' }: ExportButtonProps) {
  const [downloaded, setDownloaded] = useState(false)

  const handleExport = () => {
    const timestamp = new Date().toISOString().slice(0, 10)
    const cleanTier = tierName.replace(/[^a-zA-Z0-9]/g, '_')
    const filename = `UP_Police_${cleanTier}_Report_${timestamp}.xlsx`
    
    exportOfficersToExcel(officers, filename)
    
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2500)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/20 border border-emerald-400/30 transition-all duration-200 active:scale-95 group"
    >
      {downloaded ? (
        <>
          <Check className="w-4 h-4 text-emerald-200" />
          <span>Downloaded!</span>
        </>
      ) : (
        <>
          <FileSpreadsheet className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
          <span>One-Click Export (.xlsx)</span>
          <Download className="w-3.5 h-3.5 opacity-70 ml-0.5" />
        </>
      )}
    </button>
  )
}

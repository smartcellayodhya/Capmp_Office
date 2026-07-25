'use client'

import { GlobalSearch } from './GlobalSearch'
import { QuickActionToolbar } from './QuickActionToolbar'
import { OfficerWithCalculated } from '@/types/police'
import { User, ShieldCheck } from 'lucide-react'

interface HeaderProps {
  activeTierName?: string
  officers?: OfficerWithCalculated[]
  onOpenAddModal?: () => void
  onRefresh?: () => void
  onSelectOfficer?: (officer: OfficerWithCalculated) => void
}

export function Header({
  activeTierName = 'Ayodhya Police Command Office',
  officers = [],
  onOpenAddModal = () => {},
  onRefresh = () => {},
  onSelectOfficer
}: HeaderProps) {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 py-4 shadow-xs">
      <div className="flex justify-between items-center w-full">
        {/* LEFT SIDE: Only Title and HQ Live Badge (Instruction 1) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            {activeTierName}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            HQ Live
          </span>
        </div>

        {/* RIGHT SIDE: Search Bar, Action Buttons, and Profile inside flex items-center gap-4 */}
        <div className="flex items-center gap-4">
          {/* Search Bar with Fixed Width */}
          <div className="w-48 sm:w-64 md:w-72 shrink-0">
            <GlobalSearch officers={officers} onSelectOfficer={onSelectOfficer} />
          </div>

          {/* Action Buttons Toolbar */}
          <QuickActionToolbar
            officers={officers}
            onOpenAddModal={onOpenAddModal}
            onRefresh={onRefresh}
          />

          {/* User Profile Badge */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white font-bold shadow-xs">
              <User className="w-4 h-4 text-amber-300" />
            </div>
            <div className="hidden xl:block">
              <p className="text-xs font-black text-slate-900 leading-tight">SSP Ayodhya</p>
              <p className="text-[10px] text-slate-500 font-bold leading-tight">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

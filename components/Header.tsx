'use client'

import { useState, useEffect } from 'react'
import { GlobalSearch } from './GlobalSearch'
import { QuickActionToolbar } from './QuickActionToolbar'
import { OfficerWithCalculated } from '@/types/police'
import { Clock, MapPin, User, ShieldCheck } from 'lucide-react'

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
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short'
        }) +
          ' | ' +
          now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
          })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 py-3 shadow-xs">
      <div className="flex flex-row items-center justify-between gap-4 w-full">
        {/* Left Title & Location (Single Row) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-slate-900 tracking-tight whitespace-nowrap">
              {activeTierName}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              HQ Live
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium border-l border-slate-200 pl-3">
            <span className="flex items-center gap-1 text-slate-800 font-bold whitespace-nowrap">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> SSP Ayodhya
            </span>
            <span className="flex items-center gap-1 text-slate-400 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {currentTime}
            </span>
          </div>
        </div>

        {/* Right Single Straight Line Flexbox Controls */}
        <div className="flex flex-row items-center justify-end gap-3 flex-1 min-w-0">
          {/* Search Bar */}
          <div className="w-64 lg:w-80 shrink-1">
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

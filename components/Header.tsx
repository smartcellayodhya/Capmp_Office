'use client'

import { useState, useEffect } from 'react'
import { GlobalSearch } from './GlobalSearch'
import { QuickActionToolbar } from './QuickActionToolbar'
import { OfficerWithCalculated } from '@/types/police'
import { Bell, Clock, MapPin, User, ShieldCheck } from 'lucide-react'

interface HeaderProps {
  activeTierName?: string
  officers?: OfficerWithCalculated[]
  onOpenAddModal?: () => void
  onRefresh?: () => void
  onSelectOfficer?: (officer: OfficerWithCalculated) => void
}

export function Header({
  activeTierName = 'Ayodhya Police Command & Control',
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
          month: 'short',
          year: 'numeric'
        }) +
          ' | ' +
          now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 py-3.5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Title & Location */}
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {activeTierName}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              HQ Live
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 font-medium">
            <span className="flex items-center gap-1.5 text-slate-800 font-bold">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> Camp Office, SSP Ayodhya
            </span>
            <span className="flex items-center gap-1.5 border-l border-slate-200 pl-4 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {currentTime || 'Loading Time...'}
            </span>
          </div>
        </div>

        {/* Center Global Search Bar (Requirement 3) */}
        <div className="flex-1 max-w-md mx-auto w-full">
          <GlobalSearch officers={officers} onSelectOfficer={onSelectOfficer} />
        </div>

        {/* Right Quick Controls & Actions (Requirement 10) */}
        <div className="flex items-center gap-3">
          <QuickActionToolbar
            officers={officers}
            onOpenAddModal={onOpenAddModal}
            onRefresh={onRefresh}
          />

          {/* User Badge - SSP Ayodhya */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white font-bold shadow-xs">
              <User className="w-5 h-5 text-amber-300" />
            </div>
            <div className="hidden xl:block">
              <p className="text-xs font-black text-slate-900">SSP Ayodhya</p>
              <p className="text-[10px] text-slate-500 font-bold">Camp Office Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

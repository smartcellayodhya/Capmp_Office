'use client'

import { useState, useEffect } from 'react'
import { Bell, Clock, MapPin, User } from 'lucide-react'

interface HeaderProps {
  activeTierName?: string
  onSearchChange?: (val: string) => void
}

export function Header({ activeTierName = 'Gazetted Officers Cadre', onSearchChange }: HeaderProps) {
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
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-6 py-3.5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Title & Location Rebranding */}
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {activeTierName}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Active Control
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 font-medium">
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> Camp Office, SSP Ayodhya
            </span>
            <span className="flex items-center gap-1.5 border-l border-slate-200 pl-4 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {currentTime || 'Loading Time...'}
            </span>
          </div>
        </div>

        {/* Right Quick Controls */}
        <div className="flex items-center gap-3.5">
          {/* Notification Button */}
          <button 
            type="button" 
            aria-label="View notifications"
            className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
              3
            </span>
          </button>

          {/* User Badge - SSP Ayodhya */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 border border-blue-500/30 flex items-center justify-center text-white font-bold shadow-sm">
              <User className="w-5 h-5 text-amber-300" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-900">SSP Ayodhya</p>
              <p className="text-[10px] text-slate-500 font-medium">Camp Office</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

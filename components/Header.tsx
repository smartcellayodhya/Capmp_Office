'use client'

import { useState, useEffect } from 'react'
import { Bell, Clock, Search, Shield, User, MapPin } from 'lucide-react'

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
    <header className="bg-police-900/90 backdrop-blur-md border-b border-police-700/60 sticky top-0 z-20 px-6 py-3.5 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Title & Status */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              {activeTierName}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Active Control
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Police HQ, Signature Building Lucknow
            </span>
            <span className="flex items-center gap-1.5 border-l border-police-700 pl-4">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> {currentTime || 'Loading Time...'}
            </span>
          </div>
        </div>

        {/* Right Quick Controls */}
        <div className="flex items-center gap-3.5">
          {/* Notification Button */}
          <button 
            type="button" 
            aria-label="View notifications"
            className="relative p-2.5 rounded-xl bg-police-800/80 hover:bg-police-700 text-slate-300 hover:text-white border border-police-700/60 transition-colors"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
              3
            </span>
          </button>

          {/* User Badge */}
          <div className="flex items-center gap-3 pl-3 border-l border-police-700/60">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-police-600 to-police-500 border border-police-400/30 flex items-center justify-center text-white font-bold shadow-inner">
              <User className="w-5 h-5 text-amber-300" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-200">DIG (Personnel)</p>
              <p className="text-[10px] text-slate-400">UP Police HQ</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

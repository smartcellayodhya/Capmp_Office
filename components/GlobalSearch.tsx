'use client'

import { useState, useEffect, useRef } from 'react'
import { OfficerWithCalculated } from '@/types/police'
import { Search, X, History, User, Building2, FileText, ArrowRight } from 'lucide-react'

interface GlobalSearchProps {
  officers: OfficerWithCalculated[]
  onSelectOfficer?: (officer: OfficerWithCalculated) => void
}

export function GlobalSearch({ officers = [], onSelectOfficer }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('camp_office_recent_searches')
      if (stored) setRecentSearches(JSON.parse(stored))
    } catch (err) {
      console.warn('Recent search read error:', err)
    }
  }, [])

  // Keyboard shortcut listener (Ctrl+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Matching personnel results
  const results = query.trim().length > 0 
    ? officers.filter((o) => {
        const str = `${o.name} ${o.pno} ${o.rank} ${o.coreRank} ${o.current_posting} ${o.specialDuty}`.toLowerCase()
        return str.includes(query.toLowerCase())
      }).slice(0, 8)
    : []

  const handleSelect = (officer: OfficerWithCalculated) => {
    const newRecent = [officer.name, ...recentSearches.filter((s) => s !== officer.name)].slice(0, 5)
    setRecentSearches(newRecent)
    try {
      localStorage.setItem('camp_office_recent_searches', JSON.stringify(newRecent))
    } catch (err) {}

    if (onSelectOfficer) onSelectOfficer(officer)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by Name, Belt Number (PNO), Rank, Station... (Ctrl+K)"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          className="w-full bg-slate-100/90 text-slate-900 placeholder:text-slate-500 text-xs font-semibold pl-10 pr-16 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 p-1 rounded-lg hover:bg-slate-200 text-slate-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="absolute right-3 px-2 py-0.5 text-[10px] font-extrabold text-slate-400 bg-slate-200/80 rounded border border-slate-300 pointer-events-none">
            Ctrl+K
          </kbd>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {query.trim().length === 0 ? (
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <History className="w-3.5 h-3.5" />
                <span>Recent Searches</span>
              </div>
              {recentSearches.length === 0 ? (
                <p className="text-slate-400 text-xs font-medium py-1">Type name or PNO to search personnel records</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {recentSearches.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuery(s)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold border border-slate-200 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-slate-500 font-bold">
              No matching personnel records found for "{query}".
            </div>
          ) : (
            <div className="p-2 space-y-1">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Personnel Matches ({results.length})
              </div>
              {results.map((officer) => (
                <div
                  key={officer.id || officer.pno}
                  onClick={() => handleSelect(officer)}
                  className="p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {officer.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        PNO: {officer.pno} • {officer.coreRank} ({officer.rank})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 block">
                      {officer.current_posting || 'N/A'}
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 justify-end mt-0.5">
                      View Profile <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

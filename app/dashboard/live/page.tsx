'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getAllOfficers, getPostingApplications } from '@/services/database'
import { enrichOfficerData } from '@/lib/policeUtils'
import { getCachedOfficers, setCachedOfficers } from '@/lib/cache'
import { OfficerWithCalculated } from '@/types/police'
import { ChartsSection } from '@/components/ChartsSection'
import { OfficerCard } from '@/components/OfficerCard'
import { AssignDutyModal } from '@/components/AssignDutyModal'
import { TransferOutModal } from '@/components/TransferOutModal'
import { SuspendModal } from '@/components/SuspendModal'
import { TimelineModal } from '@/components/TimelineModal'
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  FileText, 
  AlertTriangle,
  RefreshCw,
  Loader2,
  Briefcase,
  UserX,
  MapPin,
  Clock,
  UserCheck,
  CalendarCheck
} from 'lucide-react'

export default function LiveDashboardPage() {
  const [allOfficers, setAllOfficers] = useState<OfficerWithCalculated[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Interactive Filter State: 'ALL' | 'ON_DUTY' | 'AVAILABLE' | 'ON_LEAVE' | 'SUSPENDED' | 'TODAY_RETURN' | 'THANA_PRABHARI' | 'CHOWKI_INCHARGE'
  const [activeFilter, setActiveFilter] = useState<string>('ALL')

  // Modals state
  const [assignDutyTarget, setAssignDutyTarget] = useState<OfficerWithCalculated | null>(null)
  const [transferTarget, setTransferTarget] = useState<OfficerWithCalculated | null>(null)
  const [suspendTarget, setSuspendTarget] = useState<OfficerWithCalculated | null>(null)
  const [timelineTarget, setTimelineTarget] = useState<OfficerWithCalculated | null>(null)

  // Fast fetch using 0ms Instant Cache + SWR
  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true)

    // Step 1: Check instant memory / localStorage cache first (0ms load)
    const cached = getCachedOfficers()
    if (cached && cached.length > 0) {
      setAllOfficers(cached)
      setLoading(false)
    }

    // Step 2: Sync from database in background
    try {
      const { data, error } = await getAllOfficers()
      if (error) {
        if (!cached || cached.length === 0) setErrorMessage(error.message)
      } else if (data) {
        const enriched = data.map((o) => enrichOfficerData(o))
        setAllOfficers(enriched)
        setCachedOfficers(enriched)
        setErrorMessage(null)
      }
    } catch (err: any) {
      console.error('Background sync error:', err)
      if (!cached || cached.length === 0) setErrorMessage(err.message || 'Fetch failed')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Active force list (excluding status === 'Transferred')
  const activeForce = useMemo(() => {
    return allOfficers.filter((o) => o.status !== 'Transferred')
  }, [allOfficers])

  // Categorized counts for the Live Duty Board metric cards
  const counts = useMemo(() => {
    const total = activeForce.length
    
    // On Duty
    const onDuty = activeForce.filter((o) => {
      const s = o.status as string
      return s === 'On Duty' || (s !== 'Suspended' && s !== 'On Leave' && o.current_posting && o.current_posting !== 'N/A')
    }).length

    // Available
    const available = activeForce.filter((o) => {
      const s = o.status as string
      return s === 'Available' || (s !== 'Suspended' && s !== 'On Leave')
    }).length

    // On Leave
    const onLeave = activeForce.filter((o) => o.status === 'On Leave').length

    // Suspended
    const suspended = allOfficers.filter((o) => o.status === 'Suspended').length

    // Today Return
    const todayReturn = activeForce.filter((o) => (o.status as string) === 'Today Return').length

    // Field Leadership
    const thanaPrabhari = activeForce.filter((o) => {
      const d = (o.smartDutyDisplay || o.specialDuty || '').toLowerCase()
      return (d.includes('sho') || d.includes('so') || d.includes('thana prabhari')) && o.status !== 'Suspended'
    }).length

    const chowkiIncharge = activeForce.filter((o) => {
      const d = (o.smartDutyDisplay || o.specialDuty || '').toLowerCase()
      return d.includes('chowki incharge') && o.status !== 'Suspended'
    }).length

    const overstay = activeForce.filter((o) => o.isOverstay && o.status !== 'Suspended').length

    return { total, onDuty, available, onLeave, suspended, todayReturn, thanaPrabhari, chowkiIncharge, overstay }
  }, [allOfficers, activeForce])

  // Filtered officers list based on activeFilter state
  const filteredOfficers = useMemo(() => {
    return allOfficers.filter((o) => {
      const s = o.status as string
      if (activeFilter === 'ALL') return s !== 'Transferred'
      if (activeFilter === 'SUSPENDED') return s === 'Suspended'
      if (activeFilter === 'ON_LEAVE') return s === 'On Leave'
      if (activeFilter === 'TODAY_RETURN') return s === 'Today Return'
      if (activeFilter === 'ON_DUTY') {
        return s === 'On Duty' || (s !== 'Suspended' && s !== 'On Leave' && o.current_posting && o.current_posting !== 'N/A')
      }
      if (activeFilter === 'AVAILABLE') {
        return s === 'Available' || (s !== 'Suspended' && s !== 'On Leave')
      }
      if (activeFilter === 'THANA_PRABHARI') {
        const d = (o.smartDutyDisplay || o.specialDuty || '').toLowerCase()
        return (d.includes('sho') || d.includes('so') || d.includes('thana prabhari')) && s !== 'Suspended'
      }
      if (activeFilter === 'CHOWKI_INCHARGE') {
        const d = (o.smartDutyDisplay || o.specialDuty || '').toLowerCase()
        return d.includes('chowki incharge') && s !== 'Suspended'
      }
      return true
    })
  }, [allOfficers, activeFilter])

  return (
    <div className="space-y-6">
      {/* Command Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            📊 Live Executive Duty Board & Analytics
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Click any metric card below to filter field personnel records in real-time • Camp Office, SSP Ayodhya
          </p>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors border border-slate-300 shadow-sm self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{refreshing ? 'Syncing...' : 'Refresh Board'}</span>
        </button>
      </div>

      {/* TOP METRIC CARDS GRID ("Live Duty Board" - Requirement 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Force (White bg, black text, border) */}
        <button
          type="button"
          onClick={() => setActiveFilter('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all group ${
            activeFilter === 'ALL'
              ? 'bg-white text-slate-900 border-slate-900 ring-2 ring-slate-900 shadow-md'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-400 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Total Force</span>
            <Users className="w-4 h-4 text-slate-700" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{counts.total}</h3>
          <p className="text-[11px] font-bold text-slate-600 mt-1">Active Personnel</p>
        </button>

        {/* Card 2: On Duty (Deep Blue bg, white text) */}
        <button
          type="button"
          onClick={() => setActiveFilter('ON_DUTY')}
          className={`p-4 rounded-2xl text-left transition-all text-white shadow-md ${
            activeFilter === 'ON_DUTY'
              ? 'bg-blue-700 ring-2 ring-blue-400 scale-[1.02]'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">On Duty</span>
            <Briefcase className="w-4 h-4 text-white opacity-90" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">{counts.onDuty}</h3>
          <p className="text-[11px] font-bold opacity-90 mt-1">Field Assigned</p>
        </button>

        {/* Card 3: Available (Forest Green bg, white text) */}
        <button
          type="button"
          onClick={() => setActiveFilter('AVAILABLE')}
          className={`p-4 rounded-2xl text-left transition-all text-white shadow-md ${
            activeFilter === 'AVAILABLE'
              ? 'bg-emerald-700 ring-2 ring-emerald-400 scale-[1.02]'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">Available</span>
            <UserCheck className="w-4 h-4 text-white opacity-90" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">{counts.available}</h3>
          <p className="text-[11px] font-bold opacity-90 mt-1">Ready for Duty</p>
        </button>

        {/* Card 4: On Leave (Orange/Amber bg, white text) */}
        <button
          type="button"
          onClick={() => setActiveFilter('ON_LEAVE')}
          className={`p-4 rounded-2xl text-left transition-all text-white shadow-md ${
            activeFilter === 'ON_LEAVE'
              ? 'bg-amber-600 ring-2 ring-amber-300 scale-[1.02]'
              : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">On Leave</span>
            <Clock className="w-4 h-4 text-white opacity-90" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">{counts.onLeave}</h3>
          <p className="text-[11px] font-bold opacity-90 mt-1">Sanctioned Leave</p>
        </button>

        {/* Card 5: Suspended (Rust Red/Brown bg, white text) */}
        <button
          type="button"
          onClick={() => setActiveFilter('SUSPENDED')}
          className={`p-4 rounded-2xl text-left transition-all text-white shadow-md ${
            activeFilter === 'SUSPENDED'
              ? 'bg-red-800 ring-2 ring-red-400 scale-[1.02]'
              : 'bg-red-700 hover:bg-red-800 shadow-red-700/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">Suspended</span>
            <UserX className="w-4 h-4 text-white opacity-90" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">{counts.suspended}</h3>
          <p className="text-[11px] font-bold opacity-90 mt-1">Disciplinary Action</p>
        </button>

        {/* Card 6: Today Return (Maroon bg, white text) */}
        <button
          type="button"
          onClick={() => setActiveFilter('TODAY_RETURN')}
          className={`p-4 rounded-2xl text-left transition-all text-white shadow-md ${
            activeFilter === 'TODAY_RETURN'
              ? 'bg-rose-950 ring-2 ring-rose-400 scale-[1.02]'
              : 'bg-rose-900 hover:bg-rose-950 shadow-rose-900/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">Today Return</span>
            <CalendarCheck className="w-4 h-4 text-white opacity-90" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">{counts.todayReturn}</h3>
          <p className="text-[11px] font-bold opacity-90 mt-1">Reporting Back</p>
        </button>
      </div>

      {/* DYNAMIC TAB ROW WITH COUNTS (Requirement 3) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-3 py-1">
          Duty Roster View:
        </span>

        <button
          type="button"
          onClick={() => setActiveFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
            activeFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          All Personnel ({counts.total})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('ON_DUTY')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
            activeFilter === 'ON_DUTY'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          On Duty ({counts.onDuty})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('AVAILABLE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
            activeFilter === 'AVAILABLE'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Available ({counts.available})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('THANA_PRABHARI')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
            activeFilter === 'THANA_PRABHARI'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Thana Prabhari (SHO/SO) ({counts.thanaPrabhari})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('CHOWKI_INCHARGE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
            activeFilter === 'CHOWKI_INCHARGE'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Chowki Incharges ({counts.chowkiIncharge})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('SUSPENDED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
            activeFilter === 'SUSPENDED'
              ? 'bg-red-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Suspended ({counts.suspended})
        </button>
      </div>

      {/* DYNAMIC DATA DISPLAY (Bottom Section - Officer Cards Grid - Requirement 4) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Personnel Cards Roster ({filteredOfficers.length} Records)</span>
          </h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Active Filter: <strong className="text-slate-900 uppercase">{activeFilter.replace('_', ' ')}</strong>
          </span>
        </div>

        {loading && allOfficers.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-bold text-slate-900">Loading Personnel Cards...</p>
          </div>
        ) : filteredOfficers.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-extrabold text-slate-800 text-sm">No personnel records found for filter '{activeFilter}'.</p>
            <button
              onClick={() => setActiveFilter('ALL')}
              className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Reset to Show All Force
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOfficers.map((officer) => (
              <OfficerCard
                key={officer.id || officer.pno}
                officer={officer}
                onAssignDuty={(o) => setAssignDutyTarget(o)}
                onTransfer={(o) => setTransferTarget(o)}
                onSuspend={(o) => setSuspendTarget(o)}
                onViewDetails={(o) => setTimelineTarget(o)}
              />
            ))}
          </div>
        )}
      </div>

      {/* High-Level Recharts Visualizations */}
      <ChartsSection officers={activeForce} tierName="Entire District Force" />

      {/* Modals for Quick Actions */}
      {assignDutyTarget && (
        <AssignDutyModal
          officer={assignDutyTarget}
          onClose={() => setAssignDutyTarget(null)}
          onSuccess={() => loadData(true)}
        />
      )}

      {transferTarget && (
        <TransferOutModal
          officer={transferTarget}
          onClose={() => setTransferTarget(null)}
          onSuccess={() => loadData(true)}
        />
      )}

      {suspendTarget && (
        <SuspendModal
          officer={suspendTarget}
          onClose={() => setSuspendTarget(null)}
          onSuccess={() => loadData(true)}
        />
      )}

      {timelineTarget && (
        <TimelineModal
          officer={timelineTarget}
          onClose={() => setTimelineTarget(null)}
        />
      )}
    </div>
  )
}

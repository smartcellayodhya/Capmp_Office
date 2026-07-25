'use client'

import { OfficerWithCalculated } from '@/types/police'
import { 
  ShieldCheck, 
  AlertTriangle, 
  Tag, 
  Building2, 
  Briefcase, 
  UserX, 
  ExternalLink,
  Eye,
  Clock
} from 'lucide-react'

interface OfficerCardProps {
  officer: OfficerWithCalculated
  onAssignDuty: (officer: OfficerWithCalculated) => void
  onTransfer: (officer: OfficerWithCalculated) => void
  onSuspend: (officer: OfficerWithCalculated) => void
  onViewDetails: (officer: OfficerWithCalculated) => void
}

export function OfficerCard({
  officer,
  onAssignDuty,
  onTransfer,
  onSuspend,
  onViewDetails
}: OfficerCardProps) {
  // Helper for Special Duty pill color styling
  const getSpecialDutyBadge = (dutyDisplay: string = 'General Duty') => {
    if (dutyDisplay.includes('SHO')) {
      return 'bg-amber-100 text-amber-950 border-amber-300 font-black shadow-2xs'
    }
    if (dutyDisplay.includes('SO')) {
      return 'bg-blue-100 text-blue-950 border-blue-300 font-black shadow-2xs'
    }
    if (dutyDisplay.includes('Chowki Incharge')) {
      return 'bg-purple-100 text-purple-950 border-purple-300 font-black shadow-2xs'
    }
    if (dutyDisplay.includes('CCTNS')) {
      return 'bg-indigo-100 text-indigo-900 border-indigo-200 font-bold'
    }
    if (dutyDisplay.includes('Maalkhana')) {
      return 'bg-amber-50 text-amber-900 border-amber-200 font-bold'
    }
    if (dutyDisplay.includes('Munshi')) {
      return 'bg-blue-50 text-blue-900 border-blue-200 font-bold'
    }
    return 'bg-slate-100 text-slate-700 border-slate-200 font-medium'
  }

  // Helper for status styling
  const getStatusBadge = (status: string = 'Active') => {
    switch (status) {
      case 'Suspended':
        return 'bg-rose-600 text-white font-black animate-pulse shadow-2xs'
      case 'Transferred':
        return 'bg-amber-100 text-amber-950 border border-amber-300 font-extrabold'
      case 'On Leave':
        return 'bg-amber-500 text-white font-extrabold shadow-2xs'
      case 'Today Return':
        return 'bg-rose-900 text-white font-extrabold shadow-2xs'
      case 'On Duty':
        return 'bg-blue-600 text-white font-extrabold shadow-2xs'
      case 'Available':
        return 'bg-emerald-600 text-white font-extrabold shadow-2xs'
      default:
        return 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
      {/* Top Header Row */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
              {officer.name || 'Unknown Officer'}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              PNO: <strong className="text-slate-800 font-extrabold">{officer.pno || 'N/A'}</strong> • {officer.batchYear}
            </p>
          </div>
          {/* Service Status Badge */}
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider shrink-0 ${getStatusBadge(officer.status)}`}>
            {officer.status || 'Active'}
          </span>
        </div>

        {/* Rank & Gender Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {/* Core Rank Badge */}
          <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white text-[10px] font-extrabold shadow-2xs">
            {officer.coreRank || 'Constable'}
          </span>

          {/* Gender Badge */}
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
            officer.gender === 'Female' 
              ? 'bg-purple-100 text-purple-900 border border-purple-300' 
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}>
            {officer.gender || 'Male'}
          </span>

          {/* Field Duty Role Pill */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border ${getSpecialDutyBadge(officer.smartDutyDisplay || officer.specialDuty)}`}>
            <Tag className="w-2.5 h-2.5 opacity-80" />
            {officer.smartDutyDisplay || officer.specialDuty || 'General Duty'}
          </span>
        </div>
      </div>

      {/* Posting & Tenure Details */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold truncate">
          <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate" title={officer.current_posting || 'N/A'}>
            {officer.current_posting || 'N/A'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-0.5">
          <span>Tenure: <strong className="text-slate-900 font-bold">{officer.tenureMonths ?? 0} months</strong></span>
          {officer.isOverstay && (
            <span className="text-rose-700 font-extrabold flex items-center gap-0.5">
              <AlertTriangle className="w-3 h-3" /> Overstay Flag
            </span>
          )}
        </div>
      </div>

      {/* Bottom Quick Actions Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <button
          type="button"
          onClick={() => onViewDetails(officer)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-blue-700 border border-slate-200 font-bold text-xs transition-colors"
          title="View Career Timeline"
        >
          <Eye className="w-4 h-4 text-blue-600" />
        </button>

        <div className="flex items-center gap-1.5">
          {/* Assign Duty Action */}
          {officer.status !== 'Transferred' && (
            <button
              type="button"
              onClick={() => onAssignDuty(officer)}
              className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 font-extrabold text-[11px] flex items-center gap-1 transition-colors"
            >
              <Briefcase className="w-3 h-3 text-blue-700" />
              <span>Assign</span>
            </button>
          )}

          {/* Release / Transfer Action */}
          {officer.status !== 'Transferred' && (
            <button
              type="button"
              onClick={() => onTransfer(officer)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-extrabold text-[11px] flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3 text-amber-800" />
              <span>Release</span>
            </button>
          )}

          {/* Suspend Action */}
          {officer.status !== 'Suspended' && officer.status !== 'Transferred' && (
            <button
              type="button"
              onClick={() => onSuspend(officer)}
              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 font-extrabold text-[11px] flex items-center gap-1 transition-colors"
            >
              <UserX className="w-3 h-3 text-rose-700" />
              <span>Suspend</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

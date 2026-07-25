'use client'

import { useState } from 'react'
import { OfficerWithCalculated } from '@/types/police'
import { TimelineModal } from './TimelineModal'
import { 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  ChevronRight, 
  Eye,
  Award
} from 'lucide-react'

interface OfficerTableProps {
  officers: OfficerWithCalculated[]
}

export function OfficerTable({ officers }: OfficerTableProps) {
  const [selectedOfficer, setSelectedOfficer] = useState<OfficerWithCalculated | null>(null)

  return (
    <div className="bg-police-900/80 backdrop-blur-sm border border-police-700/60 rounded-2xl overflow-hidden shadow-xl">
      {/* Table Top Header Bar */}
      <div className="p-4 border-b border-police-700/60 flex items-center justify-between bg-police-950/50">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Active Personnel List
          </h3>
          <p className="text-[11px] text-slate-400">
            Click on any officer row to inspect their complete career timeline
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-300 bg-police-800 px-3 py-1 rounded-full border border-police-700">
          Showing {officers.length} Officer(s)
        </span>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-police-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-police-700/60">
              <th className="py-3.5 px-4">PNO & Batch</th>
              <th className="py-3.5 px-4">Officer Name & Rank</th>
              <th className="py-3.5 px-4">Tier & Caste</th>
              <th className="py-3.5 px-4">Current Posting & Role</th>
              <th className="py-3.5 px-4">Tenure & Overstay Alert</th>
              <th className="py-3.5 px-4">Status & Retirement</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-police-800/60 text-slate-200">
            {officers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-slate-500" />
                    <p className="font-semibold text-slate-300">No officers found matching the selected filter criteria.</p>
                    <p className="text-[11px] text-slate-500">Try adjusting your filters or resetting the search.</p>
                  </div>
                </td>
              </tr>
            ) : (
              officers.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelectedOfficer(o)}
                  className="hover:bg-police-800/60 transition-colors cursor-pointer group"
                >
                  {/* PNO & Batch */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-100">{o.pno}</div>
                    <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {o.batchYear}
                    </span>
                  </td>

                  {/* Officer Name & Rank */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {o.name}
                    </div>
                    <div className="text-[11px] text-slate-400">{o.rank}</div>
                  </td>

                  {/* Tier & Caste */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-300">{o.officer_tier}</div>
                    <span className="text-[10px] font-semibold text-slate-400 bg-police-800 px-2 py-0.5 rounded border border-police-700">
                      {o.caste_category}
                    </span>
                  </td>

                  {/* Current Posting & Role */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-200 truncate" title={o.current_posting}>
                      {o.current_posting}
                    </div>
                    <div className="text-[11px] text-amber-400/80">{o.role_type}</div>
                  </td>

                  {/* Tenure & Overstay Alert */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-200">
                      {o.tenureMonths} Months
                    </div>
                    {o.isOverstay ? (
                      <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-red-400" /> Overstay / Transfer Due
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-medium">
                        Normal Tenure (&lt;36m)
                      </span>
                    )}
                  </td>

                  {/* Status & Retirement */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          o.status === 'Active' ? 'bg-emerald-400' : o.status === 'Anumodit' ? 'bg-blue-400' : 'bg-amber-400'
                        }`}
                      />
                      <span className="font-semibold text-slate-200">{o.status}</span>
                    </div>

                    {o.isRetiringUrgent ? (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Clock className="w-3 h-3 text-amber-400" /> Retiring in {o.retirementMonthsRemaining} Mos
                      </span>
                    ) : o.isRetiringSoon ? (
                      <span className="inline-block mt-1 text-[10px] text-amber-400 font-medium">
                        Retires &lt; 12 Mos
                      </span>
                    ) : null}
                  </td>

                  {/* Action Button */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedOfficer(o)
                      }}
                      className="p-2 rounded-xl bg-police-800 hover:bg-police-700 text-slate-300 hover:text-white border border-police-700/60 transition-all group-hover:border-amber-400/50"
                      title="View Officer Career Timeline"
                    >
                      <Eye className="w-4 h-4 text-amber-400" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Timeline Modal */}
      {selectedOfficer && (
        <TimelineModal
          officer={selectedOfficer}
          onClose={() => setSelectedOfficer(null)}
        />
      )}
    </div>
  )
}

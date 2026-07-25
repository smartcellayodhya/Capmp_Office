'use client'

import { useState } from 'react'
import { OfficerWithCalculated } from '@/types/police'
import { TimelineModal } from './TimelineModal'
import { 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  Award, 
  Eye
} from 'lucide-react'

interface OfficerTableProps {
  officers: OfficerWithCalculated[]
}

export function OfficerTable({ officers }: OfficerTableProps) {
  const [selectedOfficer, setSelectedOfficer] = useState<OfficerWithCalculated | null>(null)

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Table Header Bar */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" /> Active Personnel List
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Click on any officer row to inspect their complete career timeline
          </p>
        </div>
        <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
          Showing {officers.length} Officer(s)
        </span>
      </div>

      {/* Main Data Table - Crisp Light Theme */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200">
              <th className="py-3.5 px-4">PNO & Batch</th>
              <th className="py-3.5 px-4">Officer Name & Rank</th>
              <th className="py-3.5 px-4">Tier & Caste</th>
              <th className="py-3.5 px-4">Current Posting & Role</th>
              <th className="py-3.5 px-4">Tenure & Overstay Alert</th>
              <th className="py-3.5 px-4">Status & Retirement</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {officers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-slate-400" />
                    <p className="font-bold text-slate-800">No officers found matching the active criteria or database is empty.</p>
                    <p className="text-[11px] text-slate-500">Ensure personnel records exist in Supabase 'officers' table.</p>
                  </div>
                </td>
              </tr>
            ) : (
              officers.map((o) => (
                <tr
                  key={o.id || o.pno}
                  onClick={() => setSelectedOfficer(o)}
                  className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                >
                  {/* PNO & Batch */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{o.pno || 'N/A'}</div>
                    <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      {o.batchYear || 'N/A'}
                    </span>
                  </td>

                  {/* Officer Name & Rank */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {o.name || 'Unknown Officer'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">{o.rank || 'N/A'}</div>
                  </td>

                  {/* Tier & Caste */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{o.officer_tier || 'N/A'}</div>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {o.caste_category || 'N/A'}
                    </span>
                  </td>

                  {/* Current Posting & Role */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 truncate" title={o.current_posting || 'N/A'}>
                      {o.current_posting || 'N/A'}
                    </div>
                    <div className="text-[11px] text-blue-700 font-semibold">{o.role_type || 'N/A'}</div>
                  </td>

                  {/* Tenure & Overstay Alert */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">
                      {o.tenureMonths ?? 0} Months
                    </div>
                    {o.isOverstay ? (
                      <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-sm animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> Overstay / Transfer Due
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-700 font-bold">
                        Normal Tenure (&lt;36m)
                      </span>
                    )}
                  </td>

                  {/* Status & Retirement */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          o.status === 'Active' ? 'bg-emerald-500' : o.status === 'Anumodit' ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                      />
                      <span className="font-bold text-slate-800">{o.status || 'Active'}</span>
                    </div>

                    {o.isRetiringUrgent ? (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-700" /> Retiring in {o.retirementMonthsRemaining} Mos
                      </span>
                    ) : o.isRetiringSoon ? (
                      <span className="inline-block mt-1 text-[10px] text-amber-800 font-bold">
                        Retires &lt; 12 Mos
                      </span>
                    ) : null}
                  </td>

                  {/* Action Trigger */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedOfficer(o)
                      }}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-blue-700 border border-slate-300 transition-all shadow-sm"
                      title="View Officer Career Timeline"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Career Timeline Modal */}
      {selectedOfficer && (
        <TimelineModal
          officer={selectedOfficer}
          onClose={() => setSelectedOfficer(null)}
        />
      )}
    </div>
  )
}

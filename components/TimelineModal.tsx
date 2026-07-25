'use client'

import { useState, useEffect } from 'react'
import { OfficerWithCalculated, PostingHistoryRow } from '@/types/police'
import { getOfficerProfileWithHistory } from '@/services/database'
import { mockPostingHistory } from '@/lib/mockData'
import { X, Calendar, MapPin, ShieldAlert, Clock, Loader2 } from 'lucide-react'

interface TimelineModalProps {
  officer: OfficerWithCalculated | null
  onClose: () => void
}

export function TimelineModal({ officer, onClose }: TimelineModalProps) {
  const [history, setHistory] = useState<PostingHistoryRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!officer) return

    let isMounted = true
    setLoading(true)

    async function fetchCareerHistory() {
      try {
        const { data, error } = await getOfficerProfileWithHistory(officer!.pno)
        if (error) {
          console.error(`Supabase Error fetching posting history for ${officer!.pno}:`, error)
        }

        if (isMounted) {
          if (data && data.posting_history && data.posting_history.length > 0) {
            setHistory(data.posting_history)
          } else {
            // Fallback to mock posting history or default current posting node
            const mockEntries = mockPostingHistory[officer!.pno]
            if (mockEntries && mockEntries.length > 0) {
              setHistory(mockEntries)
            } else {
              setHistory([
                {
                  id: 'current-node',
                  officer_pno: officer!.pno || 'N/A',
                  station_name: officer!.current_posting || 'Current Assignment',
                  posting_date: officer!.joining_date || new Date().toISOString().slice(0, 10),
                  duration_months: officer!.tenureMonths || 0
                }
              ])
            }
          }
        }
      } catch (err) {
        console.error('Catch error loading career history:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchCareerHistory()

    return () => {
      isMounted = false
    }
  }, [officer])

  if (!officer) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-police-900 border border-police-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-police-950 via-police-900 to-police-850 border-b border-police-700 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-police-950 rounded-[10px] flex items-center justify-center font-black text-amber-300 text-sm">
                UPP
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">{officer.name || 'Unknown Officer'}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {officer.batchYear || 'N/A'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                PNO: <strong className="text-slate-200">{officer.pno || 'N/A'}</strong> | Rank: <span className="text-amber-400 font-medium">{officer.rank || 'N/A'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg bg-police-800 hover:bg-police-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Details Grid (snake_case database fields) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-police-850 border border-police-700/50">
              <span className="text-slate-400 block text-[10px]">Caste Category</span>
              <strong className="text-slate-100 font-semibold">{officer.caste_category || 'N/A'}</strong>
            </div>
            <div className="p-3 rounded-xl bg-police-850 border border-police-700/50">
              <span className="text-slate-400 block text-[10px]">Role Assignment</span>
              <strong className="text-slate-100 font-semibold">{officer.role_type || 'N/A'}</strong>
            </div>
            <div className="p-3 rounded-xl bg-police-850 border border-police-700/50">
              <span className="text-slate-400 block text-[10px]">Current Tenure</span>
              <strong className={`font-semibold ${officer.isOverstay ? 'text-red-400' : 'text-slate-100'}`}>
                {officer.tenureMonths ?? 0} Months
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-police-850 border border-police-700/50">
              <span className="text-slate-400 block text-[10px]">Superannuation</span>
              <strong className={`font-semibold ${officer.isRetiringSoon ? 'text-amber-400' : 'text-slate-100'}`}>
                {officer.retirementYearsRemaining ?? 0} Yrs Remaining
              </strong>
            </div>
          </div>

          {/* Overstay Banner */}
          {officer.isOverstay && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="font-bold">HIGH PRIORITY OVERSTAY FLAG</p>
                <p className="text-[11px] text-red-300/80">
                  Officer has completed <strong>{officer.tenureMonths} months</strong> in current posting (Limit: 36 months). Transfer review recommended.
                </p>
              </div>
            </div>
          )}

          {/* Career Posting History Timeline */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Complete Career Posting Timeline
            </h4>

            {loading ? (
              <div className="py-8 flex items-center justify-center gap-2 text-slate-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Loading Supabase posting history...</span>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-police-700">
                {history.map((post, idx) => (
                  <div key={post.id || idx} className="relative group">
                    <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 ${
                      idx === 0 ? 'bg-amber-400 border-amber-300 ring-4 ring-amber-400/20' : 'bg-police-700 border-police-500'
                    }`} />

                    <div className="p-4 rounded-xl bg-police-850/90 border border-police-700/60 hover:border-police-500 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                          <h5 className="font-bold text-sm text-slate-100">{post.station_name || 'Unassigned Station'}</h5>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-police-700 text-slate-300">
                          {post.duration_months ?? 0} Months
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" /> Joined: {post.posting_date || 'N/A'}
                        </span>
                        {idx === 0 && (
                          <span className="text-emerald-400 font-medium text-[11px]">
                            (Active Current Posting)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-police-950 border-t border-police-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-police-700 hover:bg-police-600 text-white font-medium text-xs transition-colors"
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  )
}

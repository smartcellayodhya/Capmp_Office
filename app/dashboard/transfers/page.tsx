'use client'

import { useState, useEffect } from 'react'
import { getPostingApplications } from '@/services/database'
import { supabase } from '@/utils/supabase/client'
import { PostingApplicationRow, OfficerRow } from '@/types/police'
import { FileText, Clock, Building2, Loader2, ShieldAlert } from 'lucide-react'

export default function TransfersPage() {
  const [applications, setApplications] = useState<PostingApplicationRow[]>([])
  const [officerMap, setOfficerMap] = useState<Record<string, OfficerRow>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadApplicationsData() {
      setLoading(true)
      setErrorMessage(null)
      try {
        const { data: apps, error } = await getPostingApplications()
        if (error) {
          console.error('Supabase Query Error [Transfers Applications]:', error.message, error)
          setErrorMessage(error.message)
        } else if (apps) {
          setApplications(apps)

          // Fetch associated officer records matching officer_pno (snake_case column: pno)
          const pnos = Array.from(new Set(apps.map((a) => a.officer_pno)))
          if (pnos.length > 0) {
            const { data: officersData, error: officerError } = await supabase
              .from('officers')
              .select('*')
              .in('pno', pnos)

            if (officerError) {
              console.error(
                'Supabase Query Error [Transfers Officers]:',
                officerError.message,
                officerError.hint,
                officerError.details
              )
            } else if (officersData) {
              const map: Record<string, OfficerRow> = {}
              ;(officersData as OfficerRow[]).forEach((o) => {
                map[o.pno] = o
              })
              setOfficerMap(map)
            }
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('Catch Error [Transfers Page]:', err)
        setErrorMessage(msg)
      } finally {
        setLoading(false)
      }
    }

    loadApplicationsData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-police-700/40">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" /> Posting & Transfer Applications
          </h2>
          <p className="text-xs text-slate-400">
            Pending, Approved & Administrative Transfer Requests (Live Supabase Database)
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
          {applications.length} Requests Logged
        </span>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-police-900/60 rounded-2xl border border-police-700/60">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-sm font-semibold text-slate-200">Querying Supabase Database...</p>
          <p className="text-xs text-slate-400">Fetching `posting_applications` table records</p>
        </div>
      ) : errorMessage ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
          <div>
            <p className="font-bold">Supabase Query Error</p>
            <p className="text-xs text-red-300/80">{errorMessage}</p>
          </div>
        </div>
      ) : applications.length === 0 ? (
        <div className="py-16 text-center bg-police-900/80 rounded-2xl border border-police-700/60 p-8">
          <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No Transfer Applications Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            No transfer requests found in Supabase 'posting_applications' table.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {applications.map((app) => {
            const officer = officerMap[app.officer_pno]
            return (
              <div
                key={app.id}
                className="bg-police-900/80 backdrop-blur-sm border border-police-700/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-police-800 text-slate-300 border border-police-700">
                      PNO: {app.officer_pno || 'N/A'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        app.status === 'Pending'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {app.status || 'Pending'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-100">{officer?.name || 'Officer'}</h3>
                  <p className="text-xs text-amber-400/90 font-medium mb-3">{officer?.rank || 'N/A'}</p>

                  <div className="space-y-2 text-xs bg-police-850 p-3 rounded-xl border border-police-700/50">
                    <div className="flex items-start gap-2 text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">From Current Station</span>
                        <strong className="text-slate-100">{app.current_station || 'N/A'}</strong>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-slate-300 pt-1 border-t border-police-700/40">
                      <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-amber-400/80 block">To Requested Station</span>
                        <strong className="text-amber-300">{app.requested_station || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 italic mt-3 bg-police-950/60 p-2.5 rounded-lg border border-police-800">
                    "{app.reason || 'No reason specified'}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-police-700/50 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5" /> {app.created_at ? app.created_at.slice(0, 10) : 'N/A'}
                  </span>
                  <div className="flex gap-2">
                    <button className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px]">
                      Approve
                    </button>
                    <button className="px-2.5 py-1 rounded bg-police-800 hover:bg-police-700 text-slate-300 text-[11px]">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

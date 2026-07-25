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
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> Posting & Transfer Applications
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Pending, Approved & Administrative Transfer Requests • Camp Office, SSP Ayodhya
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
          {applications.length} Requests Logged
        </span>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-bold text-slate-900">Querying Supabase Database...</p>
          <p className="text-xs text-slate-500 font-medium">Fetching `posting_applications` table records</p>
        </div>
      ) : errorMessage ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 shadow-sm">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
          <div>
            <p className="font-extrabold text-rose-950">Supabase Query Error</p>
            <p className="text-xs text-rose-800 font-medium">{errorMessage}</p>
          </div>
        </div>
      ) : applications.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Transfer Applications Found</h3>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto mt-1">
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
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      PNO: {app.officer_pno || 'N/A'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        app.status === 'Pending'
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {app.status || 'Pending'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{officer?.name || 'Officer'}</h3>
                  <p className="text-xs text-blue-700 font-bold mb-3">{officer?.rank || 'N/A'}</p>

                  <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
                    <div className="flex items-start gap-2 text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">From Current Station</span>
                        <strong className="text-slate-900 font-bold">{app.current_station || 'N/A'}</strong>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-slate-700 pt-1 border-t border-slate-200">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-blue-700 font-semibold block">To Requested Station</span>
                        <strong className="text-blue-900 font-bold">{app.requested_station || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 italic mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-medium">
                    "{app.reason || 'No reason specified'}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1 text-[11px] font-medium">
                    <Clock className="w-3.5 h-3.5" /> {app.created_at ? app.created_at.slice(0, 10) : 'N/A'}
                  </span>
                  <div className="flex gap-2">
                    <button className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm">
                      Approve
                    </button>
                    <button className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-300">
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

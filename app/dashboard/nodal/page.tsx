'use client'

import { useState, useEffect } from 'react'
import { getNodalOfficers } from '@/services/database'
import { supabase } from '@/utils/supabase/client'
import { NodalOfficerRow, OfficerRow } from '@/types/police'
import { Award, ShieldCheck, Calendar, User, Loader2, ShieldAlert } from 'lucide-react'

export default function NodalOfficersPage() {
  const [nodalList, setNodalList] = useState<NodalOfficerRow[]>([])
  const [officerMap, setOfficerMap] = useState<Record<string, OfficerRow>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadNodalData() {
      setLoading(true)
      setErrorMessage(null)
      try {
        const { data: nodals, error } = await getNodalOfficers()
        if (error) {
          console.error('Supabase Query Error [Nodal Officers]:', error.message, error)
          setErrorMessage(error.message)
        } else if (nodals) {
          setNodalList(nodals)

          const pnos = Array.from(new Set(nodals.map((n) => n.officer_pno)))
          if (pnos.length > 0) {
            const { data: officersData, error: officerError } = await supabase
              .from('officers')
              .select('*')
              .in('pno', pnos)

            if (officerError) {
              console.error(
                'Supabase Query Error [Nodal Officers Joined]:',
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
        console.error('Catch Error [Nodal Officers Page]:', err)
        setErrorMessage(msg)
      } finally {
        setLoading(false)
      }
    }

    loadNodalData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" /> Nodal Officers Duty Roster
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Specialized Wing Officers (VIP Security, Cyber Crime, Anti-Terrorist & Election Cell • Camp Office Ayodhya)
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
          {nodalList.length} Nodal Duties Active
        </span>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-bold text-slate-900">Querying Supabase Database...</p>
          <p className="text-xs text-slate-500 font-medium">Fetching `nodal_officers` table records</p>
        </div>
      ) : errorMessage ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 shadow-sm">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
          <div>
            <p className="font-extrabold text-rose-950">Supabase Query Error</p>
            <p className="text-xs text-rose-800 font-medium">{errorMessage}</p>
          </div>
        </div>
      ) : nodalList.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Nodal Duty Assignments Found</h3>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto mt-1">
            No assignments found in Supabase 'nodal_officers' table.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {nodalList.map((nodal) => {
            const officer = officerMap[nodal.officer_pno]
            return (
              <div
                key={nodal.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      Special Duty Nodal
                    </span>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> {nodal.status || 'Active'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-800 font-bold shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{officer?.name || 'Officer'}</h3>
                      <p className="text-xs text-blue-700 font-bold">{officer?.rank || 'N/A'}</p>
                      <p className="text-[10px] text-slate-500 font-medium">PNO: {nodal.officer_pno || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Assigned Subject Wing</span>
                    <p className="font-bold text-sm text-purple-900">{nodal.subject_duty || 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-[11px] font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Assigned: {nodal.assigned_date || 'N/A'}
                  </span>
                  <span className="text-slate-900 font-bold">Camp Office Ayodhya</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

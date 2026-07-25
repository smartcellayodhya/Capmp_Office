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
          console.error('Supabase Error [Nodal Officers Page]:', error)
          setErrorMessage(error.message)
        } else if (nodals) {
          setNodalList(nodals)

          // Fetch associated officer details from Supabase
          const pnos = Array.from(new Set(nodals.map((n) => n.officer_pno)))
          if (pnos.length > 0) {
            const { data: officersData } = await supabase
              .from('officers')
              .select('*')
              .in('pno', pnos)

            if (officersData) {
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
      <div className="flex items-center justify-between pb-2 border-b border-police-700/40">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Nodal Officers Duty Roster
          </h2>
          <p className="text-xs text-slate-400">
            Specialized Wing Officers (VIP Security, Cyber Crime, Anti-Terrorist & Election Cell • Live Supabase)
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
          {nodalList.length} Nodal Duties Active
        </span>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-police-900/60 rounded-2xl border border-police-700/60">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-sm font-semibold text-slate-200">Querying Supabase Database...</p>
          <p className="text-xs text-slate-400">Fetching `nodal_officers` table records</p>
        </div>
      ) : errorMessage ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
          <div>
            <p className="font-bold">Supabase Query Error</p>
            <p className="text-xs text-red-300/80">{errorMessage}</p>
          </div>
        </div>
      ) : nodalList.length === 0 ? (
        <div className="py-16 text-center bg-police-900/80 rounded-2xl border border-police-700/60 p-8">
          <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No Nodal Duty Assignments Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
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
                className="bg-police-900/80 backdrop-blur-sm border border-police-700/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Special Duty Nodal
                    </span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> {nodal.status || 'Active'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">{officer?.name || 'Officer'}</h3>
                      <p className="text-xs text-amber-400 font-medium">{officer?.rank || 'N/A'}</p>
                      <p className="text-[10px] text-slate-400">PNO: {nodal.officer_pno || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-police-850 border border-police-700/50 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Subject Wing</span>
                    <p className="font-bold text-sm text-purple-200">{nodal.subject_duty || 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-police-700/50 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" /> Assigned: {nodal.assigned_date || 'N/A'}
                  </span>
                  <span className="text-slate-300 font-medium">UP Police HQ</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

'use client'

import { mockApplications, mockOfficers } from '@/lib/mockData'
import { FileText, CheckCircle, Clock, AlertTriangle, Building2, User } from 'lucide-react'

export default function TransfersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-police-700/40">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" /> Posting & Transfer Applications
          </h2>
          <p className="text-xs text-slate-400">
            Pending, Approved & Administrative Transfer Requests (UP Police Directorate)
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
          {mockApplications.length} Requests Logged
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockApplications.map((app) => {
          const officer = mockOfficers.find((o) => o.pno === app.officer_pno)
          return (
            <div
              key={app.id}
              className="bg-police-900/80 backdrop-blur-sm border border-police-700/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-police-800 text-slate-300 border border-police-700">
                    PNO: {app.officer_pno}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      app.status === 'Pending'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-100">{officer?.name || 'Officer'}</h3>
                <p className="text-xs text-amber-400/90 font-medium mb-3">{officer?.rank}</p>

                <div className="space-y-2 text-xs bg-police-850 p-3 rounded-xl border border-police-700/50">
                  <div className="flex items-start gap-2 text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">From Current Station</span>
                      <strong className="text-slate-100">{app.current_station}</strong>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-slate-300 pt-1 border-t border-police-700/40">
                    <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-amber-400/80 block">To Requested Station</span>
                      <strong className="text-amber-300">{app.requested_station}</strong>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 italic mt-3 bg-police-950/60 p-2.5 rounded-lg border border-police-800">
                  "{app.reason}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-police-700/50 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5" /> {app.created_at}
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
    </div>
  )
}

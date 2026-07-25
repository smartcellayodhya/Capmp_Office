'use client'

import { useState } from 'react'
import { suspendOfficer } from '@/services/database'
import { OfficerWithCalculated } from '@/types/police'
import { X, UserX, Loader2, Check } from 'lucide-react'

interface SuspendModalProps {
  officer: OfficerWithCalculated | null
  onClose: () => void
  onSuccess: () => void
}

export function SuspendModal({ officer, onClose, onSuccess }: SuspendModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!officer) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setErrorMsg('Please specify the reason or departmental order reference.')
      return
    }

    setLoading(true)
    setErrorMsg(null)

    try {
      const { success: ok, error } = await suspendOfficer(officer.pno, reason.trim())
      if (error) {
        setErrorMsg(error.message)
      } else if (ok) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1000)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process suspension.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white border border-rose-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border-b border-rose-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-600/40 text-rose-200 border border-rose-500/40">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Suspend Personnel</h3>
              <p className="text-xs text-rose-200">Departmental Disciplinary Action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-rose-900 hover:bg-rose-800 text-rose-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
              {errorMsg}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" /> Officer status updated to Suspended!
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1">
            <p className="text-rose-700 text-[11px] font-semibold uppercase">Officer Selected</p>
            <h4 className="text-sm font-extrabold text-slate-900">{officer.name}</h4>
            <p className="text-xs text-rose-800 font-bold">PNO: {officer.pno} • Rank: {officer.rank}</p>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Reason / Order Reference Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Order Ref #402/2026 - Inquiry Pending"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-600 font-medium"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              This action flags the officer status as 'Suspended' across district command rosters.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirm Suspension</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

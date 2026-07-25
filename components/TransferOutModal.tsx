'use client'

import { useState } from 'react'
import { transferOutOfficer } from '@/services/database'
import { OfficerWithCalculated } from '@/types/police'
import { X, ExternalLink, Loader2, Check } from 'lucide-react'

interface TransferOutModalProps {
  officer: OfficerWithCalculated | null
  onClose: () => void
  onSuccess: () => void
}

export function TransferOutModal({ officer, onClose, onSuccess }: TransferOutModalProps) {
  const [destinationDistrict, setDestinationDistrict] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!officer) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!destinationDistrict.trim()) {
      setErrorMsg('Please specify the destination district or unit.')
      return
    }

    setLoading(true)
    setErrorMsg(null)

    try {
      const { success: ok, error } = await transferOutOfficer(officer.pno, destinationDistrict.trim())
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
      setErrorMsg(err.message || 'Failed to process transfer out.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/30 text-amber-300 border border-amber-400/30">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Transfer Out Officer</h3>
              <p className="text-xs text-slate-300">Ayodhya Police Camp Office Roster</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
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
              <Check className="w-4 h-4 text-emerald-600" /> Officer transferred out successfully!
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-slate-500 text-[11px] font-semibold uppercase">Officer Selected</p>
            <h4 className="text-sm font-extrabold text-slate-900">{officer.name}</h4>
            <p className="text-xs text-blue-700 font-bold">PNO: {officer.pno} • Rank: {officer.rank}</p>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Destination District / Unit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lucknow City / Varanasi Commissionerate / STF HQ"
              value={destinationDistrict}
              onChange={(e) => setDestinationDistrict(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Updating status to 'Transferred' will remove this officer from active Camp Office roster views.
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
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirm Transfer Out</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

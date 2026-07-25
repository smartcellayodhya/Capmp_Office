'use client'

import { useState } from 'react'
import { updateOfficerDuty } from '@/services/database'
import { getSmartDutyDisplay } from '@/lib/policeUtils'
import { OfficerWithCalculated } from '@/types/police'
import { X, Award, Loader2, Check, ShieldCheck, Building2 } from 'lucide-react'

interface AssignDutyModalProps {
  officer: OfficerWithCalculated | null
  onClose: () => void
  onSuccess: () => void
}

export function AssignDutyModal({ officer, onClose, onSuccess }: AssignDutyModalProps) {
  const [selectedDuty, setSelectedDuty] = useState(officer?.specialDuty || 'General Duty')
  const [postingStation, setPostingStation] = useState(officer?.current_posting || '')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!officer) return null

  // Calculate live nomenclature preview
  const liveSmartDisplay = getSmartDutyDisplay(officer.coreRank, selectedDuty)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      const { success: ok, error } = await updateOfficerDuty(officer.pno, selectedDuty, postingStation)
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
      setErrorMsg(err.message || 'Failed to update duty assignment.')
    } finally {
      setLoading(false)
    }
  }

  const dutyOptions = [
    { label: 'General Duty', value: 'General Duty' },
    { label: 'Thana Prabhari (SHO / SO)', value: 'Thana Prabhari' },
    { label: 'Chowki Incharge (चौकी प्रभारी)', value: 'Chowki Incharge' },
    { label: 'CCTNS (सीसीटीएनएस)', value: 'CCTNS' },
    { label: 'Munshi (का0मु0)', value: 'Munshi' },
    { label: 'Head Moharir (हे0मो0)', value: 'Head Moharir' },
    { label: 'Maalkhana Incharge (मालखाना)', value: 'Maalkhana Incharge' },
    { label: 'Driver (चालक)', value: 'Driver' },
    { label: 'LIU (एलआईयू)', value: 'LIU' },
    { label: 'Traffic (यातायात)', value: 'Traffic' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-400/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Smart Duty & Posting Assignment</h3>
              <p className="text-xs text-slate-300">Ayodhya Police Command Roster</p>
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
              <Check className="w-4 h-4 text-emerald-600" /> Duty assignment updated successfully!
            </div>
          )}

          {/* Officer Info Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-slate-500 text-[11px] font-semibold uppercase">Officer Selected</p>
            <h4 className="text-sm font-extrabold text-slate-900">{officer.name}</h4>
            <p className="text-xs text-blue-700 font-bold">PNO: {officer.pno} • Core Rank: {officer.coreRank}</p>
          </div>

          {/* Live Nomenclature Preview Box */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
              Smart Calculated Display Role
            </span>
            <div className="flex items-center gap-2 text-sm font-black text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>{liveSmartDisplay}</span>
            </div>
          </div>

          {/* Duty Select Dropdown */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Select Field Duty / Assignment *
            </label>
            <select
              value={selectedDuty}
              onChange={(e) => setSelectedDuty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-bold"
            >
              {dutyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Station / Posting Input */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600" /> Police Station / Unit Posting
            </label>
            <input
              type="text"
              placeholder="e.g. Police Station Kotwali Ayodhya / Outpost Ramjanmabhoomi"
              value={postingStation}
              onChange={(e) => setPostingStation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
            />
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
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Assignment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

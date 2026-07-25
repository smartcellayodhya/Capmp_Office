'use client'

import { useState } from 'react'
import { addOfficer } from '@/services/database'
import { OfficerTier, CasteCategory, OfficerStatus } from '@/types/supabase'
import { X, UserPlus, Shield, Loader2, Check } from 'lucide-react'

interface AddOfficerModalProps {
  defaultTier?: OfficerTier
  onClose: () => void
  onSuccess: () => void
}

export function AddOfficerModal({ defaultTier = 'Non-Gazetted', onClose, onSuccess }: AddOfficerModalProps) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    pno: '',
    name: '',
    rank: 'Sub-Inspector (SI)',
    officer_tier: defaultTier as OfficerTier,
    current_posting: 'Camp Office Ayodhya',
    role_type: 'Staff',
    caste_category: 'General' as CasteCategory,
    dob: '1988-01-01',
    joining_date: '2018-01-01',
    status: 'Active' as OfficerStatus,
    mobile_number: '',
    seat_assigned: 'Desk 1 - Main Desk'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.pno || !formData.name) {
      setErrorMsg('PNO Number and Officer Name are required.')
      return
    }

    setLoading(true)
    setErrorMsg(null)

    try {
      const { error } = await addOfficer(formData)
      if (error) {
        setErrorMsg(error.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1000)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add personnel record.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-400/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add New Personnel Record</h3>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
              {errorMsg}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" /> Record added successfully!
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">PNO Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. 182050012"
                value={formData.pno}
                onChange={(e) => setFormData({ ...formData, pno: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Inspector Ramesh Singh"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Officer Cadre/Tier</label>
              <select
                value={formData.officer_tier}
                onChange={(e) => setFormData({ ...formData, officer_tier: e.target.value as OfficerTier })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              >
                <option value="Gazetted">Gazetted (GOs)</option>
                <option value="Non-Gazetted">Non-Gazetted (NGOs)</option>
                <option value="Camp Staff">Camp Office Staff</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Rank</label>
              <input
                type="text"
                placeholder="e.g. Sub-Inspector / Inspector"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Current Station / Posting</label>
              <input
                type="text"
                value={formData.current_posting}
                onChange={(e) => setFormData({ ...formData, current_posting: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Role / Assignment</label>
              <input
                type="text"
                value={formData.role_type}
                onChange={(e) => setFormData({ ...formData, role_type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Seat / Desk Assigned</label>
              <input
                type="text"
                placeholder="e.g. Desk 4 - Personnel Wing"
                value={formData.seat_assigned}
                onChange={(e) => setFormData({ ...formData, seat_assigned: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Mobile Number</label>
              <input
                type="text"
                placeholder="e.g. 9454400100"
                value={formData.mobile_number}
                onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Caste Category</label>
              <select
                value={formData.caste_category}
                onChange={(e) => setFormData({ ...formData, caste_category: e.target.value as CasteCategory })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
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
              <span>Save Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

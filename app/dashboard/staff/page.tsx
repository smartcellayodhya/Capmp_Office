'use client'

import { useState, useEffect, useCallback } from 'react'
import { getOfficersByTier, bulkDeleteOfficers } from '@/services/database'
import { enrichOfficerData } from '@/lib/policeUtils'
import { OfficerWithCalculated } from '@/types/police'
import { StaffTable } from '@/components/StaffTable'
import { AddOfficerModal } from '@/components/AddOfficerModal'
import { TransferOutModal } from '@/components/TransferOutModal'
import { 
  Building2, 
  UserPlus, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Loader2, 
  ShieldAlert 
} from 'lucide-react'

export default function CampStaffPage() {
  const [staffList, setStaffList] = useState<OfficerWithCalculated[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [transferOfficer, setTransferOfficer] = useState<OfficerWithCalculated | null>(null)

  const loadStaffData = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    const timeoutPromise = new Promise<{ timeout: true }>((resolve) =>
      setTimeout(() => resolve({ timeout: true }), 8000)
    )

    try {
      const fetchPromise = getOfficersByTier('Camp Staff')
      const result = await Promise.race([fetchPromise, timeoutPromise])

      if ('timeout' in result) {
        console.warn('Query Timed Out [Camp Staff Page]')
        setErrorMessage('Connection timed out. Click Refresh Roster to try again.')
        setStaffList([])
        return
      }

      const { data, error } = result
      if (error) {
        console.error('Error fetching Camp Staff records:', error)
        setErrorMessage(error.message)
        setStaffList([])
      } else if (data) {
        const enriched = data.map((o) => enrichOfficerData(o))
        setStaffList(enriched)
      } else {
        setStaffList([])
      }
    } catch (err: any) {
      console.error('Catch error [Camp Staff Page]:', err)
      setErrorMessage(err.message || 'Failed to load Camp Staff records')
      setStaffList([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStaffData()
  }, [loadStaffData])

  const handleDeleteStaff = async (pno: string) => {
    if (!confirm(`Are you sure you want to delete staff record PNO: ${pno}?`)) return
    try {
      const { success, error } = await bulkDeleteOfficers([pno])
      if (error) {
        alert(`Error deleting record: ${error.message}`)
      } else if (success) {
        loadStaffData()
      }
    } catch (err: any) {
      alert(`Delete error: ${err.message}`)
    }
  }

  const handleBulkDelete = async () => {
    const pnosPrompt = prompt('Enter comma-separated PNO numbers to delete:')
    if (!pnosPrompt) return
    const pnos = pnosPrompt.split(',').map((p) => p.trim()).filter(Boolean)
    if (pnos.length === 0) return

    if (!confirm(`Confirm bulk deletion of ${pnos.length} record(s)?`)) return

    try {
      const { success, error } = await bulkDeleteOfficers(pnos)
      if (error) {
        alert(`Bulk delete error: ${error.message}`)
      } else if (success) {
        alert('Bulk deletion completed.')
        loadStaffData()
      }
    } catch (err: any) {
      alert(`Bulk delete error: ${err.message}`)
    }
  }

  // Active filter (status !== 'Transferred')
  const activeStaff = staffList.filter((s) => s.status !== 'Transferred')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Camp Office Staff Module
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Local Secretariat Staff & Seat Desk Allocations • Camp Office, SSP Ayodhya
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadStaffData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors border border-slate-300 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh Roster</span>
          </button>
        </div>
      </div>

      {/* Top Business Action Buttons */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>➕ Add Employee</span>
          </button>

          <button
            type="button"
            onClick={() => alert('Bulk Upload: Select a CSV/Excel file containing Camp Office staff columns (PNO, Name, Rank, Mobile, Seat Assigned).')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>⬆️ Bulk Upload</span>
          </button>

          <button
            type="button"
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>🗑️ Bulk Delete</span>
          </button>
        </div>

        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          {activeStaff.length} Active Employees Logged
        </span>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-bold text-slate-900">Loading Personnel Records...</p>
          <p className="text-xs text-slate-500 font-medium">Fetching Camp Office Staff Roster</p>
        </div>
      ) : errorMessage ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 shadow-sm">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
          <div className="flex-1">
            <p className="font-extrabold text-rose-950">Notice</p>
            <p className="text-xs text-rose-800 font-medium mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={loadStaffData}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
          >
            Retry
          </button>
        </div>
      ) : (
        <StaffTable
          staffList={activeStaff}
          onRefresh={loadStaffData}
          onTransferOut={(emp) => setTransferOfficer(emp)}
          onDelete={(pno) => handleDeleteStaff(pno)}
        />
      )}

      {/* Modals */}
      {showAddModal && (
        <AddOfficerModal
          defaultTier="Camp Staff"
          onClose={() => setShowAddModal(false)}
          onSuccess={loadStaffData}
        />
      )}

      {transferOfficer && (
        <TransferOutModal
          officer={transferOfficer}
          onClose={() => setTransferOfficer(null)}
          onSuccess={loadStaffData}
        />
      )}
    </div>
  )
}

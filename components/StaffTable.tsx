'use client'

import { useState } from 'react'
import { OfficerWithCalculated } from '@/types/police'
import { updateSeatAssigned } from '@/services/database'
import { 
  Building2, 
  Phone, 
  Edit2, 
  Check, 
  X, 
  Trash2, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react'

interface StaffTableProps {
  staffList: OfficerWithCalculated[]
  onRefresh: () => void
  onTransferOut: (officer: OfficerWithCalculated) => void
  onDelete: (pno: string) => void
}

export function StaffTable({ staffList = [], onRefresh, onTransferOut, onDelete }: StaffTableProps) {
  const [editingPno, setEditingPno] = useState<string | null>(null)
  const [newSeatValue, setNewSeatValue] = useState<string>('')
  const [savingPno, setSavingPno] = useState<string | null>(null)

  const handleStartEdit = (pno: string, currentSeat: string) => {
    setEditingPno(pno)
    setNewSeatValue(currentSeat || 'Desk 1 - Main Desk')
  }

  const handleSaveSeat = async (pno: string) => {
    if (!newSeatValue.trim()) return
    setSavingPno(pno)
    try {
      const { success, error } = await updateSeatAssigned(pno, newSeatValue.trim())
      if (error) {
        console.error('Error updating seat:', error)
      } else if (success) {
        onRefresh()
      }
    } catch (err) {
      console.error('Catch error updating seat:', err)
    } finally {
      setSavingPno(null)
      setEditingPno(null)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Table Header Bar */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" /> Camp Office Employees Roster
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Local Secretariat & Administrative Employees • Assigned Desks & Contact Numbers
          </p>
        </div>
        <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
          {staffList.length} Active Employee(s)
        </span>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200">
              <th className="py-3.5 px-4">PNO & Name</th>
              <th className="py-3.5 px-4">Rank & Cadre</th>
              <th className="py-3.5 px-4">Mobile Contact</th>
              <th className="py-3.5 px-4 bg-blue-50/50 border-x border-blue-100 text-blue-900">
                Seat / Desk Assigned (Editable)
              </th>
              <th className="py-3.5 px-4">Service Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-slate-400" />
                    <p className="font-bold text-slate-800">No Camp Office employees found.</p>
                    <p className="text-[11px] text-slate-500">Click "+ Add Employee" to create new personnel records.</p>
                  </div>
                </td>
              </tr>
            ) : (
              staffList.map((emp) => {
                const isEditing = editingPno === emp.pno
                const isSaving = savingPno === emp.pno

                return (
                  <tr key={emp.id || emp.pno} className="hover:bg-slate-50/90 transition-colors">
                    {/* PNO & Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900">{emp.name || 'Unknown'}</div>
                      <div className="text-[11px] text-slate-500 font-medium">PNO: {emp.pno}</div>
                    </td>

                    {/* Rank & Cadre */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{emp.rank || 'Staff'}</div>
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {emp.officer_tier}
                      </span>
                    </td>

                    {/* Mobile Contact */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{emp.mobile_number || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Seat / Desk Assigned (Inline Editable Column) */}
                    <td className="py-3.5 px-4 bg-blue-50/20 border-x border-blue-100">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={newSeatValue}
                            onChange={(e) => setNewSeatValue(e.target.value)}
                            className="bg-white border border-blue-400 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="e.g. Desk 4 - Personnel"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveSeat(emp.pno)}
                            disabled={isSaving}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            title="Save Desk Assignment"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingPno(null)}
                            className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group">
                          <span className="font-extrabold text-blue-900 text-xs">
                            {emp.seat_assigned || 'Desk 1 - Main Desk'}
                          </span>
                          <button
                            onClick={() => handleStartEdit(emp.pno, emp.seat_assigned || '')}
                            className="p-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-blue-700 hover:border-blue-300 transition-all opacity-80 group-hover:opacity-100"
                            title="Click to edit desk assignment"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        {emp.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onTransferOut(emp)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] flex items-center gap-1"
                          title="Transfer Out"
                        >
                          <ExternalLink className="w-3 h-3 text-amber-700" />
                          <span>Transfer Out</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(emp.pno)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 border border-slate-200 transition-colors"
                          title="Delete Employee Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

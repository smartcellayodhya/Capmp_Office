'use client'

import { useState, useMemo } from 'react'
import { OfficerWithCalculated } from '@/types/police'
import { TimelineModal } from './TimelineModal'
import { TransferOutModal } from './TransferOutModal'
import { SuspendModal } from './SuspendModal'
import { AssignDutyModal } from './AssignDutyModal'
import { 
  ShieldAlert, 
  AlertTriangle, 
  Award, 
  Eye,
  ExternalLink,
  Trash2,
  UserX,
  ShieldCheck,
  Tag,
  Briefcase,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface OfficerTableProps {
  officers?: OfficerWithCalculated[]
  onRefresh?: () => void
  onDeleteOfficer?: (pno: string) => void
}

export function OfficerTable({ officers = [], onRefresh, onDeleteOfficer }: OfficerTableProps) {
  const [selectedOfficer, setSelectedOfficer] = useState<OfficerWithCalculated | null>(null)
  const [transferOfficer, setTransferOfficer] = useState<OfficerWithCalculated | null>(null)
  const [suspendTarget, setSuspendTarget] = useState<OfficerWithCalculated | null>(null)
  const [assignDutyTarget, setAssignDutyTarget] = useState<OfficerWithCalculated | null>(null)

  // Quick Status Filter State: 'Active' | 'Suspended' | 'Transferred' | 'ALL'
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Suspended' | 'Transferred' | 'ALL'>('Active')

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(15)

  // Filtered officers list based on status toggle
  const filteredOfficers = useMemo(() => {
    return officers.filter((o) => {
      if (statusFilter === 'Active') return o.status !== 'Transferred' && o.status !== 'Suspended'
      if (statusFilter === 'Suspended') return o.status === 'Suspended'
      if (statusFilter === 'Transferred') return o.status === 'Transferred'
      return true
    })
  }, [officers, statusFilter])

  // Total pages calculation
  const totalPages = Math.max(1, Math.ceil(filteredOfficers.length / pageSize))

  // Paginated slice for current page
  const paginatedOfficers = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize
    return filteredOfficers.slice(startIdx, startIdx + pageSize)
  }, [filteredOfficers, currentPage, pageSize])

  // Reset page to 1 when filter changes
  const handleStatusFilterChange = (filter: 'Active' | 'Suspended' | 'Transferred' | 'ALL') => {
    setStatusFilter(filter)
    setCurrentPage(1)
  }

  // Helper for Special Duty pill color styling
  const getSpecialDutyBadge = (dutyDisplay: string = 'General Duty') => {
    if (dutyDisplay.includes('SHO')) {
      return 'bg-amber-100 text-amber-950 border-amber-300 font-black'
    }
    if (dutyDisplay.includes('SO')) {
      return 'bg-blue-100 text-blue-950 border-blue-300 font-black'
    }
    if (dutyDisplay.includes('Chowki Incharge')) {
      return 'bg-purple-100 text-purple-950 border-purple-300 font-black'
    }
    if (dutyDisplay.includes('CCTNS')) {
      return 'bg-indigo-100 text-indigo-900 border-indigo-200 font-bold'
    }
    if (dutyDisplay.includes('Maalkhana')) {
      return 'bg-amber-50 text-amber-900 border-amber-200 font-bold'
    }
    if (dutyDisplay.includes('Munshi')) {
      return 'bg-blue-50 text-blue-900 border-blue-200 font-bold'
    }
    return 'bg-slate-100 text-slate-700 border-slate-200 font-medium'
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm space-y-0">
      {/* Table Header Bar & Quick Status Toggle */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" /> Cadre Personnel Management Roster
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Paginated roster list • Filter status, assign duties, and process transfers
          </p>
        </div>

        {/* Quick Status Toggle Bar */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start md:self-center">
          <button
            type="button"
            onClick={() => handleStatusFilterChange('Active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'Active'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Show Active ({officers.filter((o) => o.status !== 'Transferred' && o.status !== 'Suspended').length})
          </button>

          <button
            type="button"
            onClick={() => handleStatusFilterChange('Suspended')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'Suspended'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Show Suspended ({officers.filter((o) => o.status === 'Suspended').length})
          </button>

          <button
            type="button"
            onClick={() => handleStatusFilterChange('Transferred')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'Transferred'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Show Transferred ({officers.filter((o) => o.status === 'Transferred').length})
          </button>

          <button
            type="button"
            onClick={() => handleStatusFilterChange('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All ({officers.length})
          </button>
        </div>
      </div>

      {/* SCROLLABLE CONTAINER & STICKY HEADER (Instruction 2) */}
      <div className="max-h-[550px] overflow-y-auto relative">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-md z-10 border-b border-slate-200 shadow-2xs">
            <tr className="text-slate-700 uppercase tracking-wider font-extrabold">
              <th className="py-3 px-4">PNO & Name</th>
              <th className="py-3 px-4">Core Rank</th>
              <th className="py-3 px-4">Field Duty Role</th>
              <th className="py-3 px-4">Current Posting</th>
              <th className="py-3 px-4">Gender</th>
              <th className="py-3 px-4">Service Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {paginatedOfficers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-slate-400" />
                    <p className="font-bold text-slate-800">No personnel found for status filter '{statusFilter}'.</p>
                    <p className="text-[11px] text-slate-500">Toggle status filter above or add new records.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedOfficers.map((o) => (
                <tr
                  key={o.id || o.pno}
                  className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                  onClick={() => setSelectedOfficer(o)}
                >
                  {/* PNO & Name */}
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {o.name || 'Unknown Officer'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">PNO: {o.pno || 'N/A'}</div>
                  </td>

                  {/* Core Rank */}
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-slate-900">{o.coreRank || 'Constable'}</span>
                    <div className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]" title={o.rank}>
                      {o.rank}
                    </div>
                  </td>

                  {/* Field Duty Role Pill */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full border ${getSpecialDutyBadge(
                        o.smartDutyDisplay || o.specialDuty
                      )}`}
                    >
                      <Tag className="w-2.5 h-2.5 opacity-80" />
                      {o.smartDutyDisplay || o.specialDuty || 'General Duty'}
                    </span>
                  </td>

                  {/* Current Posting & Tenure */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 truncate" title={o.current_posting || 'N/A'}>
                      {o.current_posting || 'N/A'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <span>Tenure: {o.tenureMonths ?? 0}m</span>
                      {o.isOverstay && (
                        <span className="text-[10px] text-rose-700 font-extrabold flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> Overstay
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Gender */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                        o.gender === 'Female'
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      {o.gender || 'Male'}
                    </span>
                  </td>

                  {/* Service Status */}
                  <td className="py-3 px-4">
                    {o.status === 'Suspended' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-2xs animate-pulse">
                        <UserX className="w-3 h-3" /> Suspended
                      </span>
                    ) : o.status === 'Transferred' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Transferred
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> {o.status || 'Active'}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {o.status !== 'Transferred' && (
                        <button
                          type="button"
                          onClick={() => setAssignDutyTarget(o)}
                          className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 font-bold text-[11px] flex items-center gap-1 transition-colors"
                          title="Assign Smart Duty"
                        >
                          <Briefcase className="w-3 h-3 text-blue-700" />
                          <span>Assign</span>
                        </button>
                      )}

                      {o.status !== 'Suspended' && o.status !== 'Transferred' && (
                        <button
                          type="button"
                          onClick={() => setSuspendTarget(o)}
                          className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[11px] flex items-center gap-1 transition-colors"
                          title="Issue Disciplinary Suspension"
                        >
                          <UserX className="w-3 h-3 text-rose-600" />
                          <span>Suspend</span>
                        </button>
                      )}

                      {o.status !== 'Transferred' && (
                        <button
                          type="button"
                          onClick={() => setTransferOfficer(o)}
                          className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] flex items-center gap-1 transition-colors"
                          title="Transfer Out"
                        >
                          <ExternalLink className="w-3 h-3 text-amber-700" />
                          <span>Transfer</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedOfficer(o)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-blue-700 border border-slate-300 transition-all"
                        title="View Career Timeline"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                      </button>

                      {onDeleteOfficer && (
                        <button
                          type="button"
                          onClick={() => onDeleteOfficer(o.pno)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 border border-slate-200 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CLIENT-SIDE PAGINATION CONTROLS BAR (Instruction 1) */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-slate-600 font-medium">
          <span>
            Showing <strong className="text-slate-900">{filteredOfficers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong className="text-slate-900">{Math.min(currentPage * pageSize, filteredOfficers.length)}</strong> of{' '}
            <strong className="text-slate-900">{filteredOfficers.length}</strong> entries
          </span>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-800 focus:outline-none"
          >
            <option value={10}>10 per page</option>
            <option value={15}>15 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        {/* Previous & Next Page Navigation */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold disabled:opacity-40 disabled:hover:bg-white flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="px-3 py-1.5 font-extrabold text-slate-900 bg-white border border-slate-200 rounded-lg">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold disabled:opacity-40 disabled:hover:bg-white flex items-center gap-1 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {selectedOfficer && (
        <TimelineModal
          officer={selectedOfficer}
          onClose={() => setSelectedOfficer(null)}
        />
      )}

      {transferOfficer && (
        <TransferOutModal
          officer={transferOfficer}
          onClose={() => setTransferOfficer(null)}
          onSuccess={() => {
            if (onRefresh) onRefresh()
          }}
        />
      )}

      {suspendTarget && (
        <SuspendModal
          officer={suspendTarget}
          onClose={() => setSuspendTarget(null)}
          onSuccess={() => {
            if (onRefresh) onRefresh()
          }}
        />
      )}

      {assignDutyTarget && (
        <AssignDutyModal
          officer={assignDutyTarget}
          onClose={() => setAssignDutyTarget(null)}
          onSuccess={() => {
            if (onRefresh) onRefresh()
          }}
        />
      )}
    </div>
  )
}

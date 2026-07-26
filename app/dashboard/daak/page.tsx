'use client'

import { useState } from 'react'
import { DaakRegisterModal } from '@/components/DaakRegisterModal'
import { exportOfficersToExcel } from '@/lib/policeUtils'
import { 
  FileCheck, 
  Camera, 
  BrainCircuit, 
  Search, 
  FileSpreadsheet, 
  Tag, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react'

interface DaakRecord {
  id: string
  daakNumber: string
  senderDept: string
  targetOffice: string
  aiSuggestedOffice: string
  summary: string
  snapshotUrl?: string
  status: 'Inward Received' | 'Dispatched' | 'Action Pending'
  date: string
  confidenceScore: number
}

const INITIAL_DAAK_RECORDS: DaakRecord[] = [
  {
    id: 'daak-101',
    daakNumber: 'DAAK/2026/AYO-4819',
    senderDept: 'थाना प्रभारी, कोतवाली अयोध्या',
    targetOffice: 'स्थापना शाखा (Establishment Wing)',
    aiSuggestedOffice: 'स्थापना शाखा (Establishment Wing)',
    summary: 'विषय: आरक्षी राम प्रकाश (PNO 182050099) के 10 दिवस आकस्मिक अवकाश एवं चिकित्सा प्रमाण पत्र स्वीकृति हेतु।',
    status: 'Inward Received',
    date: '26 Jul 2026',
    confidenceScore: 98
  },
  {
    id: 'daak-102',
    daakNumber: 'DAAK/2026/AYO-3920',
    senderDept: 'कार्यालय पुलिस अधीक्षक (नगर)',
    targetOffice: 'सुरक्षा शाखा (Security Wing)',
    aiSuggestedOffice: 'सुरक्षा शाखा (Security Wing)',
    summary: 'विषय: आगामी श्रावणी मेला सुरक्षा व्यवस्था एवं अतिरिक्त पुलिस बल तैनाती के संबंध में दिशा-निर्देश।',
    status: 'Dispatched',
    date: '25 Jul 2026',
    confidenceScore: 97
  },
  {
    id: 'daak-103',
    daakNumber: 'DAAK/2026/AYO-1102',
    senderDept: 'जनसुनवाई पोर्टल (IGRS Cell)',
    targetOffice: 'IGRS / जनसुनवाई सेल',
    aiSuggestedOffice: 'IGRS / जनसुनवाई सेल',
    summary: 'विषय: ऑनलाइन आईजीआरएस शिकायत संदर्भ सं0 4001928374 के त्वरित निस्तारण एवं रिपोर्ट प्रेषण हेतु।',
    status: 'Action Pending',
    date: '25 Jul 2026',
    confidenceScore: 95
  },
  {
    id: 'daak-104',
    daakNumber: 'DAAK/2026/AYO-9402',
    senderDept: 'प्रभारी निरीक्षक, क्राइम ब्रांच',
    targetOffice: 'क्राइम ब्रांच (Crime Branch)',
    aiSuggestedOffice: 'क्राइम ब्रांच (Crime Branch)',
    summary: 'विषय: मु0अ0सं0 482/2026 धारा 307 IPC विवेचना आख्या एवं साक्ष्य संकलन रिपोर्ट प्रेषण हेतु।',
    status: 'Dispatched',
    date: '24 Jul 2026',
    confidenceScore: 96
  }
]

export default function DaakRegisterPage() {
  const [records, setRecords] = useState<DaakRecord[]>(INITIAL_DAAK_RECORDS)
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const handleAddSuccess = (newRecord: DaakRecord) => {
    setRecords([newRecord, ...records])
  }

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.daakNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.senderDept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.targetOffice.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleExport = () => {
    const exportData: any = filteredRecords.map((r) => ({
      'Daak Dispatch No': r.daakNumber,
      'Sender Department': r.senderDept,
      'Target Office': r.targetOffice,
      'AI Suggested Office': r.aiSuggestedOffice,
      'AI Confidence (%)': `${r.confidenceScore}%`,
      'Extracted Summary': r.summary,
      'Status': r.status,
      'Date': r.date
    }))
    exportOfficersToExcel(exportData as any, 'Digital_Daak_Register.xlsx')
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Digital Daak Register <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200">AI Live Scanner</span>
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Live Webcam Document Scanning, Real-Time OCR Text Extraction & AI Learned Destination Routing
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all shrink-0"
        >
          <Camera className="w-4 h-4 text-amber-300" />
          <span>New Daak Entry (Live Camera Scan)</span>
        </button>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Scanned Daak</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{records.length}</h3>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Accuracy Rate</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">97.4%</h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <BrainCircuit className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Action Pending</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {records.filter((r) => r.status === 'Action Pending').length}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Daak No, Subject, Department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-500 text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="Inward Received">Inward Received</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Action Pending">Action Pending</option>
          </select>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-xs shadow-2xs transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Register</span>
          </button>
        </div>
      </div>

      {/* Main Daak Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-600" /> Scanned Daak Records ({filteredRecords.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Daak Dispatch No.</th>
                <th className="py-3.5 px-6">Sender Department</th>
                <th className="py-3.5 px-6 max-w-md">AI Extracted Summary / Subject</th>
                <th className="py-3.5 px-6">Target Destination Office</th>
                <th className="py-3.5 px-6">AI Confidence</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-blue-600">{r.daakNumber}</td>
                  <td className="py-4 px-6 font-bold text-slate-900">{r.senderDept}</td>
                  <td className="py-4 px-6 max-w-md">
                    <p className="font-medium text-slate-800 line-clamp-2">{r.summary}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                      <Building2 className="w-3 h-3 text-blue-600" /> {r.targetOffice}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {r.confidenceScore}%
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {r.status === 'Inward Received' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                        Inward Received
                      </span>
                    ) : r.status === 'Dispatched' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Dispatched
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Action Pending
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-500">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <DaakRegisterModal
          onClose={() => setShowModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  )
}

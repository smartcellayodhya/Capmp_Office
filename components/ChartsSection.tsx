'use client'

import { useState, useMemo, useRef } from 'react'
import { OfficerWithCalculated } from '@/types/police'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts'
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Users, 
  Download, 
  Maximize2,
  Clock
} from 'lucide-react'
import { exportOfficersToExcel } from '@/lib/policeUtils'

interface ChartsSectionProps {
  officers: OfficerWithCalculated[]
  tierName: string
}

const CASTE_COLORS: Record<string, string> = {
  General: '#2563EB', // Blue 600
  OBC: '#059669',     // Emerald 600
  SC: '#D97706',      // Amber 600
  ST: '#7C3AED',      // Purple 600
  'N/A': '#64748B'    // Slate 500
}

export function ChartsSection({ officers = [], tierName }: ChartsSectionProps) {
  const [activeTab, setActiveTab] = useState<'cadre' | 'trend' | 'retirement' | 'gender'>('cadre')
  const chartRef = useRef<HTMLDivElement>(null)

  // 1. Rank Distribution Data (Horizontal Bar)
  const rankData = useMemo(() => {
    const counts: Record<string, number> = {
      'Inspector': 0,
      'Sub-Inspector': 0,
      'Head Constable': 0,
      'Constable': 0,
      'Computer Operator': 0,
      'Gazetted Officer': 0
    }

    officers.forEach((o) => {
      const r = o.coreRank || 'Constable'
      counts[r] = (counts[r] || 0) + 1
    })

    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  }, [officers])

  // 2. Caste Category Ratio Data (Donut Chart)
  const casteData = useMemo(() => {
    const counts: Record<string, number> = { General: 0, OBC: 0, SC: 0, ST: 0 }
    officers.forEach((o) => {
      const category = o.caste_category || 'General'
      counts[category] = (counts[category] || 0) + 1
    })

    return Object.entries(counts).map(([name, count]) => ({
      name,
      value: count,
      color: CASTE_COLORS[name] || '#64748B'
    }))
  }, [officers])

  // 3. Retirement Timeline Area Chart Data
  const retirementTimelineData = useMemo(() => {
    const timeline = [
      { range: '0-3 Mos', count: 0 },
      { range: '3-6 Mos', count: 0 },
      { range: '6-12 Mos', count: 0 },
      { range: '1-2 Yrs', count: 0 },
      { range: '2+ Yrs', count: 0 }
    ]

    officers.forEach((o) => {
      const m = o.retirementMonthsRemaining
      if (m >= 0 && m <= 3) timeline[0].count++
      else if (m > 3 && m <= 6) timeline[1].count++
      else if (m > 6 && m <= 12) timeline[2].count++
      else if (m > 12 && m <= 24) timeline[3].count++
      else timeline[4].count++
    })

    return timeline
  }, [officers])

  // 4. Monthly Joining Trend Data
  const joiningTrendData = useMemo(() => {
    return [
      { month: 'Jan', count: 12 },
      { month: 'Feb', count: 19 },
      { month: 'Mar', count: 8 },
      { month: 'Apr', count: 24 },
      { month: 'May', count: 30 },
      { month: 'Jun', count: 18 },
      { month: 'Jul', count: 22 }
    ]
  }, [])

  // 5. Gender Distribution Donut Chart Data
  const genderData = useMemo(() => {
    let male = 0
    let female = 0
    officers.forEach((o) => {
      if (o.gender === 'Female') female++
      else male++
    })
    return [
      { name: 'Male Personnel', value: male, color: '#1E40AF' },
      { name: 'Female Personnel', value: female, color: '#9333EA' }
    ]
  }, [officers])

  const handleExportCSV = () => {
    exportOfficersToExcel(officers, `${tierName.replace(/\s+/g, '_')}_Analytics.xlsx`)
  }

  return (
    <div ref={chartRef} className="space-y-4">
      {/* Visual Analytics Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              Advanced Executive Force Analytics
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Multi-dimensional analysis across cadre strength, retirement timelines & gender representation
            </p>
          </div>
        </div>

        {/* Tab Switcher & Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('cadre')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'cadre' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cadre Strength
            </button>
            <button
              onClick={() => setActiveTab('retirement')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'retirement' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Retirement Timeline
            </button>
            <button
              onClick={() => setActiveTab('gender')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'gender' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gender & Caste
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2-Column Main Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          {activeTab === 'cadre' && (
            <>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Core Rank Strength Distribution</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Rank-wise total active personnel count ({tierName})</p>
                </div>
                <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  {officers.length} Active Officers
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rankData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E2E8F0',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar dataKey="count" fill="#1D4ED8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeTab === 'retirement' && (
            <>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Retirement Horizon Area Analysis</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Personnel retiring across time horizons</p>
                </div>
                <span className="text-[11px] font-extrabold text-orange-800 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                  Pension Roster
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={retirementTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="range" tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#EA580C" fill="#FFEDD5" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeTab === 'gender' && (
            <>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Monthly Force Joining Trend</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Recent personnel inductions & transfers in</p>
                </div>
                <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Monthly Growth
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={joiningTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>

        {/* Right 1-Column Donut Ratio Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Gender & Caste Ratio</h3>
                <p className="text-[11px] text-slate-500 font-medium">Demographic breakdown</p>
              </div>
            </div>
          </div>

          <div className="h-52 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeTab === 'gender' ? genderData : casteData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(activeTab === 'gender' ? genderData : casteData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={(entry as any).color || '#2563EB'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
            {casteData.map((c) => (
              <div key={c.name} className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-bold">{c.name}: </span>
                <strong className="text-slate-900 font-extrabold">{c.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

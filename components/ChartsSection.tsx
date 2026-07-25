'use client'

import { useMemo } from 'react'
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
  CartesianGrid
} from 'recharts'
import { BarChart3, PieChart as PieIcon, Download } from 'lucide-react'
import { exportOfficersToExcel } from '@/lib/policeUtils'

interface ChartsSectionProps {
  officers: OfficerWithCalculated[]
  tierName: string
}

const CATEGORY_COLORS: Record<string, string> = {
  General: '#2563EB', // Blue 600
  OBC: '#059669',     // Emerald 600
  SC: '#D97706',      // Amber 600
  ST: '#7C3AED',      // Purple 600
  Minority: '#DC2626' // Red 600
}

export function ChartsSection({ officers = [], tierName }: ChartsSectionProps) {
  // 1. Core Rank Bar Chart Data
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

  // 2. Strict 5-Category Caste Ratio Data (.reduce() transformation)
  const casteData = useMemo(() => {
    const categoryCounts: Record<string, number> = {
      General: 0,
      OBC: 0,
      SC: 0,
      ST: 0,
      Minority: 0
    }

    officers.forEach((o) => {
      const str = (o.caste_category || '').toLowerCase()
      let category = 'General'

      if (str.includes('सामान्य') || str.includes('general')) category = 'General'
      else if (str.includes('ओबीसी') || str.includes('पि0') || str.includes('obc')) category = 'OBC'
      else if (str.includes('एससी') || str.includes('अनु0') || str.includes('sc')) category = 'SC'
      else if (str.includes('एसटी') || str.includes('st')) category = 'ST'
      else if (str.includes('मुस्लिम') || str.includes('सिख') || str.includes('अल्प') || str.includes('minority')) category = 'Minority'

      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })

    return Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      value: count,
      color: CATEGORY_COLORS[name] || '#64748B'
    }))
  }, [officers])

  const handleExportCSV = () => {
    exportOfficersToExcel(officers, `${tierName.replace(/\s+/g, '_')}_Analytics.xlsx`)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      {/* LEFT: Core Rank Strength Distribution (2 Columns, Fixed Height h-[380px]) */}
      <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[380px]">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Core Rank Strength Distribution</h3>
              <p className="text-xs text-slate-500 font-medium">Cadre strength across district force</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>
        </div>

        <div className="flex-1 w-full min-h-0 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rankData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} 
                tickLine={false}
                interval={0}
              />
              <YAxis allowDecimals={false} tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
                }}
              />
              <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RIGHT: Clean Donut Chart (1 Column, Fixed Height h-[380px], Clean Recharts Legend) */}
      <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[380px]">
        <div className="flex items-center gap-2.5 mb-2 pb-2 border-b border-slate-100 shrink-0">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Caste Category Ratio</h3>
            <p className="text-xs text-slate-500 font-medium">Demographic ratio across 5 categories</p>
          </div>
        </div>

        <div className="flex-1 w-full min-h-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={casteData}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {casteData.map((entry, index) => (
                  <Cell key={`caste-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={40}
                formatter={(value: string) => (
                  <span className="text-slate-700 text-xs font-bold ml-1">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

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
  Legend
} from 'recharts'
import { BarChart3, PieChart as PieIcon, ShieldAlert } from 'lucide-react'

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
  // Rank Distribution Data
  const rankData = useMemo(() => {
    const counts: Record<string, number> = {}
    officers.forEach((o) => {
      let shortRank = o.rank || 'Unassigned'
      if (shortRank.includes('Senior Superintendent')) shortRank = 'SSP'
      else if (shortRank.includes('Additional Superintendent') || shortRank.includes('Addl SP')) shortRank = 'Addl SP'
      else if (shortRank.includes('Deputy SP') || shortRank.includes('Circle Officer')) shortRank = 'CO / DSP'
      else if (shortRank.includes('Inspector')) shortRank = 'Inspector'
      else if (shortRank.includes('Sub-Inspector')) shortRank = 'Sub-Inspector'
      else if (shortRank.includes('Head Constable')) shortRank = 'Head Constable'

      counts[shortRank] = (counts[shortRank] || 0) + 1
    })

    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  }, [officers])

  // Caste Category Distribution Data
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Rank-wise Bar Chart - Crisp Light Theme */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Rank-Wise Cadre Strength Distribution
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Active personnel strength by rank ({tierName})
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {officers.length} Active Officers
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rankData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '12px',
                  color: '#0F172A',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                cursor={{ fill: 'rgba(241, 245, 249, 0.8)' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {rankData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 2 === 0 ? '#1D4ED8' : '#0284C7'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Caste Category Distribution Pie Chart - Crisp Light Theme */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Caste Category Ratio
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Diversity & category breakup
              </p>
            </div>
          </div>
          <ShieldAlert className="w-4 h-4 text-slate-400" />
        </div>

        <div className="h-56 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={casteData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
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
                  color: '#0F172A',
                  fontSize: '12px',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-slate-700 text-xs font-semibold ml-1">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
          {casteData.map((c) => (
            <div key={c.name} className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium">{c.name}: </span>
              <strong className="text-slate-900 font-bold">{c.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

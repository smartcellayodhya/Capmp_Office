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
  General: '#3B82F6', // Blue
  OBC: '#10B981',     // Emerald
  SC: '#F59E0B',      // Amber
  ST: '#8B5CF6',      // Purple
  'N/A': '#94A3B8'    // Slate
}

const BAR_COLOR = '#D4AF37' // UP Police Gold accent

export function ChartsSection({ officers = [], tierName }: ChartsSectionProps) {
  // Rank Distribution Data (using snake_case rank property)
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

  // Caste Category Distribution Data (using snake_case caste_category property)
  const casteData = useMemo(() => {
    const counts: Record<string, number> = { General: 0, OBC: 0, SC: 0, ST: 0 }
    officers.forEach((o) => {
      const category = o.caste_category || 'General'
      counts[category] = (counts[category] || 0) + 1
    })

    return Object.entries(counts).map(([name, count]) => ({
      name,
      value: count,
      color: CASTE_COLORS[name] || '#94A3B8'
    }))
  }, [officers])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Rank-wise Bar Chart */}
      <div className="lg:col-span-2 bg-police-900/80 backdrop-blur-sm border border-police-700/60 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-police-700/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Rank-Wise Cadre Strength Distribution
              </h2>
              <p className="text-[11px] text-slate-400">
                Active personnel strength by rank ({tierName})
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            {officers.length} Active Officers
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rankData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                }}
                cursor={{ fill: 'rgba(51, 65, 85, 0.3)' }}
              />
              <Bar dataKey="count" fill={BAR_COLOR} radius={[6, 6, 0, 0]}>
                {rankData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 2 === 0 ? '#D4AF37' : '#3B82F6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Caste Category Distribution Pie Chart */}
      <div className="bg-police-900/80 backdrop-blur-sm border border-police-700/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-police-700/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Caste Category Ratio
              </h2>
              <p className="text-[11px] text-slate-400">
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
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                  fontSize: '12px'
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-slate-300 text-xs font-medium ml-1">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 pt-3 border-t border-police-700/50 grid grid-cols-2 gap-2 text-center text-xs">
          {casteData.map((c) => (
            <div key={c.name} className="px-2 py-1 rounded bg-police-850/60 border border-police-700/40">
              <span className="text-slate-400">{c.name}: </span>
              <strong className="text-slate-100">{c.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

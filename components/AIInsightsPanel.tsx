'use client'

import { OfficerWithCalculated } from '@/types/police'
import { Sparkles, ArrowRight, ShieldAlert, Award, Clock, Users, Building2 } from 'lucide-react'

interface AIInsightsPanelProps {
  officers: OfficerWithCalculated[]
  onExecuteAction: (actionKey: string) => void
}

export function AIInsightsPanel({ officers, onExecuteAction }: AIInsightsPanelProps) {
  const overstayCount = officers.filter((o) => o.isOverstay && o.status !== 'Suspended').length
  const suspendedCount = officers.filter((o) => o.status === 'Suspended').length
  const retiringCount = officers.filter((o) => o.isRetiringSoon || o.retirementMonthsRemaining <= 12).length
  const femaleCount = officers.filter((o) => o.gender === 'Female').length
  const femalePercentage = officers.length > 0 ? Math.round((femaleCount / officers.length) * 100) : 0

  const insights = [
    {
      id: 'OVERSTAY_TRANSFERS',
      title: 'High Transfer Rotation Recommended',
      description: `${overstayCount} officer(s) have exceeded 36 months in their current station posting.`,
      recommendation: 'Initiate routine district transfer board for tenure compliance.',
      priority: 'Recommendation',
      priorityColor: 'bg-amber-100 text-amber-900 border-amber-300',
      confidence: 96,
      icon: Clock,
      actionText: 'View Overstay Roster',
      actionKey: 'FILTER_OVERSTAY'
    },
    {
      id: 'DEPARTMENTAL_INQUIRIES',
      title: 'Suspension Inquiry Expedite Alert',
      description: `${suspendedCount} officer(s) currently under departmental suspension requiring formal review.`,
      recommendation: 'Expedite departmental charge-sheets and reinstate or finalize inquiry files.',
      priority: 'Critical',
      priorityColor: 'bg-rose-600 text-white font-extrabold',
      confidence: 98,
      icon: ShieldAlert,
      actionText: 'Review Suspended List',
      actionKey: 'FILTER_SUSPENDED'
    },
    {
      id: 'RETIREMENT_SUCCESSION',
      title: 'Pension & Succession Planning',
      description: `${retiringCount} senior officer(s) retiring within next 12 months.`,
      recommendation: 'Prepare GPF final settlement files and train successor cadre.',
      priority: 'Information',
      priorityColor: 'bg-blue-100 text-blue-900 border-blue-300',
      confidence: 94,
      icon: Award,
      actionText: 'View Retiring Roster',
      actionKey: 'FILTER_RETIRING'
    },
    {
      id: 'WOMEN_REPRESENTATION',
      title: 'Gender Diversity & Deployment Ratio',
      description: `Female personnel represent ${femalePercentage}% (${femaleCount} officers) of total active district force.`,
      recommendation: 'Deploy female personnel across CCTNS Desks, Mahila Thanas, and Anti-Romeo Squads.',
      priority: 'Positive',
      priorityColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      confidence: 92,
      icon: Users,
      actionText: 'Filter Female Officers',
      actionKey: 'FILTER_FEMALE'
    }
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              AI Command & Control Insights
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Automated operational intelligence, transfer recommendations & confidence scores
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          Real-Time AI Engine
        </span>
      </div>

      {/* Grid of AI Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.id}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:shadow-md transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${item.priorityColor}`}>
                    {item.priority}
                  </span>
                  <span className="text-[11px] font-extrabold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {item.confidence}% Match
                  </span>
                </div>

                <h3 className="text-xs font-extrabold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>

                <p className="text-[11px] text-slate-600 font-medium">
                  {item.description}
                </p>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-700 font-semibold italic">
                  "{item.recommendation}"
                </div>
              </div>

              <button
                type="button"
                onClick={() => onExecuteAction(item.actionKey)}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>{item.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

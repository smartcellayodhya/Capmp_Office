'use client'

import { useState } from 'react'
import { executeAIQuery, AIQueryResult } from '@/lib/aiQueryEngine'
import { OfficerWithCalculated } from '@/types/police'
import { Sparkles, Search, ArrowRight, Download, CheckCircle } from 'lucide-react'
import { exportOfficersToExcel } from '@/lib/policeUtils'

interface NaturalLanguageQueryProps {
  officers: OfficerWithCalculated[]
  onSelectFilterResult: (officerList: OfficerWithCalculated[]) => void
}

export function NaturalLanguageQuery({
  officers,
  onSelectFilterResult
}: NaturalLanguageQueryProps) {
  const [queryInput, setQueryInput] = useState('')
  const [activeResult, setActiveResult] = useState<AIQueryResult | null>(null)

  const handleRunQuery = (textToRun: string) => {
    if (!textToRun.trim()) return
    const result = executeAIQuery(textToRun, officers)
    setActiveResult(result)
    onSelectFilterResult(result.officers)
  }

  const handleExport = () => {
    if (activeResult && activeResult.officers.length > 0) {
      exportOfficersToExcel(activeResult.officers, `${activeResult.title.replace(/\s+/g, '_')}.xlsx`)
    }
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
      {/* Sleek Slim Query Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleRunQuery(queryInput)
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600 flex items-center gap-1.5 pointer-events-none">
            <Sparkles className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Ask AI Copilot in Hindi / English (e.g. 'Show suspended officers', 'Who retires this year?')..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-500 text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:bg-white transition-all shadow-inner"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>Run AI Search</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* AI Query Result Popup Card */}
      {activeResult && (
        <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <h4 className="font-extrabold text-slate-900">{activeResult.title}</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold text-[10px]">
                {activeResult.confidenceScore}% Confidence
              </span>
              <button
                type="button"
                onClick={handleExport}
                className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-[11px] flex items-center gap-1 shadow-2xs"
              >
                <Download className="w-3 h-3 text-purple-600" /> Export
              </button>
            </div>
          </div>
          <p className="text-slate-600 font-medium text-[11px]">{activeResult.summary}</p>
        </div>
      )}
    </div>
  )
}

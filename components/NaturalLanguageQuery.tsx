'use client'

import { useState } from 'react'
import { executeAIQuery, AIQueryResult } from '@/lib/aiQueryEngine'
import { OfficerWithCalculated } from '@/types/police'
import { Sparkles, Search, ArrowRight, Download, CheckCircle, HelpCircle } from 'lucide-react'
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

  const suggestedPrompts = [
    'Show suspended officers',
    'Who retires this year?',
    'List all Inspectors',
    'Show female constables',
    'Show officers overstaying >36m',
    'Officers with missing mobile numbers'
  ]

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
    <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-xl border border-blue-800/40 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-800/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-400/30">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              Natural Language AI Roster Query (Hindi & English)
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              Ask operational questions in plain English or Hindi to instantly generate filtered rosters & analytics
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-blue-600/40 text-blue-200 border border-blue-400/40 text-xs font-bold self-start sm:self-center">
          Hindi / English NLP Engine
        </span>
      </div>

      {/* Query Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleRunQuery(queryInput)
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            placeholder="e.g. 'Show suspended officers', 'Who retires in 6 months?', 'List all Inspectors'..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className="w-full bg-slate-900/80 text-white placeholder:text-slate-400 text-xs font-semibold pl-11 pr-4 py-3 rounded-xl border border-blue-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>Run AI Query</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Suggested:</span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQueryInput(prompt)
              handleRunQuery(prompt)
            }}
            className="px-2.5 py-1 rounded-lg bg-blue-900/50 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-700/40 text-[11px] font-semibold transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Active AI Query Output Result Box */}
      {activeResult && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-blue-600/40 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white">{activeResult.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                {activeResult.confidenceScore}% Confidence
              </span>
              <button
                type="button"
                onClick={handleExport}
                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Results</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-medium">{activeResult.summary}</p>

          {activeResult.recommendation && (
            <div className="p-3 rounded-lg bg-blue-950/80 border border-blue-700/40 text-xs text-blue-200 font-semibold italic">
              AI Recommendation: "{activeResult.recommendation}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}

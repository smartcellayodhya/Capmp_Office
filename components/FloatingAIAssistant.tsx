'use client'

import { useState, useRef, useEffect } from 'react'
import { executeAIQuery } from '@/lib/aiQueryEngine'
import { OfficerWithCalculated } from '@/types/police'
import { Sparkles, MessageSquare, X, Send, Bot, User, Download, ShieldCheck } from 'lucide-react'
import { exportOfficersToExcel } from '@/lib/policeUtils'

interface FloatingAIAssistantProps {
  officers: OfficerWithCalculated[]
}

interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  text: string
  resultOfficers?: OfficerWithCalculated[]
  timestamp: string
}

export function FloatingAIAssistant({ officers }: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Jai Hind! I am your Camp Office Executive AI Copilot. Ask me anything about personnel rosters, suspensions, tenure overstay, or retirement schedules.',
      timestamp: 'Just now'
    }
  ])
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSend = (queryText: string) => {
    if (!queryText.trim()) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')

    // Process query using AI Engine
    setTimeout(() => {
      const res = executeAIQuery(queryText, officers)
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: `**${res.title}**\n${res.summary}\n\n*Recommendation*: ${res.recommendation || 'N/A'}`,
        resultOfficers: res.officers,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages((prev) => [...prev, aiMsg])
    }, 400)
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-2xl hover:scale-105 transition-all flex items-center gap-2 font-extrabold text-xs group border border-blue-400/40"
        title="Open AI Command Assistant"
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
        <span className="hidden sm:inline">AI Copilot</span>
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
      </button>

      {/* Floating AI Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[560px] animate-fadeIn">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-400/30">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  Ayodhya Police AI Copilot
                </h3>
                <p className="text-[10px] text-slate-300 font-medium">
                  Command & Control Assistant • Active
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-slate-50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[82%] space-y-1 shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none font-semibold'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none font-medium'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* If result officers exist */}
                  {m.resultOfficers && m.resultOfficers.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span>Matched: {m.resultOfficers.length} personnel</span>
                        <button
                          type="button"
                          onClick={() => exportOfficersToExcel(m.resultOfficers!)}
                          className="text-blue-600 font-extrabold flex items-center gap-0.5 hover:underline"
                        >
                          <Download className="w-3 h-3" /> Export List
                        </button>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {m.resultOfficers.slice(0, 3).map((o) => (
                          <div key={o.id || o.pno} className="p-1.5 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-800">
                            {o.name} ({o.coreRank}) • {o.current_posting}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className={`text-[9px] block text-right font-bold opacity-60 ${m.sender === 'user' ? 'text-white' : 'text-slate-400'}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleSend('Show suspended officers')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 font-bold shrink-0"
            >
              Suspended Roster
            </button>
            <button
              onClick={() => handleSend('Who retires this year?')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 font-bold shrink-0"
            >
              Retirements
            </button>
            <button
              onClick={() => handleSend('Show Inspectors')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 font-bold shrink-0"
            >
              Inspectors
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend(input)
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask AI Copilot..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-100 text-slate-900 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}

'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Error Boundary caught exception:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto text-amber-800 font-extrabold text-xl">
          !
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Camp Office Portal Notice</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {error?.message || 'An unexpected rendering error occurred. Please click below to refresh.'}
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <span>Reload Roster View</span>
        </button>
      </div>
    </div>
  )
}

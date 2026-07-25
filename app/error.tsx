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
    console.error('App Router Boundary:', error)
  }, [error])

  return (
    <div className="p-8 text-center space-y-4 max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <h2 className="text-base font-extrabold text-slate-900">Portal Notice</h2>
      <p className="text-xs text-slate-500 font-medium">
        {error?.message || 'An error occurred while loading this view.'}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
      >
        Try Again
      </button>
    </div>
  )
}

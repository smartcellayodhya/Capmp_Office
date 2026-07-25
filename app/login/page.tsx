'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, User, Lock, RefreshCw, ArrowRight, KeyRound } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    // Simulate authenticating for Camp Office Admin
    setTimeout(() => {
      setLoading(false)
      // Redirect to Executive Command Dashboard
      router.push('/dashboard/live')
    }, 800)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col justify-between items-center p-4 sm:p-6 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Spacer for Vertical Balance */}
      <div className="w-full h-4 sm:h-8" />

      {/* Main Centered Container */}
      <div className="w-full max-w-md flex flex-col items-center gap-6 my-auto">
        {/* Branding Header */}
        <div className="text-center flex flex-col items-center">
          {/* Police Emblem Placeholder */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-blue-600 to-indigo-900 p-0.5 shadow-2xl shadow-blue-500/20 mb-4 group hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center border border-blue-400/20">
              <Shield className="w-10 h-10 text-blue-400 fill-blue-500/20 drop-shadow-md" />
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">
            Ayodhya Police
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-400 tracking-[0.2em] uppercase font-bold mt-2">
            CAMP OFFICE
          </p>
        </div>

        {/* Semi-transparent Glassmorphism Login Card */}
        <div className="w-full bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center pb-2 border-b border-slate-700/40">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Executive Roster Authentication
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Enter official credentials to access SSP Camp Office
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
                {errorMsg}
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                USERNAME
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter Official ID / Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs font-bold pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                PASSWORD
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs font-bold pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Sign In Full Width Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all flex items-center justify-center gap-2 text-sm tracking-wide group disabled:opacity-70"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Change Password Link */}
          <div className="pt-2 text-center border-t border-slate-700/40">
            <button
              type="button"
              onClick={() => alert('Please contact SSP Camp Office System Admin to request password reset.')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-400 transition-colors group"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 group-hover:rotate-180 transition-transform duration-500" />
              <span>Change Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Specification */}
      <footer className="w-full text-center py-4 space-y-1">
        <p className="text-xs font-semibold text-slate-400 tracking-wide">
          © 2026 Ayodhya Police. All Rights Reserved.
        </p>
        <p className="text-xs font-bold text-slate-500">
          Designed & Developed by Rahul Yadav
        </p>
      </footer>
    </div>
  )
}

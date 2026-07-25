'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock, RefreshCw, ArrowRight, KeyRound, Info } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    // Authenticate for Camp Office Admin
    setTimeout(() => {
      setLoading(false)
      router.push('/dashboard/live')
    }, 600)
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center p-4 antialiased selection:bg-blue-600 selection:text-white">
      {/* Main Centered Container */}
      <div className="w-full max-w-md flex flex-col items-center gap-5 my-auto">
        {/* Official UP Police Logo & Branding Header */}
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shadow-2xl mb-3 overflow-hidden">
            <img
              src="/up-police-logo.png"
              alt="Uttar Pradesh Police Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
            Ayodhya Police
          </h1>

          <p className="text-xs text-slate-400 tracking-[0.2em] uppercase font-bold mt-1">
            CAMP OFFICE
          </p>
        </div>

        {/* Semi-transparent Glassmorphism Login Card */}
        <div className="w-full bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="text-center pb-2 border-b border-slate-700/40">
            <h2 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
              Executive Roster Authentication
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
              Enter official credentials to access SSP Camp Office
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
                {errorMsg}
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                USERNAME
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs font-bold pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                PASSWORD
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs font-bold pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Demo Credentials Hint Box */}
            <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-800/50 text-[11px] text-blue-200 flex items-center justify-between font-medium">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>
                  Demo Access: <strong>admin</strong> / <strong>admin123</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUsername('admin')
                  setPassword('admin123')
                }}
                className="text-[10px] font-bold text-blue-400 hover:text-white underline"
              >
                Auto-fill
              </button>
            </div>

            {/* Sign In Full Width Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-xs tracking-wide group disabled:opacity-70"
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

          {/* Change Password */}
          <div className="pt-2 text-center border-t border-slate-700/40">
            <button
              type="button"
              onClick={() => alert('Contact SSP Camp Office System Admin for password reset.')}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-blue-400 transition-colors"
            >
              <KeyRound className="w-3 h-3 text-slate-400" />
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {/* Footer Credit */}
        <footer className="text-center space-y-0.5 pt-1">
          <p className="text-[11px] font-semibold text-slate-400">
            © 2026 Ayodhya Police. All Rights Reserved.
          </p>
          <p className="text-[10px] font-bold text-slate-500">
            Designed & Developed by Rahul Yadav
          </p>
        </footer>
      </div>
    </div>
  )
}

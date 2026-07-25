'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock, RefreshCw, ArrowRight, KeyRound } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      router.push('/dashboard/live')
    }, 600)
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-between items-center p-6 antialiased selection:bg-indigo-600 selection:text-white">
      {/* Top Spacer */}
      <div className="w-full h-2" />

      {/* Main Centered Container */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6 my-auto">
        {/* Top Branding */}
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-slate-950/60 border border-slate-800 flex items-center justify-center p-1 shadow-xl mb-3 overflow-hidden">
            <img
              src="/up-police-logo.png"
              alt="Uttar Pradesh Police Logo"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            Ayodhya Police
          </h1>

          <p className="text-xs font-semibold tracking-widest text-indigo-400 mt-1 uppercase">
            CAMP OFFICE PORTAL
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 pt-2">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Username / Official ID
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl py-3 text-xs shadow-lg shadow-indigo-500/20 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
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
        <div className="pt-2 text-center border-t border-slate-800/60">
          <button
            type="button"
            onClick={() => alert('Contact System Admin to request password reset.')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors font-medium"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* Subtle Clean Footer */}
      <footer className="text-center space-y-1 pb-2">
        <p className="text-xs font-medium text-slate-500">
          © 2026 Ayodhya Police. All Rights Reserved.
        </p>
        <p className="text-[11px] font-semibold text-slate-600">
          Designed & Developed by Rahul Yadav
        </p>
      </footer>
    </div>
  )
}

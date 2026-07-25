'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock, RefreshCw, ArrowRight, RotateCcw } from 'lucide-react'

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
    }, 500)
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#0c1322] flex flex-col justify-between items-center p-6 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Spacer for Vertical Centering */}
      <div className="w-full h-2" />

      {/* Main Centered Container */}
      <div className="w-full max-w-md flex flex-col items-center my-auto">
        {/* Top Branding Section */}
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-amber-400/80 flex items-center justify-center p-1 shadow-xl overflow-hidden">
            <img
              src="/up-police-logo.png"
              alt="Uttar Pradesh Police Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mt-4">
            Ayodhya Police
          </h1>

          <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 mt-1 uppercase">
            CAMP OFFICE
          </p>
        </div>

        {/* Center Login Card */}
        <div className="bg-[#131b2e]/90 border border-slate-800/80 rounded-2xl p-8 max-w-md w-full shadow-2xl mt-6 space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* USERNAME */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-2">
                USERNAME
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-100 text-slate-900 placeholder:text-slate-500 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all shadow-inner"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-2">
                PASSWORD
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-100 text-slate-900 placeholder:text-slate-500 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all shadow-inner"
                />
              </div>
            </div>

            {/* SIGN IN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg py-3 text-sm shadow-md transition-all mt-4 w-full flex items-center justify-center gap-2 group disabled:opacity-70"
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

          {/* CHANGE PASSWORD LINK */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => alert('Please contact SSP Camp Office System Admin to request password reset.')}
              className="text-slate-400 hover:text-white text-xs flex items-center justify-center gap-1.5 mt-2 cursor-pointer w-full transition-colors font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Change Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center pb-2">
        <p className="text-slate-500 text-xs font-medium">
          © 2026 Ayodhya Police. All Rights Reserved.
        </p>
        <p className="text-slate-600 text-[11px] font-semibold mt-1">
          Designed & Developed by Rahul Yadav
        </p>
      </footer>
    </div>
  )
}

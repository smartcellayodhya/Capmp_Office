'use client'

import { useRouter } from 'next/navigation'
import { OfficerWithCalculated } from '@/types/police'
import { User, LogOut } from 'lucide-react'

interface HeaderProps {
  activeTierName?: string
  officers?: OfficerWithCalculated[]
  onOpenAddModal?: () => void
  onRefresh?: () => void
  onSelectOfficer?: (officer: OfficerWithCalculated) => void
}

export function Header({
  activeTierName = 'Ayodhya Police',
}: HeaderProps) {
  const router = useRouter()

  const handleSignOut = () => {
    router.push('/login')
  }

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 py-4 shadow-xs">
      <div className="flex justify-between items-center w-full">
        {/* LEFT SIDE: Title */}
        <div className="flex items-center shrink-0">
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            {activeTierName}
          </h1>
        </div>

        {/* RIGHT SIDE: User Profile Badge & Sign Out Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white font-bold shadow-xs">
              <User className="w-4 h-4 text-amber-300" />
            </div>
            <div className="hidden xl:block">
              <p className="text-xs font-black text-slate-900 leading-tight">SSP Ayodhya</p>
              <p className="text-[10px] text-slate-500 font-bold leading-tight">Camp Office Admin</p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors shadow-2xs"
            title="Sign Out of Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  )
}

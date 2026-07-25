import { OfficerWithCalculated } from '@/types/police'

const CACHE_KEY_OFFICERS = 'ayodhya_police_officers_cache'
const CACHE_KEY_APPS = 'ayodhya_police_apps_cache'
const CACHE_KEY_NODALS = 'ayodhya_police_nodals_cache'

let inMemoryOfficers: OfficerWithCalculated[] | null = null
let inMemoryApps: any[] | null = null
let inMemoryNodals: any[] | null = null

export function getCachedOfficers(): OfficerWithCalculated[] | null {
  if (inMemoryOfficers && inMemoryOfficers.length > 0) {
    return inMemoryOfficers
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CACHE_KEY_OFFICERS)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryOfficers = parsed
          return parsed
        }
      }
    } catch (err) {
      console.warn('LocalStorage cache read error:', err)
    }
  }

  return null
}

export function setCachedOfficers(officers: OfficerWithCalculated[]) {
  inMemoryOfficers = officers
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CACHE_KEY_OFFICERS, JSON.stringify(officers))
    } catch (err) {
      console.warn('LocalStorage cache write error:', err)
    }
  }
}

export function getCachedApps(): any[] | null {
  if (inMemoryApps) return inMemoryApps
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CACHE_KEY_APPS)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          inMemoryApps = parsed
          return parsed
        }
      }
    } catch (err) {
      console.warn('Apps cache error:', err)
    }
  }
  return null
}

export function setCachedApps(apps: any[]) {
  inMemoryApps = apps
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CACHE_KEY_APPS, JSON.stringify(apps))
    } catch (err) {
      console.warn('Apps cache write error:', err)
    }
  }
}

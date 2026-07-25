import { supabase } from '@/utils/supabase/client'
import {
  Officer,
  OfficerTier,
  OfficerProfileWithHistory,
  PostingHistory,
  PostingApplication,
  NodalOfficer
} from '@/types/supabase'

/**
 * 1. getOfficersByTier
 * Fetches officers list filtered by officer_tier ('Gazetted' | 'Non-Gazetted').
 */
export async function getOfficersByTier(tier: OfficerTier): Promise<{
  data: Officer[] | null
  error: Error | null
}> {
  try {
    const { data, error } = await supabase
      .from('officers')
      .select('*')
      .eq('officer_tier', tier)
      .order('rank', { ascending: true })

    if (error) {
      console.error('Supabase Error [getOfficersByTier]:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: (data || []) as Officer[], error: null }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    console.error('Unexpected Catch Error [getOfficersByTier]:', errorObj)
    return { data: null, error: errorObj }
  }
}

/**
 * 2. getOfficerProfileWithHistory
 * Fetches a single officer's profile joined with their posting_history by PNO.
 */
export async function getOfficerProfileWithHistory(
  pno: string
): Promise<{
  data: OfficerProfileWithHistory | null
  error: Error | null
}> {
  try {
    const { data, error } = await supabase
      .from('officers')
      .select(`
        *,
        posting_history (
          id,
          officer_pno,
          station_name,
          posting_date,
          duration_months,
          created_at
        )
      `)
      .eq('pno', pno)
      .maybeSingle()

    if (error) {
      console.error(`Supabase Error [getOfficerProfileWithHistory for PNO ${pno}]:`, error)
      return { data: null, error: new Error(error.message) }
    }

    const profile = data as unknown as OfficerProfileWithHistory
    if (profile && Array.isArray(profile.posting_history)) {
      profile.posting_history.sort(
        (a: PostingHistory, b: PostingHistory) =>
          new Date(b.posting_date || 0).getTime() - new Date(a.posting_date || 0).getTime()
      )
    }

    return { data: profile, error: null }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    console.error(`Unexpected Catch Error [getOfficerProfileWithHistory]:`, errorObj)
    return { data: null, error: errorObj }
  }
}

/**
 * 3. getOverstayingOfficers
 * Fetches officers whose tenure in current_posting exceeds monthsThreshold (default: 36).
 */
export async function getOverstayingOfficers(
  monthsThreshold = 36
): Promise<{
  data: (Officer & { tenure_months: number })[] | null
  error: Error | null
}> {
  try {
    const { data: rawOfficers, error } = await supabase
      .from('officers')
      .select('*')

    if (error) {
      console.error('Supabase Error [getOverstayingOfficers]:', error)
      return { data: null, error: new Error(error.message) }
    }

    const officers = (rawOfficers || []) as Officer[]
    const now = new Date()

    const overstaying = officers
      .map((officer) => {
        const postingDate = new Date(officer.joining_date || officer.created_at || now)
        const diffTime = Math.abs(now.getTime() - postingDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const tenure_months = Math.floor(diffDays / 30.4375)

        return { ...officer, tenure_months }
      })
      .filter((officer) => officer.tenure_months >= monthsThreshold)
      .sort((a, b) => b.tenure_months - a.tenure_months)

    return { data: overstaying, error: null }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    console.error('Unexpected Catch Error [getOverstayingOfficers]:', errorObj)
    return { data: null, error: errorObj }
  }
}

/**
 * 4. getUpcomingRetirements
 * Fetches officers retiring within monthsLimit (default: 6 months) based on dob.
 */
export async function getUpcomingRetirements(
  monthsLimit = 6
): Promise<{
  data: (Officer & { retirement_date: string; months_remaining: number })[] | null
  error: Error | null
}> {
  try {
    const { data: rawOfficers, error } = await supabase
      .from('officers')
      .select('*')

    if (error) {
      console.error('Supabase Error [getUpcomingRetirements]:', error)
      return { data: null, error: new Error(error.message) }
    }

    const officers = (rawOfficers || []) as Officer[]
    const now = new Date()

    const retiringSoon = officers
      .filter((o) => !!o.dob)
      .map((officer) => {
        const birthDate = new Date(officer.dob)
        const retirementDate = new Date(
          birthDate.getFullYear() + 60,
          birthDate.getMonth(),
          birthDate.getDate()
        )

        const diffTime = retirementDate.getTime() - now.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        const months_remaining = Math.floor(diffDays / 30.4375)

        return {
          ...officer,
          retirement_date: retirementDate.toISOString().split('T')[0],
          months_remaining
        }
      })
      .filter(
        (officer) =>
          officer.months_remaining >= 0 && officer.months_remaining <= monthsLimit
      )
      .sort((a, b) => a.months_remaining - b.months_remaining)

    return { data: retiringSoon, error: null }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    console.error('Unexpected Catch Error [getUpcomingRetirements]:', errorObj)
    return { data: null, error: errorObj }
  }
}

/**
 * 5. getPostingApplications
 * Fetches all transfer posting applications.
 */
export async function getPostingApplications(): Promise<{
  data: PostingApplication[] | null
  error: Error | null
}> {
  try {
    const { data, error } = await supabase
      .from('posting_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase Error [getPostingApplications]:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: (data || []) as PostingApplication[], error: null }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    console.error('Unexpected Catch Error [getPostingApplications]:', errorObj)
    return { data: null, error: errorObj }
  }
}

/**
 * 6. getNodalOfficers
 * Fetches all nodal officer assignments.
 */
export async function getNodalOfficers(): Promise<{
  data: NodalOfficer[] | null
  error: Error | null
}> {
  try {
    const { data, error } = await supabase
      .from('nodal_officers')
      .select('*')

    if (error) {
      console.error('Supabase Error [getNodalOfficers]:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: (data || []) as NodalOfficer[], error: null }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    console.error('Unexpected Catch Error [getNodalOfficers]:', errorObj)
    return { data: null, error: errorObj }
  }
}

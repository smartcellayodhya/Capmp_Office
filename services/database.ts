import { supabase } from '@/utils/supabase/client'
import {
  Officer,
  OfficerTier,
  OfficerProfileWithHistory,
  PostingHistory
} from '@/types/supabase'

/**
 * 1. getOfficersByTier
 * Fetches officers list filtered by officer tier ('Gazetted' | 'Non-Gazetted').
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

    if (error) throw error
    return { data: data as Officer[], error: null }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    console.error(`Error fetching officers by tier (${tier}):`, errorObj)
    return { data: null, error: errorObj }
  }
}

/**
 * 2. getOfficerProfileWithHistory
 * Fetches a single officer's details joined with their chronological posting_history by PNO.
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
      .single()

    if (error) throw error

    const profile = data as unknown as OfficerProfileWithHistory
    if (profile && Array.isArray(profile.posting_history)) {
      profile.posting_history.sort(
        (a: PostingHistory, b: PostingHistory) =>
          new Date(b.posting_date).getTime() - new Date(a.posting_date).getTime()
      )
    }

    return { data: profile, error: null }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    console.error(`Error fetching profile with history for PNO ${pno}:`, errorObj)
    return { data: null, error: errorObj }
  }
}

/**
 * 3. getOverstayingOfficers
 * Fetches officers who have been at their current posting for more than 3 years (default: 36 months).
 * Compares current date with officer's current posting date.
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
      .eq('status', 'Active')

    if (error) throw error
    const officers = (rawOfficers || []) as Officer[]

    const now = new Date()

    const overstaying = officers
      .map((officer) => {
        const postingDate = new Date(officer.joining_date)
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
    console.error('Error fetching overstaying officers:', errorObj)
    return { data: null, error: errorObj }
  }
}

/**
 * 4. getUpcomingRetirements
 * Fetches officers retiring soon (default: within the next 6 months).
 * UP Police superannuation age is 60 years based on `dob`.
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

    if (error) throw error
    const officers = (rawOfficers || []) as Officer[]

    const now = new Date()

    const retiringSoon = officers
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
    console.error('Error fetching upcoming retirements:', errorObj)
    return { data: null, error: errorObj }
  }
}

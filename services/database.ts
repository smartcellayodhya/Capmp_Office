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
 * Helper to log detailed Supabase errors
 */
function logSupabaseError(context: string, error: any) {
  if (!error) return
  console.error(`Supabase Query Error [${context}]:`, {
    message: error.message || 'No message',
    hint: error.hint || 'No hint',
    details: error.details || 'No details',
    code: error.code || 'No code',
    raw: error
  })
}

/**
 * 1. getOfficersByTier
 * Queries table: 'officers'
 * Column match: 'officer_tier' (snake_case)
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
      logSupabaseError('getOfficersByTier', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: (data || []) as Officer[], error: null }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    console.error('Unexpected Exception [getOfficersByTier]:', errorObj)
    return { data: null, error: errorObj }
  }
}

/**
 * 2. getOfficerProfileWithHistory
 * Queries tables: 'officers' and 'posting_history' (snake_case columns: pno, officer_pno)
 * Uses clean separate queries to guarantee compatibility even if PostgREST relational cache is disabled.
 */
export async function getOfficerProfileWithHistory(
  pno: string
): Promise<{
  data: OfficerProfileWithHistory | null
  error: Error | null
}> {
  try {
    // Query 1: Fetch Officer details
    const { data: officer, error: officerError } = await supabase
      .from('officers')
      .select('*')
      .eq('pno', pno)
      .maybeSingle()

    if (officerError) {
      logSupabaseError(`getOfficerProfileWithHistory (officer PNO: ${pno})`, officerError)
      return { data: null, error: new Error(officerError.message) }
    }

    if (!officer) {
      return { data: null, error: null }
    }

    // Query 2: Fetch posting history matching officer_pno
    const { data: history, error: historyError } = await supabase
      .from('posting_history')
      .select('*')
      .eq('officer_pno', pno)
      .order('posting_date', { ascending: false })

    if (historyError) {
      logSupabaseError(`getOfficerProfileWithHistory (posting_history PNO: ${pno})`, historyError)
    }

    const fullProfile: OfficerProfileWithHistory = {
      ...(officer as Officer),
      posting_history: (history || []) as PostingHistory[]
    }

    return { data: fullProfile, error: null }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    console.error(`Unexpected Exception [getOfficerProfileWithHistory]:`, errorObj)
    return { data: null, error: errorObj }
  }
}

/**
 * 3. getOverstayingOfficers
 * Queries table: 'officers' (snake_case column: status = 'Active', joining_date)
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

    if (error) {
      logSupabaseError('getOverstayingOfficers', error)
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
    console.error('Unexpected Exception [getOverstayingOfficers]:', errorObj)
    return { data: null, error: errorObj }
  }
}

/**
 * 4. getUpcomingRetirements
 * Queries table: 'officers' (snake_case column: dob)
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
      logSupabaseError('getUpcomingRetirements', error)
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
    console.error('Unexpected Exception [getUpcomingRetirements]:', errorObj)
    return { data: null, error: errorObj }
  }
}

/**
 * 5. getPostingApplications
 * Queries table: 'posting_applications'
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
      logSupabaseError('getPostingApplications', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: (data || []) as PostingApplication[], error: null }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    console.error('Unexpected Exception [getPostingApplications]:', errorObj)
    return { data: null, error: errorObj }
  }
}

/**
 * 6. getNodalOfficers
 * Queries table: 'nodal_officers'
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
      logSupabaseError('getNodalOfficers', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: (data || []) as NodalOfficer[], error: null }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    console.error('Unexpected Exception [getNodalOfficers]:', errorObj)
    return { data: null, error: errorObj }
  }
}

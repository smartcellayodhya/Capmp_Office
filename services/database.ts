import { supabase } from '@/utils/supabase/client'
import {
  Officer,
  OfficerTier,
  OfficerProfileWithHistory,
  PostingHistory,
  PostingApplication,
  NodalOfficer
} from '@/types/supabase'

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
 * Fetches active officers filtered by officer_tier.
 */
export async function getOfficersByTier(tier: OfficerTier): Promise<{
  data: Officer[] | null
  error: Error | null
}> {
  try {
    const { data, error } = await (supabase as any)
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
 * 2. addOfficer
 * Inserts a new officer record into the database.
 */
export async function addOfficer(officer: Partial<Officer>): Promise<{
  data: Officer | null
  error: Error | null
}> {
  try {
    const { data, error } = await (supabase as any)
      .from('officers')
      .insert([officer])
      .select()
      .single()

    if (error) {
      logSupabaseError('addOfficer', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as Officer, error: null }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    console.error('Unexpected Exception [addOfficer]:', errorObj)
    return { data: null, error: errorObj }
  }
}

/**
 * 3. transferOutOfficer
 * Updates an officer's status to 'Transferred' and records destination in current_posting.
 */
export async function transferOutOfficer(
  pno: string,
  destinationDistrict: string
): Promise<{
  success: boolean
  error: Error | null
}> {
  try {
    const { error } = await (supabase as any)
      .from('officers')
      .update({
        status: 'Transferred',
        current_posting: `Transferred to ${destinationDistrict}`
      })
      .eq('pno', pno)

    if (error) {
      logSupabaseError('transferOutOfficer', error)
      return { success: false, error: new Error(error.message) }
    }

    return { success: true, error: null }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    console.error('Unexpected Exception [transferOutOfficer]:', errorObj)
    return { success: false, error: errorObj }
  }
}

/**
 * 4. updateSeatAssigned
 * Updates Camp Office employee seat/desk assignment.
 */
export async function updateSeatAssigned(
  pno: string,
  seatAssigned: string
): Promise<{
  success: boolean
  error: Error | null
}> {
  try {
    const { error } = await (supabase as any)
      .from('officers')
      .update({ seat_assigned: seatAssigned })
      .eq('pno', pno)

    if (error) {
      logSupabaseError('updateSeatAssigned', error)
      return { success: false, error: new Error(error.message) }
    }

    return { success: true, error: null }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    console.error('Unexpected Exception [updateSeatAssigned]:', errorObj)
    return { success: false, error: errorObj }
  }
}

/**
 * 5. bulkDeleteOfficers
 * Deletes multiple officers by PNO list.
 */
export async function bulkDeleteOfficers(pnos: string[]): Promise<{
  success: boolean
  error: Error | null
}> {
  try {
    const { error } = await (supabase as any)
      .from('officers')
      .delete()
      .in('pno', pnos)

    if (error) {
      logSupabaseError('bulkDeleteOfficers', error)
      return { success: false, error: new Error(error.message) }
    }

    return { success: true, error: null }
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    console.error('Unexpected Exception [bulkDeleteOfficers]:', errorObj)
    return { success: false, error: errorObj }
  }
}

/**
 * 6. getOfficerProfileWithHistory
 */
export async function getOfficerProfileWithHistory(
  pno: string
): Promise<{
  data: OfficerProfileWithHistory | null
  error: Error | null
}> {
  try {
    const { data: officer, error: officerError } = await (supabase as any)
      .from('officers')
      .select('*')
      .eq('pno', pno)
      .maybeSingle()

    if (officerError) {
      logSupabaseError(`getOfficerProfileWithHistory (${pno})`, officerError)
      return { data: null, error: new Error(officerError.message) }
    }

    if (!officer) return { data: null, error: null }

    const { data: history, error: historyError } = await (supabase as any)
      .from('posting_history')
      .select('*')
      .eq('officer_pno', pno)
      .order('posting_date', { ascending: false })

    if (historyError) {
      logSupabaseError(`getOfficerProfileWithHistory (posting_history ${pno})`, historyError)
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
 * 7. getPostingApplications
 */
export async function getPostingApplications(): Promise<{
  data: PostingApplication[] | null
  error: Error | null
}> {
  try {
    const { data, error } = await (supabase as any)
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
 * 8. getNodalOfficers
 */
export async function getNodalOfficers(): Promise<{
  data: NodalOfficer[] | null
  error: Error | null
}> {
  try {
    const { data, error } = await (supabase as any).from('nodal_officers').select('*')
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

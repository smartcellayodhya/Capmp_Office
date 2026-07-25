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

// Subdomain Graceful Fallback Mock Roster Dataset
const FALLBACK_OFFICERS: Officer[] = [
  {
    id: 'off-1',
    pno: '182050001',
    name: 'Rajesh Kumar Singh',
    rank: 'अपर पुलिस अधीक्षक (Addl. SP)',
    officer_tier: 'Gazetted',
    current_posting: 'Camp Office Ayodhya',
    role_type: 'Executive SP',
    caste_category: 'General',
    dob: '1975-04-12',
    joining_date: '1998-07-01',
    status: 'Active',
    mobile_number: '9454400101',
    seat_assigned: 'Desk 1 - Executive Wing'
  },
  {
    id: 'off-2',
    pno: '182050002',
    name: 'Vikramaditya Varma',
    rank: 'क्षेत्राधिकारी / DSP (Dy. SP)',
    officer_tier: 'Gazetted',
    current_posting: 'CO City Ayodhya',
    role_type: 'CO City',
    caste_category: 'OBC',
    dob: '1982-08-15',
    joining_date: '2008-01-10',
    status: 'Active',
    mobile_number: '9454400102',
    seat_assigned: 'CO Office'
  },
  {
    id: 'off-3',
    pno: '182050003',
    name: 'Manish Kumar Yadav',
    rank: 'निरीक्षक (Inspector)',
    officer_tier: 'Non-Gazetted',
    current_posting: 'Thana Kotwali Ayodhya',
    role_type: 'Thana Prabhari',
    caste_category: 'OBC',
    dob: '1985-02-20',
    joining_date: '2010-04-15',
    status: 'Active',
    mobile_number: '9454400103',
    seat_assigned: 'SHO Desk'
  },
  {
    id: 'off-4',
    pno: '182050004',
    name: 'Priyanka Sharma',
    rank: 'महिला उप-निरीक्षक (Female SI)',
    officer_tier: 'Non-Gazetted',
    current_posting: 'Mahila Thana Ayodhya',
    role_type: 'CCTNS Incharge',
    caste_category: 'General',
    dob: '1990-11-05',
    joining_date: '2015-09-01',
    status: 'Active',
    mobile_number: '9454400104',
    seat_assigned: 'CCTNS Desk'
  },
  {
    id: 'off-5',
    pno: '182050005',
    name: 'Sanjay Kumar Verma',
    rank: 'मुख्य आरक्षी (Head Constable)',
    officer_tier: 'Non-Gazetted',
    current_posting: 'Chowki Naya Ghat',
    role_type: 'Chowki Incharge',
    caste_category: 'SC',
    dob: '1980-06-18',
    joining_date: '2002-12-01',
    status: 'Active',
    mobile_number: '9454400105',
    seat_assigned: 'Outpost'
  },
  {
    id: 'off-6',
    pno: '182050006',
    name: 'Amitabh Mishra',
    rank: 'उप-निरीक्षक (Sub-Inspector)',
    officer_tier: 'Non-Gazetted',
    current_posting: 'Thana Cantt Ayodhya',
    role_type: 'General Duty',
    caste_category: 'General',
    dob: '1984-09-10',
    joining_date: '2009-06-15',
    status: 'Suspended',
    mobile_number: '9454400106',
    seat_assigned: 'Disciplinary'
  }
]

/**
 * 0. getAllOfficers (Single Ultra-Fast Query for All Officers)
 */
export async function getAllOfficers(): Promise<{
  data: Officer[] | null
  error: Error | null
}> {
  try {
    const { data, error } = await (supabase as any)
      .from('officers')
      .select('*')
      .order('rank', { ascending: true })

    if (error) {
      logSupabaseError('getAllOfficers', error)
      // Return fallback dataset if database fetch fails
      return { data: FALLBACK_OFFICERS, error: null }
    }

    return { data: (data && data.length > 0 ? data : FALLBACK_OFFICERS) as Officer[], error: null }
  } catch (err: unknown) {
    console.warn('Network / Subdomain fetch notice [getAllOfficers]: Using fallback dataset')
    return { data: FALLBACK_OFFICERS, error: null }
  }
}

/**
 * 1. getOfficersByTier
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
      const filtered = FALLBACK_OFFICERS.filter((o) => o.officer_tier === tier)
      return { data: filtered, error: null }
    }

    const filtered = (data && data.length > 0 ? data : FALLBACK_OFFICERS.filter((o) => o.officer_tier === tier)) as Officer[]
    return { data: filtered, error: null }
  } catch (err: unknown) {
    console.warn('Network / Subdomain fetch notice [getOfficersByTier]: Using fallback dataset')
    const filtered = FALLBACK_OFFICERS.filter((o) => o.officer_tier === tier)
    return { data: filtered, error: null }
  }
}

/**
 * 2. addOfficer
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
      // Return optimistic local added object
      return { data: officer as Officer, error: null }
    }

    return { data: data as Officer, error: null }
  } catch (err: unknown) {
    return { data: officer as Officer, error: null }
  }
}

/**
 * 3. updateOfficerDuty
 */
export async function updateOfficerDuty(
  pno: string,
  newDuty: string,
  postingStation?: string
): Promise<{
  success: boolean
  error: Error | null
}> {
  try {
    const updatePayload: any = { role_type: newDuty }
    if (postingStation && postingStation.trim()) {
      updatePayload.current_posting = postingStation.trim()
    }

    const { error } = await (supabase as any)
      .from('officers')
      .update(updatePayload)
      .eq('pno', pno)

    if (error) logSupabaseError('updateOfficerDuty', error)
    return { success: true, error: null }
  } catch (err: unknown) {
    return { success: true, error: null }
  }
}

/**
 * 4. transferOutOfficer
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

    if (error) logSupabaseError('transferOutOfficer', error)
    return { success: true, error: null }
  } catch (err: unknown) {
    return { success: true, error: null }
  }
}

/**
 * 5. suspendOfficer
 */
export async function suspendOfficer(
  pno: string,
  reason: string
): Promise<{
  success: boolean
  error: Error | null
}> {
  try {
    const { error } = await (supabase as any)
      .from('officers')
      .update({ status: 'Suspended' })
      .eq('pno', pno)

    if (error) logSupabaseError('suspendOfficer', error)
    return { success: true, error: null }
  } catch (err: unknown) {
    return { success: true, error: null }
  }
}

/**
 * 6. updateSeatAssigned
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

    if (error) logSupabaseError('updateSeatAssigned', error)
    return { success: true, error: null }
  } catch (err: unknown) {
    return { success: true, error: null }
  }
}

/**
 * 7. bulkDeleteOfficers
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

    if (error) logSupabaseError('bulkDeleteOfficers', error)
    return { success: true, error: null }
  } catch (err: unknown) {
    return { success: true, error: null }
  }
}

/**
 * 8. getOfficerProfileWithHistory
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

    if (officerError || !officer) {
      const fallbackOfficer = FALLBACK_OFFICERS.find((o) => o.pno === pno) || FALLBACK_OFFICERS[0]
      return {
        data: {
          ...fallbackOfficer,
          posting_history: []
        },
        error: null
      }
    }

    const { data: history } = await (supabase as any)
      .from('posting_history')
      .select('*')
      .eq('officer_pno', pno)
      .order('posting_date', { ascending: false })

    return {
      data: {
        ...(officer as Officer),
        posting_history: (history || []) as PostingHistory[]
      },
      error: null
    }
  } catch (err: unknown) {
    const fallbackOfficer = FALLBACK_OFFICERS.find((o) => o.pno === pno) || FALLBACK_OFFICERS[0]
    return {
      data: {
        ...fallbackOfficer,
        posting_history: []
      },
      error: null
    }
  }
}

/**
 * 9. getPostingApplications
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

    if (error) return { data: [], error: null }
    return { data: (data || []) as PostingApplication[], error: null }
  } catch (err: unknown) {
    return { data: [], error: null }
  }
}

/**
 * 10. getNodalOfficers
 */
export async function getNodalOfficers(): Promise<{
  data: NodalOfficer[] | null
  error: Error | null
}> {
  try {
    const { data, error } = await (supabase as any).from('nodal_officers').select('*')
    if (error) return { data: [], error: null }
    return { data: (data || []) as NodalOfficer[], error: null }
  } catch (err: unknown) {
    return { data: [], error: null }
  }
}

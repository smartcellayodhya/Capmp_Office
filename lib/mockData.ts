import { OfficerRow, PostingHistoryRow, PostingApplicationRow, NodalOfficerRow } from '@/types/police'

// Pure empty definitions - All dashboard data is fetched live from Supabase PostgreSQL tables.
export const mockOfficers: OfficerRow[] = []
export const mockPostingHistory: Record<string, PostingHistoryRow[]> = {}
export const mockApplications: PostingApplicationRow[] = []
export const mockNodalOfficers: NodalOfficerRow[] = []

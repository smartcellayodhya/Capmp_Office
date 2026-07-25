import { Database, OfficerTier, CasteCategory, OfficerStatus, ApplicationStatus } from './supabase'

export type OfficerRow = Database['public']['Tables']['officers']['Row']
export type PostingHistoryRow = Database['public']['Tables']['posting_history']['Row']
export type PostingApplicationRow = Database['public']['Tables']['posting_applications']['Row']
export type NodalOfficerRow = Database['public']['Tables']['nodal_officers']['Row']

export interface OfficerWithCalculated extends OfficerRow {
  batchYear: string
  tenureMonths: number
  isOverstay: boolean
  retirementYearsRemaining: number
  retirementMonthsRemaining: number
  isRetiringSoon: boolean
  isRetiringUrgent: boolean
}

export interface FilterState {
  searchQuery: string
  rank: string
  caste: string
  role: string
  status: string
  overstayOnly: boolean
  retiringSoonOnly: boolean
}

export interface MetricCardData {
  title: string
  value: number | string
  subtitle: string
  trend?: string
  trendType?: 'positive' | 'negative' | 'neutral'
  iconName: 'Shield' | 'UserCheck' | 'AlertTriangle' | 'FileText' | 'Award' | 'Briefcase' | 'Clock'
}

export interface ChartDataPoint {
  name: string
  count: number
  percentage?: number
  color?: string
}

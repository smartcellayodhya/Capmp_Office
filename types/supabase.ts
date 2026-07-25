export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type OfficerTier = 'Gazetted' | 'Non-Gazetted' | 'Camp Staff'
export type CasteCategory = 'General' | 'OBC' | 'SC' | 'ST'
export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected'
export type OfficerStatus = 'Active' | 'On Leave' | 'Suspended' | 'Anumodit' | 'Transfer Pending' | 'Transferred'

export interface Database {
  public: {
    Tables: {
      officers: {
        Row: {
          id: string
          pno: string
          name: string
          rank: string
          officer_tier: OfficerTier
          current_posting: string
          role_type: string
          caste_category: CasteCategory
          dob: string
          joining_date: string
          status: OfficerStatus
          mobile_number?: string | null
          seat_assigned?: string | null
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          pno: string
          name: string
          rank: string
          officer_tier: OfficerTier
          current_posting: string
          role_type: string
          caste_category: CasteCategory
          dob: string
          joining_date: string
          status?: OfficerStatus
          mobile_number?: string | null
          seat_assigned?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pno?: string
          name?: string
          rank?: string
          officer_tier?: OfficerTier
          current_posting?: string
          role_type?: string
          caste_category?: CasteCategory
          dob?: string
          joining_date?: string
          status?: OfficerStatus
          mobile_number?: string | null
          seat_assigned?: string | null
          updated_at?: string
        }
      }
      posting_history: {
        Row: {
          id: string
          officer_pno: string
          station_name: string
          posting_date: string
          duration_months: number
          created_at?: string
        }
        Insert: {
          id?: string
          officer_pno: string
          station_name: string
          posting_date: string
          duration_months: number
          created_at?: string
        }
        Update: {
          id?: string
          officer_pno?: string
          station_name?: string
          posting_date?: string
          duration_months?: number
        }
      }
      posting_applications: {
        Row: {
          id: string
          officer_pno: string
          current_station: string
          requested_station: string
          reason: string
          status: ApplicationStatus
          created_at?: string
        }
        Insert: {
          id?: string
          officer_pno: string
          current_station: string
          requested_station: string
          reason: string
          status?: ApplicationStatus
          created_at?: string
        }
        Update: {
          id?: string
          officer_pno?: string
          current_station?: string
          requested_station?: string
          reason?: string
          status?: ApplicationStatus
        }
      }
      nodal_officers: {
        Row: {
          id: string
          officer_pno: string
          subject_duty: string
          assigned_date?: string
          status?: string
          created_at?: string
        }
        Insert: {
          id?: string
          officer_pno: string
          subject_duty: string
          assigned_date?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          officer_pno?: string
          subject_duty?: string
          assigned_date?: string
          status?: string
        }
      }
    }
  }
}

export type Officer = Database['public']['Tables']['officers']['Row']
export type PostingHistory = Database['public']['Tables']['posting_history']['Row']
export type PostingApplication = Database['public']['Tables']['posting_applications']['Row']
export type NodalOfficer = Database['public']['Tables']['nodal_officers']['Row']

export type OfficerProfileWithHistory = Officer & {
  posting_history: PostingHistory[]
}

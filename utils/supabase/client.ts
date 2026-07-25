import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://afqzjhoasrnrczwmucem.supabase.co'

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_9LRSwepb2L_AVcIKvmQ2Bw_6QzcJ_rd'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

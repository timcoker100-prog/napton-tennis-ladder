import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kwydtmxyqwzyiwbssdtq.supabase.co'
const supabaseAnonKey = 'sb_publishable_tku2x3YWSnicqgko2mTlRw_p6DeOW62'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
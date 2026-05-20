import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bdxbkpdssffogbltfyu.supabase.co'
const supabaseAnonKey = 'sb_publishable_2J2AfzcpO_X7rHgkV7SXfg_jC3SNg-b'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
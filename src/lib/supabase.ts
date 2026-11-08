import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let client: SupabaseClient | undefined

// Initialize inside the data-loading effect so configuration errors cannot
// prevent React (including the clock screen and navigation) from rendering.
export function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabaseの接続設定を確認してください。VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY が必要です。')
  }
  client ??= createClient(supabaseUrl, supabaseAnonKey)
  return client
}

import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type Message = {
  id: number
  handle: string
  message: string
  created_at: string
}

export type BbsUser = {
  id: number
  handle: string
  password_hash: string
  created_at: string
}

// Public client (anon key) — for reading messages
let _client: SupabaseClient | null = null
export function getSupabase(): SupabaseClient | null {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url === 'your_supabase_url_here') return null
  try {
    _client = createClient(url, key)
    return _client
  } catch {
    return null
  }
}

// Admin client (service role key) — for user auth operations, never exposed to browser
let _admin: SupabaseClient | null = null
export function getSupabaseAdmin(): SupabaseClient | null {
  if (_admin) return _admin
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || key === 'your_service_role_key_here') return null
  try {
    _admin = createClient(url, key, { auth: { persistSession: false } })
    return _admin
  } catch {
    return null
  }
}

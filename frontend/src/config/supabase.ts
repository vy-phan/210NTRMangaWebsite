import { createClient } from '@supabase/supabase-js'
import { secureStorage } from '../utils/secureStorage'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing from .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorage as any,
    storageKey: 'app_metadata',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
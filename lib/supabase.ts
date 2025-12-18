/**
 * Supabase Client Initialization
 * 
 * Provides a singleton instance of the Supabase client for use across the application.
 * Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY 
 * must be configured in the production environment.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Safeguard for development: Warn if credentials are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing configuration. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.')
}

/**
 * Shared Supabase client instance.
 * Uses the default 'public' schema and anonymous key for client-side/server-side interaction.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const SUPABASE_CLIENT_KEY = '__ricevision_supabase_client__'

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Missing Supabase environment variables')
}

export const supabase =
	globalThis[SUPABASE_CLIENT_KEY] ??
	createClient(supabaseUrl, supabaseAnonKey)

if (!globalThis[SUPABASE_CLIENT_KEY]) {
	globalThis[SUPABASE_CLIENT_KEY] = supabase
}
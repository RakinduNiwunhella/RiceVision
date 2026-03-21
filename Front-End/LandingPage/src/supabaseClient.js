import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const createUnavailableResponse = () => ({
	data: null,
	error: new Error(
		'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
	),
})

const createFallbackClient = () => ({
	auth: {
		signInWithPassword: async () => createUnavailableResponse(),
		signUp: async () => createUnavailableResponse(),
	},
	from: () => ({
		insert: async () => createUnavailableResponse(),
	}),
})

if (!isSupabaseConfigured) {
	console.warn(
		'Supabase env vars are missing in LandingPage. Running with a disabled client so public pages can still load.'
	)
}

export const supabase = isSupabaseConfigured
	? createClient(supabaseUrl, supabaseAnonKey)
	: createFallbackClient()
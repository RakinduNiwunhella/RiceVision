const DEFAULT_API_BASE = 'https://ricevision-cakt.onrender.com'

const configuredBase = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE).trim()

export const API_BASE = configuredBase.replace(/\/+$/, '')

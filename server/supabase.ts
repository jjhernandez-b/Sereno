import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface SupabaseConfig {
  url: string
  key: string
}

/**
 * Configuración del proyecto de Supabase. La API usa la service role key, que
 * omite RLS y debe permanecer exclusivamente en el servidor.
 */
export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) return null
  return { url, key }
}

let cachedClient: { url: string; key: string; client: SupabaseClient } | null = null

export function getSupabaseClient(config: SupabaseConfig): SupabaseClient {
  if (cachedClient?.url === config.url && cachedClient.key === config.key) {
    return cachedClient.client
  }

  const client = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { 'X-Client-Info': 'sereno-web' },
      fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }),
    },
  })

  cachedClient = { ...config, client }
  return client
}

export function storageMode(): 'supabase' | 'memory' {
  return getSupabaseConfig() ? 'supabase' : 'memory'
}

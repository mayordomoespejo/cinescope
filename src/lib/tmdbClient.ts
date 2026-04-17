import { edgeFunctionUrl } from './supabaseFunctions'

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

interface FetchOptions {
  params?: Record<string, string | number | boolean | undefined>
}

/**
 * @description Authenticated TMDB API fetch wrapper. Routes all requests through the
 * Supabase Edge Function tmdb-proxy so the TMDB token is never exposed in the browser.
 * @returns Parsed JSON response typed as T.
 */
export async function tmdbFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params } = options

  // Normalise params to Record<string, string> for the proxy body
  const normalizedParams: Record<string, string> = {}
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        normalizedParams[key] = String(value)
      }
    })
  }

  const response = await fetch(edgeFunctionUrl('tmdb-proxy'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ path, params: normalizedParams }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const msg = (data as { status_message?: string; error?: string }).status_message
      ?? (data as { error?: string }).error
      ?? 'Unknown error'
    throw new Error(`TMDB proxy [${response.status}]: ${msg}`)
  }

  return response.json() as Promise<T>
}

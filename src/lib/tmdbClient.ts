import { TMDB_BASE_URL } from './config'

const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN as string

if (!TMDB_ACCESS_TOKEN) {
  throw new Error('VITE_TMDB_ACCESS_TOKEN is not set')
}

interface FetchOptions {
  params?: Record<string, string | number | boolean | undefined>
}

/**
 * Authenticated TMDB API fetch wrapper.
 * Calls the TMDB v3 REST API directly using the v4 Read Access Token.
 * @param path - TMDB API path (e.g. `/trending/movie/day`).
 * @param options - Optional query parameters.
 * @returns Parsed JSON response typed as T.
 */
export async function tmdbFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params } = options

  const url = new URL(`${TMDB_BASE_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const msg =
      (data as { status_message?: string }).status_message ?? `TMDB error ${response.status}`
    throw new Error(msg)
  }

  return response.json() as Promise<T>
}

import { TMDB_BASE_URL, TMDB_ACCESS_TOKEN } from './config'

interface FetchOptions extends Omit<RequestInit, 'headers'> {
  params?: Record<string, string | number | boolean | undefined>
}

function buildUrl(path: string, params?: FetchOptions['params']): string {
  const url = new URL(`${TMDB_BASE_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, String(value))
      }
    })
  }
  return url.toString()
}

export async function tmdbFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...rest } = options

  const url = buildUrl(path, params)

  const response = await fetch(url, {
    ...rest,
    headers: {
      Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      (error as { status_message?: string }).status_message ??
        `TMDB API error: ${response.status} ${response.statusText}`
    )
  }

  return response.json() as Promise<T>
}

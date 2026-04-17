import { corsHeaders, handleCors } from '../_shared/cors.ts'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_TIMEOUT_MS = 10_000

interface ProxyRequestBody {
  path: string
  params?: Record<string, string>
}

/**
 * Edge Function: tmdb-proxy
 *
 * POST — Proxies authenticated requests to the TMDB v3 API.
 *
 * Request body: { path: string, params?: Record<string, string> }
 *   - path:   TMDB API path, e.g. "/movie/popular"
 *   - params: Optional query string parameters to forward
 *
 * The TMDB Bearer token is read from the server-side environment variable
 * TMDB_ACCESS_TOKEN and is never exposed to the browser.
 */
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return handleCors()
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const token = Deno.env.get('TMDB_ACCESS_TOKEN')
  if (!token) {
    console.error('TMDB_ACCESS_TOKEN environment variable is not set')
    return new Response(JSON.stringify({ error: 'Proxy misconfigured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let body: ProxyRequestBody
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { path, params } = body

  if (!path || typeof path !== 'string' || !path.startsWith('/')) {
    return new Response(
      JSON.stringify({ error: 'Invalid path: must be a string starting with "/"' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`)
  if (params && typeof params === 'object') {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, String(value))
      }
    }
  }

  try {
    const signal = AbortSignal.timeout(TMDB_TIMEOUT_MS)

    const tmdbResponse = await fetch(url.toString(), {
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await tmdbResponse.json()

    return new Response(JSON.stringify(data), {
      status: tmdbResponse.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('TMDB upstream error:', err)
    return new Response(JSON.stringify({ error: 'Failed to reach TMDB API' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

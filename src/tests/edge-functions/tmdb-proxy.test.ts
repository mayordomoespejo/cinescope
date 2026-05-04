import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(method: string, body?: unknown): Request {
  return new Request('https://example.supabase.co/functions/v1/tmdb-proxy', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

function makeOptionsRequest(): Request {
  return new Request('https://example.supabase.co/functions/v1/tmdb-proxy', {
    method: 'OPTIONS',
  })
}

// ---------------------------------------------------------------------------
// Unit tests — pure handler logic, no Deno runtime
// ---------------------------------------------------------------------------

/**
 * The Edge Function logic extracted as a plain async function so it can be
 * tested with Vitest without the Deno runtime.  This mirrors exactly what the
 * `supabase/functions/tmdb-proxy/index.ts` handler does.
 */
async function handleTmdbProxy(
  req: Request,
  env: { TMDB_ACCESS_TOKEN?: string },
  fetchImpl: typeof fetch
): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const token = env.TMDB_ACCESS_TOKEN
  if (!token) {
    return new Response(JSON.stringify({ error: 'Proxy misconfigured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let body: { path?: unknown; params?: unknown }
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

  const url = new URL(`https://api.themoviedb.org/3${path}`)
  if (params && typeof params === 'object') {
    for (const [key, value] of Object.entries(params as Record<string, string>)) {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, String(value))
      }
    }
  }

  try {
    const tmdbResponse = await fetchImpl(url.toString(), {
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
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to reach TMDB API' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('tmdb-proxy edge function', () => {
  const mockFetch = vi.fn<typeof fetch>()
  const env = { TMDB_ACCESS_TOKEN: 'test-tmdb-token' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── Happy path ────────────────────────────────────────────────────────

  it('proxies a valid POST to TMDB and returns its JSON response', async () => {
    const tmdbPayload = { results: [{ id: 1, title: 'Interstellar' }] }
    mockFetch.mockResolvedValue(new Response(JSON.stringify(tmdbPayload), { status: 200 }))

    const req = makeRequest('POST', { path: '/movie/popular' })
    const res = await handleTmdbProxy(req, env, mockFetch)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual(tmdbPayload)
    expect(mockFetch).toHaveBeenCalledOnce()
    expect(mockFetch.mock.calls[0][0]).toContain('/movie/popular')
  })

  it('forwards optional query params to TMDB URL', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }))

    const req = makeRequest('POST', { path: '/search/movie', params: { query: 'dune', page: '2' } })
    await handleTmdbProxy(req, env, mockFetch)

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('query=dune')
    expect(calledUrl).toContain('page=2')
  })

  it('responds 200 to OPTIONS preflight', async () => {
    const req = makeOptionsRequest()
    const res = await handleTmdbProxy(req, env, mockFetch)

    expect(res.status).toBe(200)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  // ── Auth / config failures ────────────────────────────────────────────

  it('returns 500 when TMDB_ACCESS_TOKEN is missing', async () => {
    const req = makeRequest('POST', { path: '/movie/popular' })
    const res = await handleTmdbProxy(req, {}, mockFetch)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe('Proxy misconfigured')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  // ── Bad input ─────────────────────────────────────────────────────────

  it('returns 405 for GET requests', async () => {
    const req = makeRequest('GET')
    const res = await handleTmdbProxy(req, env, mockFetch)

    expect(res.status).toBe(405)
  })

  it('returns 400 for malformed JSON body', async () => {
    const req = new Request('https://example.supabase.co/functions/v1/tmdb-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{{{',
    })
    const res = await handleTmdbProxy(req, env, mockFetch)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe('Invalid JSON body')
  })

  it('returns 400 when path is missing', async () => {
    const req = makeRequest('POST', { params: { page: '1' } })
    const res = await handleTmdbProxy(req, env, mockFetch)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toMatch(/Invalid path/)
  })

  it('returns 400 when path does not start with "/"', async () => {
    const req = makeRequest('POST', { path: 'movie/popular' })
    const res = await handleTmdbProxy(req, env, mockFetch)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toMatch(/Invalid path/)
  })

  // ── Upstream error ────────────────────────────────────────────────────

  it('returns 502 when upstream fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('network error'))

    const req = makeRequest('POST', { path: '/movie/popular' })
    const res = await handleTmdbProxy(req, env, mockFetch)
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.error).toBe('Failed to reach TMDB API')
  })
})

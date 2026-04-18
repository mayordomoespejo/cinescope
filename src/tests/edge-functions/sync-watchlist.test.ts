import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Minimal types
// ---------------------------------------------------------------------------

interface SupabaseResult<T = unknown> {
  data: T | null
  error: { message: string } | null
}

interface SupabaseMock {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (...args: any[]) => any
}

// ---------------------------------------------------------------------------
// Handler extracted from supabase/functions/sync-watchlist/index.ts
// ---------------------------------------------------------------------------

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function handleSyncWatchlist(
  req: Request,
  requireAuthImpl: (req: Request) => Promise<string>,
  supabase: SupabaseMock
): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let userId: string
  try {
    userId = await requireAuthImpl(req)
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    if (req.method === 'GET') {
      const result: SupabaseResult<{ movies: unknown[] }> = await supabase
        .from('cinescope_watchlist')
        .select('movies')
        .eq('user_id', userId)
        .maybeSingle()

      if (result.error) {
        return new Response(JSON.stringify({ error: 'Database error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ movies: result.data?.movies ?? [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { movies } = body

      if (!Array.isArray(movies)) {
        return new Response(JSON.stringify({ error: 'movies must be an array' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const upsertResult: SupabaseResult = await supabase
        .from('cinescope_watchlist')
        .upsert(
          { user_id: userId, movies, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )

      if (upsertResult.error) {
        return new Response(JSON.stringify({ error: 'Database error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(method: string, body?: unknown): Request {
  return new Request('https://example.supabase.co/functions/v1/sync-watchlist', {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer valid-token' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

function makeSupabaseMock(result: SupabaseResult): SupabaseMock {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
  return { from: vi.fn().mockReturnValue(chain) }
}

const authedUser = async () => 'user-123'
const unauthenticated = async (): Promise<string> => { throw new Error('Unauthorized') }

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('sync-watchlist edge function', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── GET happy path ────────────────────────────────────────────────────

  it('GET returns watchlist movies', async () => {
    const movies = [{ id: 10, title: 'The Dark Knight' }]
    const supabase = makeSupabaseMock({ data: { movies }, error: null })

    const req = makeRequest('GET')
    const res = await handleSyncWatchlist(req, authedUser, supabase)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.movies).toEqual(movies)
  })

  it('GET returns empty array when watchlist row does not exist', async () => {
    const supabase = makeSupabaseMock({ data: null, error: null })

    const req = makeRequest('GET')
    const res = await handleSyncWatchlist(req, authedUser, supabase)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.movies).toEqual([])
  })

  // ── POST happy path ───────────────────────────────────────────────────

  it('POST upserts watchlist and returns success', async () => {
    const supabase = makeSupabaseMock({ data: null, error: null })

    const req = makeRequest('POST', { movies: [{ id: 11, title: 'Inception' }] })
    const res = await handleSyncWatchlist(req, authedUser, supabase)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('POST accepts empty movies array', async () => {
    const supabase = makeSupabaseMock({ data: null, error: null })

    const req = makeRequest('POST', { movies: [] })
    const res = await handleSyncWatchlist(req, authedUser, supabase)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })

  // ── Auth failures ─────────────────────────────────────────────────────

  it('GET returns 401 when not authenticated', async () => {
    const supabase = makeSupabaseMock({ data: null, error: null })

    const req = makeRequest('GET')
    const res = await handleSyncWatchlist(req, unauthenticated, supabase)

    expect(res.status).toBe(401)
  })

  it('POST returns 401 when not authenticated', async () => {
    const supabase = makeSupabaseMock({ data: null, error: null })

    const req = makeRequest('POST', { movies: [] })
    const res = await handleSyncWatchlist(req, unauthenticated, supabase)

    expect(res.status).toBe(401)
  })

  // ── Bad input ─────────────────────────────────────────────────────────

  it('POST returns 400 when movies is not an array', async () => {
    const supabase = makeSupabaseMock({ data: null, error: null })

    const req = makeRequest('POST', { movies: { id: 1 } })
    const res = await handleSyncWatchlist(req, authedUser, supabase)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe('movies must be an array')
  })

  it('POST returns 400 when movies key is missing', async () => {
    const supabase = makeSupabaseMock({ data: null, error: null })

    const req = makeRequest('POST', { items: [] })
    const res = await handleSyncWatchlist(req, authedUser, supabase)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe('movies must be an array')
  })

  it('returns 405 for unsupported methods', async () => {
    const supabase = makeSupabaseMock({ data: null, error: null })

    const req = makeRequest('DELETE')
    const res = await handleSyncWatchlist(req, authedUser, supabase)

    expect(res.status).toBe(405)
  })

  // ── Database errors ───────────────────────────────────────────────────

  it('GET returns 500 on database error', async () => {
    const supabase = makeSupabaseMock({ data: null, error: { message: 'db failure' } })

    const req = makeRequest('GET')
    const res = await handleSyncWatchlist(req, authedUser, supabase)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe('Database error')
  })

  it('POST returns 500 on database error', async () => {
    const supabase = makeSupabaseMock({ data: null, error: { message: 'db failure' } })

    const req = makeRequest('POST', { movies: [] })
    const res = await handleSyncWatchlist(req, authedUser, supabase)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe('Database error')
  })
})

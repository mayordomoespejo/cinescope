import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Minimal types
// ---------------------------------------------------------------------------

interface SupabaseResult<T = unknown> {
  data: T | null
  error: { message: string } | null
}

// ---------------------------------------------------------------------------
// Handler extracted from supabase/functions/sync-watched/index.ts
// ---------------------------------------------------------------------------

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Dependency-injected deps so we can test without Deno or a real Supabase
 * client. The shape mirrors exactly what the Edge Function does internally.
 */
interface WatchedDeps {
  getWatched: (userId: string) => Promise<SupabaseResult<unknown[]>>
  upsertWatched: (row: Record<string, unknown>) => Promise<SupabaseResult>
  deleteWatched: (userId: string, mediaId: string, mediaType: string) => Promise<SupabaseResult>
}

async function handleSyncWatched(
  req: Request,
  requireAuthImpl: (req: Request) => Promise<string>,
  deps: WatchedDeps
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
      const result = await deps.getWatched(userId)

      if (result.error) {
        return new Response(JSON.stringify({ error: 'Database error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ items: result.data ?? [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { media_id, media_type, media_data, watched_at } = body

      if (!media_id || !media_type) {
        return new Response(JSON.stringify({ error: 'media_id and media_type required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const upsertResult = await deps.upsertWatched({
        user_id: userId,
        media_id,
        media_type,
        media_data: media_data ?? null,
        watched_at: watched_at ?? new Date().toISOString(),
      })

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

    if (req.method === 'DELETE') {
      const url = new URL(req.url)
      const media_id = url.searchParams.get('media_id')
      const media_type = url.searchParams.get('media_type')

      if (!media_id || !media_type) {
        return new Response(JSON.stringify({ error: 'media_id and media_type required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const deleteResult = await deps.deleteWatched(userId, media_id, media_type)

      if (deleteResult.error) {
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

const BASE_URL = 'https://example.supabase.co/functions/v1/sync-watched'

function makeRequest(method: string, body?: unknown, queryParams?: string): Request {
  const url = queryParams ? `${BASE_URL}?${queryParams}` : BASE_URL
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer valid-token' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

function makeSuccessDeps(items: unknown[] = []): WatchedDeps {
  return {
    getWatched: vi.fn().mockResolvedValue({ data: items, error: null }),
    upsertWatched: vi.fn().mockResolvedValue({ data: null, error: null }),
    deleteWatched: vi.fn().mockResolvedValue({ data: null, error: null }),
  }
}

const authedUser = async () => 'user-123'
const unauthenticated = async (): Promise<string> => { throw new Error('Unauthorized') }

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('sync-watched edge function', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── GET happy path ────────────────────────────────────────────────────

  it('GET returns watched items', async () => {
    const items = [{ media_id: 1, media_type: 'movie', watched_at: '2024-01-01' }]
    const deps = makeSuccessDeps(items)

    const req = makeRequest('GET')
    const res = await handleSyncWatched(req, authedUser, deps)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.items).toEqual(items)
    expect(deps.getWatched).toHaveBeenCalledWith('user-123')
  })

  it('GET returns empty array when no watched items', async () => {
    const deps = makeSuccessDeps([])

    const req = makeRequest('GET')
    const res = await handleSyncWatched(req, authedUser, deps)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.items).toEqual([])
  })

  // ── POST happy path ───────────────────────────────────────────────────

  it('POST upserts a watched item and returns success', async () => {
    const deps = makeSuccessDeps()

    const req = makeRequest('POST', { media_id: 550, media_type: 'movie' })
    const res = await handleSyncWatched(req, authedUser, deps)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(deps.upsertWatched).toHaveBeenCalledOnce()
  })

  it('POST forwards optional fields to upsert', async () => {
    const deps = makeSuccessDeps()

    const req = makeRequest('POST', {
      media_id: 550,
      media_type: 'movie',
      media_data: { title: 'Fight Club' },
      watched_at: '2024-06-01T00:00:00Z',
    })
    await handleSyncWatched(req, authedUser, deps)

    const row = vi.mocked(deps.upsertWatched).mock.calls[0][0]
    expect(row.media_data).toEqual({ title: 'Fight Club' })
    expect(row.watched_at).toBe('2024-06-01T00:00:00Z')
  })

  // ── DELETE happy path ─────────────────────────────────────────────────

  it('DELETE removes a watched item and returns success', async () => {
    const deps = makeSuccessDeps()

    const req = makeRequest('DELETE', undefined, 'media_id=550&media_type=movie')
    const res = await handleSyncWatched(req, authedUser, deps)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(deps.deleteWatched).toHaveBeenCalledWith('user-123', '550', 'movie')
  })

  // ── Auth failures ─────────────────────────────────────────────────────

  it('returns 401 when not authenticated', async () => {
    const deps = makeSuccessDeps()

    const req = makeRequest('GET')
    const res = await handleSyncWatched(req, unauthenticated, deps)

    expect(res.status).toBe(401)
    expect(deps.getWatched).not.toHaveBeenCalled()
  })

  // ── Bad input ─────────────────────────────────────────────────────────

  it('POST returns 400 when media_id is missing', async () => {
    const deps = makeSuccessDeps()

    const req = makeRequest('POST', { media_type: 'movie' })
    const res = await handleSyncWatched(req, authedUser, deps)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe('media_id and media_type required')
  })

  it('POST returns 400 when media_type is missing', async () => {
    const deps = makeSuccessDeps()

    const req = makeRequest('POST', { media_id: 550 })
    const res = await handleSyncWatched(req, authedUser, deps)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe('media_id and media_type required')
  })

  it('DELETE returns 400 when query params are missing', async () => {
    const deps = makeSuccessDeps()

    const req = makeRequest('DELETE')
    const res = await handleSyncWatched(req, authedUser, deps)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe('media_id and media_type required')
  })

  it('returns 405 for unsupported methods', async () => {
    const deps = makeSuccessDeps()

    const req = makeRequest('PATCH')
    const res = await handleSyncWatched(req, authedUser, deps)

    expect(res.status).toBe(405)
  })

  // ── Database errors ───────────────────────────────────────────────────

  it('GET returns 500 on database error', async () => {
    const deps = makeSuccessDeps()
    vi.mocked(deps.getWatched).mockResolvedValue({ data: null, error: { message: 'db failure' } })

    const req = makeRequest('GET')
    const res = await handleSyncWatched(req, authedUser, deps)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe('Database error')
  })

  it('POST returns 500 on database error', async () => {
    const deps = makeSuccessDeps()
    vi.mocked(deps.upsertWatched).mockResolvedValue({ data: null, error: { message: 'db failure' } })

    const req = makeRequest('POST', { media_id: 550, media_type: 'movie' })
    const res = await handleSyncWatched(req, authedUser, deps)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe('Database error')
  })

  it('DELETE returns 500 on database error', async () => {
    const deps = makeSuccessDeps()
    vi.mocked(deps.deleteWatched).mockResolvedValue({ data: null, error: { message: 'db failure' } })

    const req = makeRequest('DELETE', undefined, 'media_id=550&media_type=movie')
    const res = await handleSyncWatched(req, authedUser, deps)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBe('Database error')
  })
})

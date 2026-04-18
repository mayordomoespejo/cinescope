import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Minimal types
// ---------------------------------------------------------------------------

interface SupabaseResult<T = unknown> {
  data: T | null
  error: { message: string } | null
}

// ---------------------------------------------------------------------------
// Handler extracted from supabase/functions/delete-account/index.ts
// ---------------------------------------------------------------------------

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteAccountDeps {
  fetchUserLists: (userId: string) => Promise<SupabaseResult<{ id: string }[]>>
  deleteListItems: (listIds: string[]) => Promise<SupabaseResult>
  deleteLists: (userId: string) => Promise<SupabaseResult>
  deleteFavorites: (userId: string) => Promise<SupabaseResult>
  deleteWatchlist: (userId: string) => Promise<SupabaseResult>
  deleteWatched: (userId: string) => Promise<SupabaseResult>
}

async function handleDeleteAccount(
  req: Request,
  requireAuthImpl: (req: Request) => Promise<string>,
  deps: DeleteAccountDeps
): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'DELETE') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
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
    // 1. Get user lists
    const { data: userLists, error: listsQueryError } = await deps.fetchUserLists(userId)
    if (listsQueryError) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Delete list items (only if lists exist)
    if (userLists && userLists.length > 0) {
      const listIds = userLists.map((l) => l.id)
      const { error: listItemsError } = await deps.deleteListItems(listIds)
      if (listItemsError) {
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // 3. Delete lists
    const { error: listsError } = await deps.deleteLists(userId)
    if (listsError) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Delete favorites
    const { error: favoritesError } = await deps.deleteFavorites(userId)
    if (favoritesError) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 5. Delete watchlist
    const { error: watchlistError } = await deps.deleteWatchlist(userId)
    if (watchlistError) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 6. Delete watched history
    const { error: watchedError } = await deps.deleteWatched(userId)
    if (watchedError) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
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

function makeRequest(method: string): Request {
  return new Request('https://example.supabase.co/functions/v1/delete-account', {
    method,
    headers: { Authorization: 'Bearer valid-token' },
  })
}

function makeSuccessDeps(): DeleteAccountDeps {
  return {
    fetchUserLists: vi.fn().mockResolvedValue({ data: [{ id: 'list-1' }], error: null }),
    deleteListItems: vi.fn().mockResolvedValue({ data: null, error: null }),
    deleteLists: vi.fn().mockResolvedValue({ data: null, error: null }),
    deleteFavorites: vi.fn().mockResolvedValue({ data: null, error: null }),
    deleteWatchlist: vi.fn().mockResolvedValue({ data: null, error: null }),
    deleteWatched: vi.fn().mockResolvedValue({ data: null, error: null }),
  }
}

const authedUser = async () => 'user-123'
const unauthenticated = async (): Promise<string> => { throw new Error('Unauthorized') }

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('delete-account edge function', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Happy path ────────────────────────────────────────────────────────

  it('DELETE removes all user data and returns success', async () => {
    const deps = makeSuccessDeps()

    const req = makeRequest('DELETE')
    const res = await handleDeleteAccount(req, authedUser, deps)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(deps.fetchUserLists).toHaveBeenCalledWith('user-123')
    expect(deps.deleteListItems).toHaveBeenCalledWith(['list-1'])
    expect(deps.deleteLists).toHaveBeenCalledWith('user-123')
    expect(deps.deleteFavorites).toHaveBeenCalledWith('user-123')
    expect(deps.deleteWatchlist).toHaveBeenCalledWith('user-123')
    expect(deps.deleteWatched).toHaveBeenCalledWith('user-123')
  })

  it('skips deleteListItems when user has no lists', async () => {
    const deps = makeSuccessDeps()
    vi.mocked(deps.fetchUserLists).mockResolvedValue({ data: [], error: null })

    const req = makeRequest('DELETE')
    const res = await handleDeleteAccount(req, authedUser, deps)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(deps.deleteListItems).not.toHaveBeenCalled()
  })

  it('skips deleteListItems when fetchUserLists returns null data', async () => {
    const deps = makeSuccessDeps()
    vi.mocked(deps.fetchUserLists).mockResolvedValue({ data: null, error: null })

    const req = makeRequest('DELETE')
    const res = await handleDeleteAccount(req, authedUser, deps)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(deps.deleteListItems).not.toHaveBeenCalled()
  })

  // ── Auth failures ─────────────────────────────────────────────────────

  it('returns 401 when not authenticated', async () => {
    const deps = makeSuccessDeps()

    const req = makeRequest('DELETE')
    const res = await handleDeleteAccount(req, unauthenticated, deps)

    expect(res.status).toBe(401)
    expect(deps.fetchUserLists).not.toHaveBeenCalled()
  })

  // ── Method guard ──────────────────────────────────────────────────────

  it('returns 405 for non-DELETE methods', async () => {
    const deps = makeSuccessDeps()

    for (const method of ['GET', 'POST', 'PUT', 'PATCH']) {
      const req = makeRequest(method)
      const res = await handleDeleteAccount(req, authedUser, deps)
      expect(res.status).toBe(405)
    }
  })

  it('responds 200 to OPTIONS preflight', async () => {
    const deps = makeSuccessDeps()

    const req = makeRequest('OPTIONS')
    const res = await handleDeleteAccount(req, authedUser, deps)

    expect(res.status).toBe(200)
    expect(deps.fetchUserLists).not.toHaveBeenCalled()
  })

  // ── Database error propagation ────────────────────────────────────────

  it('returns 500 when fetchUserLists fails', async () => {
    const deps = makeSuccessDeps()
    vi.mocked(deps.fetchUserLists).mockResolvedValue({ data: null, error: { message: 'db error' } })

    const req = makeRequest('DELETE')
    const res = await handleDeleteAccount(req, authedUser, deps)

    expect(res.status).toBe(500)
  })

  it('returns 500 when deleteListItems fails', async () => {
    const deps = makeSuccessDeps()
    vi.mocked(deps.deleteListItems).mockResolvedValue({ data: null, error: { message: 'db error' } })

    const req = makeRequest('DELETE')
    const res = await handleDeleteAccount(req, authedUser, deps)

    expect(res.status).toBe(500)
  })

  it('returns 500 when deleteFavorites fails', async () => {
    const deps = makeSuccessDeps()
    vi.mocked(deps.deleteFavorites).mockResolvedValue({ data: null, error: { message: 'db error' } })

    const req = makeRequest('DELETE')
    const res = await handleDeleteAccount(req, authedUser, deps)

    expect(res.status).toBe(500)
  })

  it('returns 500 when deleteWatchlist fails', async () => {
    const deps = makeSuccessDeps()
    vi.mocked(deps.deleteWatchlist).mockResolvedValue({ data: null, error: { message: 'db error' } })

    const req = makeRequest('DELETE')
    const res = await handleDeleteAccount(req, authedUser, deps)

    expect(res.status).toBe(500)
  })

  it('returns 500 when deleteWatched fails', async () => {
    const deps = makeSuccessDeps()
    vi.mocked(deps.deleteWatched).mockResolvedValue({ data: null, error: { message: 'db error' } })

    const req = makeRequest('DELETE')
    const res = await handleDeleteAccount(req, authedUser, deps)

    expect(res.status).toBe(500)
  })
})

import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createAdminClient } from '../_shared/supabaseClient.ts'
import { requireAuth } from '../_shared/auth.ts'

/**
 * Edge Function: sync-watchlist
 *
 * GET  — Returns the authenticated user's watchlist.
 * POST — Upserts the authenticated user's watchlist.
 */
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return handleCors()
  }

  let userId: string
  try {
    userId = await requireAuth(req)
  } catch (err) {
    console.error('Auth error:', err)
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createAdminClient()

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('cinescope_watchlist')
        .select('movies')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error('Supabase error:', error)
        return new Response(JSON.stringify({ error: 'Database error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ movies: data?.movies ?? [] }), {
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

      const { error } = await supabase
        .from('cinescope_watchlist')
        .upsert(
          { user_id: userId, movies, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )

      if (error) {
        console.error('Supabase error:', error)
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
  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

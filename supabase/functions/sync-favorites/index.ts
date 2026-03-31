import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createAdminClient } from '../_shared/supabaseClient.ts'
import { requireAuth } from '../_shared/auth.ts'

/**
 * Edge Function: sync-favorites
 *
 * GET  — Returns the authenticated user's favorite movies list.
 * POST — Upserts the authenticated user's favorite movies list.
 */
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return handleCors()
  }

  let userId: string
  try {
    userId = await requireAuth(req)
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Unauthorized', detail: String(err) }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createAdminClient()

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('cinescope_favorites')
        .select('movies')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error

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
        .from('cinescope_favorites')
        .upsert(
          { user_id: userId, movies, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        )

      if (error) throw error

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
    return new Response(JSON.stringify({ error: 'Internal server error', detail: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

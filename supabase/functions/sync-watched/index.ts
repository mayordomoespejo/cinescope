import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createAdminClient } from '../_shared/supabaseClient.ts'
import { requireAuth } from '../_shared/auth.ts'

/**
 * Edge Function: sync-watched
 *
 * GET    — Returns the authenticated user's watched items list as { items: [...] }.
 * POST   — Upserts a single watched item (media_id, media_type, media_data, watched_at).
 * DELETE — Removes a specific watched item identified by media_id + media_type (query params).
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
        .from('watched')
        .select('media_id, media_type, media_data, watched_at')
        .eq('user_id', userId)
        .order('watched_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        return new Response(JSON.stringify({ error: 'Database error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ items: data ?? [] }), {
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

      const { error } = await supabase
        .from('watched')
        .upsert(
          {
            user_id: userId,
            media_id,
            media_type,
            media_data: media_data ?? null,
            watched_at: watched_at ?? new Date().toISOString(),
          },
          { onConflict: 'user_id,media_id,media_type' },
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

      const { error } = await supabase
        .from('watched')
        .delete()
        .eq('user_id', userId)
        .eq('media_id', media_id)
        .eq('media_type', media_type)

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

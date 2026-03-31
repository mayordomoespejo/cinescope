import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { createAdminClient } from '../_shared/supabaseClient.ts'
import { requireAuth } from '../_shared/auth.ts'

/**
 * Edge Function: delete-account
 *
 * DELETE — Removes all Supabase data belonging to the authenticated user,
 *          in FK-safe order, then returns { success: true }.
 */
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return handleCors()
  }

  if (req.method !== 'DELETE') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
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
    // 1. Delete list items belonging to this user's lists
    const { data: userLists, error: listsQueryError } = await supabase
      .from('cinescope_lists')
      .select('id')
      .eq('user_id', userId)

    if (listsQueryError) {
      console.error('Error fetching user lists:', listsQueryError)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (userLists && userLists.length > 0) {
      const listIds = userLists.map((l: { id: string }) => l.id)
      const { error: listItemsError } = await supabase
        .from('cinescope_list_items')
        .delete()
        .in('list_id', listIds)

      if (listItemsError) {
        console.error('Error deleting list items:', listItemsError)
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // 2. Delete the user's lists
    const { error: listsError } = await supabase
      .from('cinescope_lists')
      .delete()
      .eq('user_id', userId)

    if (listsError) {
      console.error('Error deleting lists:', listsError)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Delete favorites
    const { error: favoritesError } = await supabase
      .from('cinescope_favorites')
      .delete()
      .eq('user_id', userId)

    if (favoritesError) {
      console.error('Error deleting favorites:', favoritesError)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Delete watchlist
    const { error: watchlistError } = await supabase
      .from('cinescope_watchlist')
      .delete()
      .eq('user_id', userId)

    if (watchlistError) {
      console.error('Error deleting watchlist:', watchlistError)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 5. Delete watched history
    const { error: watchedError } = await supabase.from('watched').delete().eq('user_id', userId)

    if (watchedError) {
      console.error('Error deleting watched history:', watchedError)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Unexpected error during account deletion:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

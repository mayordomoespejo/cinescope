import { supabase } from '@/lib/supabaseClient'

// ── Types ────────────────────────────────────────────────────────────

/** A user-created custom list stored in cinescope_lists. */
export interface CinescopeList {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
}

/** A media item stored inside a list (cinescope_list_items). */
export interface ListItem {
  list_id: string
  media_id: number
  media_type: 'movie' | 'tv'
  /** Full TMDB object serialised as JSON column. */
  media_data: Record<string, unknown>
  added_at: string
}

// ── List CRUD ────────────────────────────────────────────────────────

/**
 * Fetches all custom lists that belong to a given user.
 * @param userId - Firebase UID of the authenticated user.
 * @returns Array of CinescopeList sorted by creation date (newest first).
 */
export async function fetchLists(userId: string): Promise<CinescopeList[]> {
  const { data, error } = await supabase
    .from('cinescope_lists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as CinescopeList[]
}

/**
 * Creates a new custom list for the user.
 * @param userId - Firebase UID of the authenticated user.
 * @param name - Display name for the list.
 * @param description - Optional description.
 * @returns The newly created CinescopeList record.
 */
export async function createList(
  userId: string,
  name: string,
  description?: string
): Promise<CinescopeList> {
  const { data, error } = await supabase
    .from('cinescope_lists')
    .insert({ user_id: userId, name: name.trim(), description: description?.trim() ?? null })
    .select()
    .single()

  if (error) throw error
  return data as CinescopeList
}

/**
 * Deletes a list and all its items (cascade handled by Supabase FK).
 * @param listId - UUID of the list to delete.
 */
export async function deleteList(listId: string): Promise<void> {
  const { error } = await supabase.from('cinescope_lists').delete().eq('id', listId)
  if (error) throw error
}

/**
 * Renames an existing list.
 * @param listId - UUID of the list to rename.
 * @param name - New name for the list.
 * @returns The updated CinescopeList record.
 */
export async function renameList(listId: string, name: string): Promise<CinescopeList> {
  const { data, error } = await supabase
    .from('cinescope_lists')
    .update({ name: name.trim() })
    .eq('id', listId)
    .select()
    .single()

  if (error) throw error
  return data as CinescopeList
}

// ── List items ───────────────────────────────────────────────────────

/**
 * Fetches all items in a given list.
 * @param listId - UUID of the list to fetch items for.
 * @returns Array of ListItem sorted by date added (newest first).
 */
export async function fetchListItems(listId: string): Promise<ListItem[]> {
  const { data, error } = await supabase
    .from('cinescope_list_items')
    .select('*')
    .eq('list_id', listId)
    .order('added_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as ListItem[]
}

/**
 * Adds a media item to a list. No-op if already present.
 * @param listId - UUID of the target list.
 * @param item - Partial ListItem without list_id and added_at.
 */
export async function addToList(
  listId: string,
  item: { media_id: number; media_type: 'movie' | 'tv'; media_data: Record<string, unknown> }
): Promise<void> {
  const { error } = await supabase.from('cinescope_list_items').upsert(
    {
      list_id: listId,
      media_id: item.media_id,
      media_type: item.media_type,
      media_data: item.media_data,
    },
    { onConflict: 'list_id,media_id,media_type' }
  )
  if (error) throw error
}

/**
 * Removes a media item from a list.
 * @param listId - UUID of the target list.
 * @param mediaId - TMDB ID of the media item.
 * @param mediaType - 'movie' or 'tv'.
 */
export async function removeFromList(
  listId: string,
  mediaId: number,
  mediaType: 'movie' | 'tv'
): Promise<void> {
  const { error } = await supabase
    .from('cinescope_list_items')
    .delete()
    .eq('list_id', listId)
    .eq('media_id', mediaId)
    .eq('media_type', mediaType)

  if (error) throw error
}

/**
 * Checks if a specific media item is already in a given list.
 * @param listId - UUID of the list to check.
 * @param mediaId - TMDB ID of the media item.
 * @param mediaType - 'movie' or 'tv'.
 * @returns True if the item exists in the list.
 */
export async function isInList(
  listId: string,
  mediaId: number,
  mediaType: 'movie' | 'tv'
): Promise<boolean> {
  const { data, error } = await supabase
    .from('cinescope_list_items')
    .select('media_id')
    .eq('list_id', listId)
    .eq('media_id', mediaId)
    .eq('media_type', mediaType)
    .maybeSingle()

  if (error) throw error
  return data !== null
}

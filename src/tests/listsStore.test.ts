import { describe, it, expect, beforeEach } from 'vitest'
import { useListsStore } from '@/features/lists/store'
import type { Movie } from '@/features/movies/types/movie'

function makeMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    id: 1,
    title: 'Test Movie',
    overview: '',
    poster_path: null,
    backdrop_path: null,
    release_date: '2024-01-01',
    vote_average: 7,
    vote_count: 100,
    genre_ids: [],
    popularity: 10,
    adult: false,
    original_language: 'en',
    original_title: 'Test Movie',
    ...overrides,
  }
}

beforeEach(() => {
  useListsStore.setState({ lists: [], items: [] })
  localStorage.clear()
})

describe('createList', () => {
  it('creates a list with name and no description', () => {
    const list = useListsStore.getState().createList('My List')
    expect(list.name).toBe('My List')
    expect(list.description).toBeNull()
    expect(list.id).toBeTruthy()
    expect(list.created_at).toBeTruthy()
  })

  it('creates a list with description', () => {
    const list = useListsStore.getState().createList('My List', 'A description')
    expect(list.description).toBe('A description')
  })

  it('trims whitespace from name', () => {
    const list = useListsStore.getState().createList('  My List  ')
    expect(list.name).toBe('My List')
  })

  it('trims whitespace from description', () => {
    const list = useListsStore.getState().createList('My List', '  desc  ')
    expect(list.description).toBe('desc')
  })

  it('prepends new list to top of lists array', () => {
    useListsStore.getState().createList('First')
    useListsStore.getState().createList('Second')
    const { lists } = useListsStore.getState()
    expect(lists[0].name).toBe('Second')
    expect(lists[1].name).toBe('First')
  })
})

describe('deleteList', () => {
  it('removes the list', () => {
    const list = useListsStore.getState().createList('To Delete')
    useListsStore.getState().deleteList(list.id)
    expect(useListsStore.getState().lists).toHaveLength(0)
  })

  it('removes all items belonging to the list', () => {
    const list = useListsStore.getState().createList('Test')
    useListsStore.getState().addToList(list.id, {
      media_id: 1,
      media_type: 'movie',
      media_data: makeMovie(),
    })
    useListsStore.getState().deleteList(list.id)
    expect(useListsStore.getState().items).toHaveLength(0)
  })

  it('does not remove items from other lists', () => {
    const list1 = useListsStore.getState().createList('List 1')
    const list2 = useListsStore.getState().createList('List 2')
    useListsStore.getState().addToList(list2.id, {
      media_id: 1,
      media_type: 'movie',
      media_data: makeMovie(),
    })
    useListsStore.getState().deleteList(list1.id)
    expect(useListsStore.getState().items).toHaveLength(1)
  })
})

describe('renameList', () => {
  it('renames an existing list', () => {
    const list = useListsStore.getState().createList('Old Name')
    const updated = useListsStore.getState().renameList(list.id, 'New Name')
    expect(updated.name).toBe('New Name')
    expect(useListsStore.getState().lists[0].name).toBe('New Name')
  })

  it('trims whitespace from new name', () => {
    const list = useListsStore.getState().createList('Old')
    const updated = useListsStore.getState().renameList(list.id, '  New  ')
    expect(updated.name).toBe('New')
  })
})

describe('addToList', () => {
  it('adds an item to the list', () => {
    const list = useListsStore.getState().createList('Test')
    useListsStore.getState().addToList(list.id, {
      media_id: 42,
      media_type: 'movie',
      media_data: makeMovie({ id: 42, title: 'Batman' }),
    })
    const { items } = useListsStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].media_id).toBe(42)
    expect(items[0].media_type).toBe('movie')
  })

  it('does not add duplicate items', () => {
    const list = useListsStore.getState().createList('Test')
    useListsStore.getState().addToList(list.id, {
      media_id: 42,
      media_type: 'movie',
      media_data: makeMovie(),
    })
    useListsStore.getState().addToList(list.id, {
      media_id: 42,
      media_type: 'movie',
      media_data: makeMovie(),
    })
    expect(useListsStore.getState().items).toHaveLength(1)
  })

  it('allows same media_id with different media_type', () => {
    const list = useListsStore.getState().createList('Test')
    useListsStore.getState().addToList(list.id, {
      media_id: 42,
      media_type: 'movie',
      media_data: makeMovie(),
    })
    useListsStore.getState().addToList(list.id, {
      media_id: 42,
      media_type: 'tv',
      media_data: makeMovie(),
    })
    expect(useListsStore.getState().items).toHaveLength(2)
  })
})

describe('removeFromList', () => {
  it('removes a specific item from a list', () => {
    const list = useListsStore.getState().createList('Test')
    useListsStore.getState().addToList(list.id, {
      media_id: 42,
      media_type: 'movie',
      media_data: makeMovie(),
    })
    useListsStore.getState().removeFromList(list.id, 42, 'movie')
    expect(useListsStore.getState().items).toHaveLength(0)
  })

  it('does not remove items from other lists', () => {
    const list1 = useListsStore.getState().createList('List 1')
    const list2 = useListsStore.getState().createList('List 2')
    useListsStore.getState().addToList(list1.id, {
      media_id: 42,
      media_type: 'movie',
      media_data: makeMovie(),
    })
    useListsStore.getState().addToList(list2.id, {
      media_id: 42,
      media_type: 'movie',
      media_data: makeMovie(),
    })
    useListsStore.getState().removeFromList(list1.id, 42, 'movie')
    expect(useListsStore.getState().items).toHaveLength(1)
    expect(useListsStore.getState().items[0].list_id).toBe(list2.id)
  })
})

describe('isInList', () => {
  it('returns true when item is in list', () => {
    const list = useListsStore.getState().createList('Test')
    useListsStore.getState().addToList(list.id, {
      media_id: 42,
      media_type: 'movie',
      media_data: makeMovie(),
    })
    expect(useListsStore.getState().isInList(list.id, 42, 'movie')).toBe(true)
  })

  it('returns false when item is not in list', () => {
    const list = useListsStore.getState().createList('Test')
    expect(useListsStore.getState().isInList(list.id, 42, 'movie')).toBe(false)
  })

  it('returns false when checking different media_type', () => {
    const list = useListsStore.getState().createList('Test')
    useListsStore.getState().addToList(list.id, {
      media_id: 42,
      media_type: 'movie',
      media_data: makeMovie(),
    })
    expect(useListsStore.getState().isInList(list.id, 42, 'tv')).toBe(false)
  })
})

describe('fetchListItems', () => {
  it('returns items for the specified list', () => {
    const list = useListsStore.getState().createList('Test')
    useListsStore.getState().addToList(list.id, {
      media_id: 1,
      media_type: 'movie',
      media_data: makeMovie(),
    })
    useListsStore.getState().addToList(list.id, {
      media_id: 2,
      media_type: 'movie',
      media_data: makeMovie(),
    })
    const items = useListsStore.getState().fetchListItems(list.id)
    expect(items).toHaveLength(2)
  })

  it('returns empty array for list with no items', () => {
    const list = useListsStore.getState().createList('Empty')
    const items = useListsStore.getState().fetchListItems(list.id)
    expect(items).toHaveLength(0)
  })

  it('does not include items from other lists', () => {
    const list1 = useListsStore.getState().createList('List 1')
    const list2 = useListsStore.getState().createList('List 2')
    useListsStore.getState().addToList(list2.id, {
      media_id: 99,
      media_type: 'tv',
      media_data: makeMovie(),
    })
    const items = useListsStore.getState().fetchListItems(list1.id)
    expect(items).toHaveLength(0)
  })
})

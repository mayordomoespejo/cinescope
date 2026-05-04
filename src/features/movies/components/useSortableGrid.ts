import { useState } from 'react'
import {
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import type { Movie } from '../types/movie'

// ── Types ──────────────────────────────────────────────────────────────────

export interface UseSortableGridReturn {
  /** dnd-kit sensors configured for pointer, touch, and keyboard. */
  sensors: ReturnType<typeof useSensors>
  /** The movie currently being dragged, or `null` when idle. */
  activeMovie: Movie | null
  /** Collision detection strategy — pass directly to `<DndContext>`. */
  collisionDetection: typeof closestCenter
  /** Handler for `<DndContext onDragStart>`. */
  handleDragStart: (event: DragStartEvent) => void
  /** Handler for `<DndContext onDragEnd>`. */
  handleDragEnd: (event: DragEndEvent) => void
  /** Handler for `<DndContext onDragCancel>`. */
  handleDragCancel: () => void
}

// ── Hook ──────────────────────────────────────────────────────────────────

/**
 * Encapsulates all dnd-kit drag-and-drop logic for a sortable movie grid.
 *
 * Supports three interaction modes simultaneously:
 * - **Pointer** — mouse drag with an 8 px activation distance to prevent
 *   accidental drags on click.
 * - **Touch** — 200 ms press delay with 5 px tolerance for mobile users.
 * - **Keyboard** — arrow-key reordering via `sortableKeyboardCoordinates`.
 *
 * Reordering is computed with dnd-kit's `arrayMove` helper and immediately
 * forwarded to `onReorder` — the parent is responsible for persisting the new
 * order (e.g. updating a Zustand store).
 *
 * @param movies - Current ordered array of movies (used to compute new order on drop).
 * @param onReorder - Callback invoked with the new `Movie[]` after a successful drop.
 */
export function useSortableGrid(
  movies: Movie[],
  onReorder: (newOrder: Movie[]) => void
): UseSortableGridReturn {
  const [activeId, setActiveId] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const activeMovie = activeId != null ? (movies.find(m => m.id === activeId) ?? null) : null

  function handleDragStart(event: DragStartEvent) {
    const activeId = typeof event.active.id === 'number' ? event.active.id : Number(event.active.id)
    setActiveId(activeId)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    const oldIndex = movies.findIndex(m => m.id === active.id)
    const newIndex = movies.findIndex(m => m.id === over.id)
    onReorder(arrayMove(movies, oldIndex, newIndex))
  }

  function handleDragCancel() {
    setActiveId(null)
  }

  return {
    sensors,
    activeMovie,
    collisionDetection: closestCenter,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  }
}

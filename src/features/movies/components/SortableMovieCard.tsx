import { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Movie } from '../types/movie'
import MovieCard from './MovieCard'
import styles from './SortableMovieGrid.module.css'

// ── Grip icon ──────────────────────────────────────────────────────────────

/**
 * Six-dot grip icon used as a visual affordance on the drag handle button.
 * Rendered as a purely decorative SVG (`aria-hidden="true"`).
 */
function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <circle cx="4" cy="3" r="1.4" fill="currentColor" />
      <circle cx="10" cy="3" r="1.4" fill="currentColor" />
      <circle cx="4" cy="7" r="1.4" fill="currentColor" />
      <circle cx="10" cy="7" r="1.4" fill="currentColor" />
      <circle cx="4" cy="11" r="1.4" fill="currentColor" />
      <circle cx="10" cy="11" r="1.4" fill="currentColor" />
    </svg>
  )
}

// ── Types ──────────────────────────────────────────────────────────────────

/**
 * Props for the {@link SortableMovieCard} component.
 *
 * @property movie - The movie to display inside this sortable wrapper.
 * @property onOpen - Callback fired with the movie ID on card click.
 * @property onPrefetch - Optional cache-priming callback for hover/focus events.
 * @property isFavorite - Whether the movie is in the user's favorites list.
 * @property onToggleFavorite - Callback fired when the favorite button is activated.
 */
export interface SortableCardProps {
  movie: Movie
  onOpen: (id: number) => void
  onPrefetch?: (id: number) => void
  isFavorite?: boolean
  onToggleFavorite?: (movie: Movie) => void
}

// ── Component ──────────────────────────────────────────────────────────────

/**
 * Memoized wrapper that connects a single {@link MovieCard} to the
 * dnd-kit sortable context.
 *
 * Uses `useSortable` to obtain drag transform styles, drag state, and separate
 * `ref`/`activatorRef` refs so the drag affordance is scoped to the
 * {@link GripIcon} button rather than the entire card. The card receives
 * reduced opacity while it is being dragged (`isDragging` class).
 *
 * Wrapped in `memo` to prevent unnecessary re-renders when sibling cards are
 * dragged or the parent list re-renders.
 */
export const SortableMovieCard = memo(function SortableMovieCard({
  movie,
  onOpen,
  onPrefetch,
  isFavorite,
  onToggleFavorite,
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: movie.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handle = (
    <button
      ref={setActivatorNodeRef}
      className={styles.dragHandle}
      aria-label="Drag to reorder"
      {...listeners}
      {...attributes}
    >
      <GripIcon />
    </button>
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.item} ${isDragging ? styles.dragging : ''}`}
    >
      <MovieCard
        movie={movie}
        onOpen={onOpen}
        onPrefetch={onPrefetch}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        dragHandle={handle}
      />
    </div>
  )
})

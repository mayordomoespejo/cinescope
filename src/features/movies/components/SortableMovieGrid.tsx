import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Movie } from '../types/movie'
import MovieCard from './MovieCard'
import styles from './SortableMovieGrid.module.css'

// ── Grip icon ──────────────────────────────────────────────────────────────

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

// ── Sortable card ──────────────────────────────────────────────────────────

interface SortableCardProps {
  movie: Movie
  onOpen: (id: number) => void
  onPrefetch?: (id: number) => void
  isFavorite?: boolean
  onToggleFavorite?: (movie: Movie) => void
}

function SortableMovieCard({
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
}

// ── Sortable grid ──────────────────────────────────────────────────────────

interface SortableMovieGridProps {
  movies: Movie[]
  onReorder: (newOrder: Movie[]) => void
  onOpenMovie: (id: number) => void
  onPrefetch?: (id: number) => void
  favorites?: number[]
  onToggleFavorite?: (movie: Movie) => void
  emptyMessage?: string
}

export default function SortableMovieGrid({
  movies,
  onReorder,
  onOpenMovie,
  onPrefetch,
  favorites = [],
  onToggleFavorite,
  emptyMessage,
}: SortableMovieGridProps) {
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

  const activeMovie = activeId != null ? movies.find(m => m.id === activeId) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as number)
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

  if (movies.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🎬</span>
        <p className={styles.emptyText}>{emptyMessage ?? 'No movies found.'}</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={movies.map(m => m.id)} strategy={rectSortingStrategy}>
        <div className={styles.grid} role="list" aria-label="Sortable movie list">
          {movies.map(movie => (
            <div key={movie.id} role="listitem">
              <SortableMovieCard
                movie={movie}
                onOpen={onOpenMovie}
                onPrefetch={onPrefetch}
                isFavorite={favorites.includes(movie.id)}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeMovie && (
          <div className={styles.overlayCard}>
            <MovieCard
              movie={activeMovie}
              onOpen={() => {}}
              isFavorite={favorites.includes(activeMovie.id)}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

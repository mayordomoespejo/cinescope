import { useState, useEffect, useMemo } from 'react'
import type { PersonCastCredit, PersonCrewCredit } from '@/features/movies/types/movie'

export const FilmographyTab = {
  ACTING: 'acting',
  DIRECTING: 'directing',
  WRITING: 'writing',
} as const
export type FilmographyTab = (typeof FilmographyTab)[keyof typeof FilmographyTab]

const KNOWN_FOR_COUNT = 8

interface PersonCredits {
  cast: PersonCastCredit[]
  crew: PersonCrewCredit[]
}

export function usePersonFilmography(credits: PersonCredits | undefined) {
  const [activeTab, setActiveTab] = useState<FilmographyTab>(FilmographyTab.ACTING)

  const knownFor = useMemo<PersonCastCredit[]>(() => {
    if (!credits) return []
    return [...credits.cast].sort((a, b) => b.popularity - a.popularity).slice(0, KNOWN_FOR_COUNT)
  }, [credits])

  const actingCredits = useMemo<PersonCastCredit[]>(() => {
    if (!credits) return []
    return [...credits.cast].sort((a, b) => {
      const dateA = a.release_date ?? ''
      const dateB = b.release_date ?? ''
      return dateB.localeCompare(dateA)
    })
  }, [credits])

  const directingCredits = useMemo<PersonCrewCredit[]>(() => {
    if (!credits) return []
    return credits.crew
      .filter(c => c.job === 'Director')
      .sort((a, b) => {
        const dateA = a.release_date ?? ''
        const dateB = b.release_date ?? ''
        return dateB.localeCompare(dateA)
      })
  }, [credits])

  const writingCredits = useMemo<PersonCrewCredit[]>(() => {
    if (!credits) return []
    return credits.crew
      .filter(c => c.job === 'Writer' || c.job === 'Screenplay' || c.department === 'Writing')
      .sort((a, b) => {
        const dateA = a.release_date ?? ''
        const dateB = b.release_date ?? ''
        return dateB.localeCompare(dateA)
      })
  }, [credits])

  // Auto-select first available tab when credits load
  useEffect(() => {
    if (!credits) return
    const available = (
      [FilmographyTab.ACTING, FilmographyTab.DIRECTING, FilmographyTab.WRITING] as FilmographyTab[]
    ).filter(tab =>
      tab === FilmographyTab.ACTING
        ? actingCredits.length > 0
        : tab === FilmographyTab.DIRECTING
          ? directingCredits.length > 0
          : writingCredits.length > 0
    )
    const t = setTimeout(() => {
      setActiveTab(prev => (available.includes(prev) ? prev : (available[0] ?? prev)))
    }, 0)
    return () => clearTimeout(t)
  }, [credits, actingCredits.length, directingCredits.length, writingCredits.length])

  return {
    activeTab,
    setActiveTab,
    knownFor,
    actingCredits,
    directingCredits,
    writingCredits,
  }
}

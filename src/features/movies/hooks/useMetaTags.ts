import { useEffect } from 'react'
import { TMDB_IMAGE_BASE, IMAGE_SIZES } from '@/lib/config'
import type { MovieDetail } from '../types/movie'

const DEFAULT_TITLE = 'CineScope — Discover Movies'
const DEFAULT_DESCRIPTION = 'CineScope — Discover, explore and track your favorite movies.'
const DEFAULT_IMAGE = ''

function setMeta(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function getBackdropOgUrl(path: string | null): string {
  if (!path) return DEFAULT_IMAGE
  return `${TMDB_IMAGE_BASE}/${IMAGE_SIZES.backdrop.lg}${path}`
}

export function useMetaTags(movie?: MovieDetail) {
  useEffect(() => {
    if (movie) {
      const title = `${movie.title} | CineScope`
      const description =
        movie.overview.length > 200
          ? `${movie.overview.slice(0, 197)}...`
          : movie.overview || DEFAULT_DESCRIPTION
      const image = getBackdropOgUrl(movie.backdrop_path)
      const url = window.location.href

      document.title = title
      setMeta('og:title', title)
      setMeta('og:description', description)
      setMeta('og:image', image)
      setMeta('og:url', url)
    } else {
      document.title = DEFAULT_TITLE
      setMeta('og:title', DEFAULT_TITLE)
      setMeta('og:description', DEFAULT_DESCRIPTION)
      setMeta('og:image', DEFAULT_IMAGE)
      setMeta('og:url', window.location.origin)
    }
  }, [movie])
}

import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DEBOUNCE_DELAY } from '@/lib/config'
import {
  addSearchQuery,
  getSearchHistory,
  clearSearchHistory,
} from '@/features/search/searchHistoryStore'

export interface UseNavSearchReturn {
  query: string
  focused: boolean
  history: string[]
  inputRef: React.RefObject<HTMLInputElement | null>
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent) => void
  handleFocus: () => void
  handleBlur: () => void
  handleHistoryClick: (q: string) => void
  handleClear: () => void
  handleHistoryClear: () => void
}

export function useNavSearch(): UseNavSearchReturn {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const searchParamQuery = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(searchParamQuery)
  const [focused, setFocused] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync query with URL param changes
  useEffect(() => {
    setQuery(searchParamQuery)
  }, [searchParamQuery])

  // Cleanup debounce on unmount
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    },
    []
  )

  // "/" shortcut to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (val.trim()) {
        navigate(`/?q=${encodeURIComponent(val.trim())}`, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }, DEBOUNCE_DELAY)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim()) {
      addSearchQuery(query.trim())
      navigate(`/?q=${encodeURIComponent(query.trim())}`)
    }
    inputRef.current?.blur()
  }

  const handleFocus = () => {
    setHistory(getSearchHistory())
    setFocused(true)
  }

  const handleBlur = () => {
    setTimeout(() => setFocused(false), 150)
  }

  const handleHistoryClick = (q: string) => {
    setQuery(q)
    navigate(`/?q=${encodeURIComponent(q)}`)
    setFocused(false)
  }

  const handleClear = () => {
    setQuery('')
    navigate('/', { replace: true })
    inputRef.current?.focus()
  }

  const handleHistoryClear = () => {
    clearSearchHistory()
    setHistory([])
  }

  return {
    query,
    focused,
    history,
    inputRef,
    handleChange,
    handleSubmit,
    handleFocus,
    handleBlur,
    handleHistoryClick,
    handleClear,
    handleHistoryClear,
  }
}

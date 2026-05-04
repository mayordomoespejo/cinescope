import { useSearchParams } from 'react-router-dom'

export function useSearchQuery(): string {
  const [params] = useSearchParams()
  return params.get('q') ?? ''
}

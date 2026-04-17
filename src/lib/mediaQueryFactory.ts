import { useQuery } from '@tanstack/react-query'

/**
 * Options for creating a React Query hook via {@link createMediaHook}.
 *
 * @template TParams - The parameter type accepted by the hook.
 * @template TResult - The resolved data type returned by `queryFn`.
 */
interface MediaHookConfig<TParams, TResult> {
  /** Derives the React Query cache key from the hook's parameters. */
  queryKeyFn: (params: TParams) => readonly unknown[]
  /** Async function that performs the actual data fetch. */
  queryFn: (params: TParams) => Promise<TResult>
  /** How long (ms) the cached data is considered fresh before a background refetch. */
  staleTime: number
  /**
   * Optional garbage-collection window (ms). Defaults to React Query's built-in
   * default (5 minutes) when omitted.
   */
  gcTime?: number
  /**
   * Optional function that derives the `enabled` flag from params.
   * When omitted the query is always enabled.
   */
  enabledFn?: (params: TParams) => boolean
}

/**
 * Factory that produces a fully-typed React Query hook from a data-fetching config.
 *
 * All duplicate movie/TV hooks that share the same signature (params, return shape,
 * stale strategy) are built with this factory. The public API of each generated hook
 * is identical to what was there before — only the implementation is shared.
 *
 * @example
 * ```ts
 * export const useTrending = createMediaHook({
 *   queryKeyFn: (p) => queryKeys.trending(p.timeWindow, p.page),
 *   queryFn:    (p) => fetchTrending(p.timeWindow, p.page),
 *   staleTime:  STALE_TIME_SHORT,
 * })
 * ```
 */
export function createMediaHook<TParams, TResult>(
  config: MediaHookConfig<TParams, TResult>,
): (params: TParams) => ReturnType<typeof useQuery<TResult>> {
  return function useMediaQuery(params: TParams) {
    return useQuery<TResult>({
      queryKey: config.queryKeyFn(params),
      queryFn: () => config.queryFn(params),
      staleTime: config.staleTime,
      ...(config.gcTime !== undefined && { gcTime: config.gcTime }),
      ...(config.enabledFn !== undefined && { enabled: config.enabledFn(params) }),
    })
  }
}

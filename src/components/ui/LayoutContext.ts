/**
 * Context type and hook for Layout outlet.
 * Extracted to a separate file so Layout.tsx only exports the component (Fast Refresh).
 */
export { useOutletContext } from 'react-router-dom'

/** Outlet context shape provided by the root Layout component to child routes. */
export type LayoutContext = { onOpenMovie: (id: number) => void }

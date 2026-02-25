/**
 * Context type and hook for Layout outlet.
 * Extracted to a separate file so Layout.tsx only exports the component (Fast Refresh).
 */
export { useOutletContext } from 'react-router-dom'
export type LayoutContext = { onOpenMovie: (id: number) => void }

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import Providers from './app/providers'
import { router } from './app/router'
import ErrorBoundary from './components/ui/ErrorBoundary'
import './styles/global.css'

// Neutralise the scroll-lock margin injected by react-remove-scroll-bar.
// That library appends a <style> tag to <head> at runtime (after our stylesheet)
// containing `body[data-scroll-locked] { margin-right: Xpx !important }`.
// Because it's appended later, it beats any !important in our static CSS.
// We counter it by observing <head> with a MutationObserver and immediately
// appending OUR override <style> after theirs whenever it appears — guaranteeing
// our rule is always last in the cascade and therefore wins.
;(function installScrollLockFix() {
  const STYLE_ID = '__scroll-lock-fix__'

  function ensureOverride() {
    // Remove stale node (react-remove-scroll-bar may replace its own node).
    const stale = document.getElementById(STYLE_ID)
    if (stale) stale.remove()
    const el = document.createElement('style')
    el.id = STYLE_ID
    el.textContent = 'body[data-scroll-locked]{margin-right:0!important;}'
    document.head.appendChild(el)
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (
          node instanceof HTMLStyleElement &&
          node.textContent?.includes('data-scroll-locked') &&
          node.id !== STYLE_ID
        ) {
          ensureOverride()
          return
        }
      }
    }
  })

  observer.observe(document.head, { childList: true })
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </ErrorBoundary>
  </StrictMode>
)

import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

function getPath() {
  return window.location.hash.slice(1) || '/'
}

// Hash routes also work when the app is served by a static file host.
export function useRoute() {
  return useSyncExternalStore(subscribe, getPath, () => '/')
}

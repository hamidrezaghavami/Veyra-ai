import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface RouterContextType {
  path: string
  navigate: (to: string) => void
}

const RouterContext = createContext<RouterContextType>({
  path: '/',
  navigate: () => {},
})

export function RouterProvider({ children }: { children: React.ReactNode }) {
  // Read initial path, stripping trailing slash if not root
  const getCleanPath = () => {
    const p = window.location.pathname
    if (p.length > 1 && p.endsWith('/')) {
      return p.slice(0, -1)
    }
    return p || '/'
  }

  const [path, setPath] = useState<string>(getCleanPath)

  useEffect(() => {
    const handlePopState = () => {
      setPath(getCleanPath())
      window.scrollTo(0, 0)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((to: string) => {
    if (to === path) return
    window.history.pushState({}, '', to)
    setPath(new URL(to, window.location.origin).pathname)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [path])

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter() {
  return useContext(RouterContext)
}

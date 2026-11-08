import { useUser } from '@clerk/react'

// Same-origin API requests automatically include Clerk's signed session cookie.
export function useSession() {
  const { user, isLoaded } = useUser()
  return {
    data: user ? { user: { id: user.id, name: user.fullName || user.firstName || 'Your account', email: user.primaryEmailAddress?.emailAddress || '' } } : null,
    isPending: !isLoaded,
  }
}

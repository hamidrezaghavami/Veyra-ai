import { ClerkProvider } from '@clerk/react'
import type { ReactNode } from 'react'

export function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  if (!publishableKey) return <main className="relative z-10 mx-auto max-w-lg p-8 pt-24"><h1 className="text-2xl">Sign-in is temporarily unavailable</h1><p role="status" className="mt-4 text-neutral-300">Please try again shortly.</p></main>
  return <ClerkProvider
    publishableKey={publishableKey}
    signInUrl="/sign-in"
    signUpUrl="/sign-up"
    signInFallbackRedirectUrl="/account"
    signUpFallbackRedirectUrl="/account"
    afterSignOutUrl="/sign-in"
    appearance={{ variables: { colorPrimary: '#21d2ed', colorNeutral: '#ffffff', colorBackground: '#111827', colorForeground: '#ffffff', colorMutedForeground: '#b0b0b0', colorInput: '#101726', colorInputForeground: '#ffffff', borderRadius: '0.75rem' } }}
  >{children}</ClerkProvider>
}

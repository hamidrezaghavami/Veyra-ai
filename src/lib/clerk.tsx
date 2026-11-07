import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  ClerkProvider,
  SignIn as ClerkSignIn,
  SignUp as ClerkSignUp,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
  useClerk,
} from '@clerk/clerk-react'
import { dark } from '@clerk/themes'

// Detect publishable key from Vite environment or localStorage override
export function getClerkPublishableKey(): string {
  const envKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim()
  if (envKey && envKey.startsWith('pk_')) return envKey

  const localKey = (localStorage.getItem('veyra_clerk_pubkey') || '').trim()
  if (localKey && localKey.startsWith('pk_')) return localKey

  return ''
}

export function setClerkPublishableKey(key: string) {
  if (key && key.startsWith('pk_')) {
    localStorage.setItem('veyra_clerk_pubkey', key.trim())
  } else {
    localStorage.removeItem('veyra_clerk_pubkey')
  }
}

// Clerk Appearance Token Configuration matching Veyra Verity Design System
export const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: '#21d2ed',
    colorBackground: '#111113',
    colorInputBackground: '#141416',
    colorInputText: '#ffffff',
    colorText: '#ffffff',
    colorTextSecondary: '#b0b0b0',
    borderRadius: '14px',
    fontFamily: 'Onest, sans-serif',
  },
  elements: {
    card: 'border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl bg-[#111113]/95 rounded-2xl',
    headerTitle: 'text-white font-medium tracking-tight text-xl',
    headerSubtitle: 'text-[#b0b0b0] text-[13.5px]',
    socialButtonsBlockButton: 'bg-[#141416] border border-white/10 hover:border-white/20 text-white transition-all',
    formButtonPrimary: 'bg-[#21d2ed] hover:bg-[#1bc1da] text-black font-semibold transition-all shadow-[0_0_20px_rgba(33,210,237,0.3)]',
    footerActionLink: 'text-[#21d2ed] hover:underline font-medium',
    formFieldInput: 'bg-[#141416] border border-white/10 text-white focus:border-[#21d2ed]',
    dividerLine: 'bg-white/10',
    dividerText: 'text-[#707070]',
  },
}

interface ClerkAuthContextType {
  isConfigured: boolean
  publishableKey: string
  saveKey: (key: string) => void
}

const ClerkAuthContext = createContext<ClerkAuthContextType>({
  isConfigured: false,
  publishableKey: '',
  saveKey: () => {},
})

export function useClerkConfig() {
  return useContext(ClerkAuthContext)
}

export function VeyraClerkProvider({ children }: { children: React.ReactNode }) {
  const [pubKey, setPubKey] = useState<string>(getClerkPublishableKey())

  const isConfigured = Boolean(pubKey && pubKey.startsWith('pk_'))

  const saveKey = (key: string) => {
    setClerkPublishableKey(key)
    setPubKey(key.trim())
  }

  const contextValue: ClerkAuthContextType = {
    isConfigured,
    publishableKey: pubKey,
    saveKey,
  }

  if (isConfigured) {
    return (
      <ClerkAuthContext.Provider value={contextValue}>
        <ClerkProvider publishableKey={pubKey} appearance={clerkAppearance}>
          {children}
        </ClerkProvider>
      </ClerkAuthContext.Provider>
    )
  }

  return (
    <ClerkAuthContext.Provider value={contextValue}>
      {children}
    </ClerkAuthContext.Provider>
  )
}

export { ClerkSignIn, ClerkSignUp, SignedIn, SignedOut, UserButton, useUser, useClerk }

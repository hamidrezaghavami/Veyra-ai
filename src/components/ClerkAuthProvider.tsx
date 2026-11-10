import { useLanguage } from '../context/LanguageContext'
import { trTR } from '@clerk/localizations/tr-TR'
import { enUS } from '@clerk/localizations/en-US'
import { ClerkProvider } from '@clerk/react'
import type { ReactNode } from 'react'

export function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const { t, language } = useLanguage()

  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  if (!publishableKey) return <main className="relative z-10 mx-auto max-w-lg p-8 pt-24"><h1 className="text-2xl">{t("Sign-in is temporarily unavailable")}</h1><p role="status" className="mt-4 text-neutral-300">{t("Please try again shortly.")}</p></main>
  return <ClerkProvider
    localization={language === 'tr' ? trTR : enUS}
    publishableKey={publishableKey}
    signInUrl="/sign-in"
    signUpUrl="/sign-up"
    signInFallbackRedirectUrl="/account"
    signUpFallbackRedirectUrl="/account"
    afterSignOutUrl="/sign-in"
    appearance={{ options: { unsafe_disableDevelopmentModeWarnings: true }, elements: { footer: { display: 'none' }, userButtonPopoverFooter: { display: 'none' } }, variables: { colorPrimary: '#21d2ed', colorNeutral: '#ffffff', colorBackground: '#111827', colorForeground: '#ffffff', colorMutedForeground: '#b0b0b0', colorInput: '#101726', colorInputForeground: '#ffffff', borderRadius: '0.75rem' } }}
  >{children}</ClerkProvider>
}

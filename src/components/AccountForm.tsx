import { useLanguage } from '../context/LanguageContext'
import { SignIn, SignUp } from '@clerk/react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function AccountForm({ signup = false }: { signup?: boolean }) {
  const { t } = useLanguage()

  return <div className="min-h-screen text-white flex flex-col"><Navbar />
    <main className="relative z-10 flex-1 w-full max-w-lg mx-auto px-4 pt-36 pb-24">
      <h1 className="text-3xl mb-3">{signup ? t('Create your Veyra account') : t('Sign in to Veyra AI')}</h1>
      <p className="text-neutral-400 mb-8">{t("Use your connected account or email. Clerk securely handles sign-in and password recovery.")}</p>
      <p className="text-sm text-neutral-400 mb-6">{t("Used Veyra before? Create an account with the same email address to reconnect to your saved invoices after verifying your email.")}</p>
      <div className="flex justify-center">
        {signup
          ? <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/account" />
          : <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/account" />}
      </div>
      <p className="mt-5 text-center text-sm"><a className="text-cyan-300 hover:underline" href={signup ? '/sign-in' : '/sign-up'}>{signup ? t('Sign In') : t('Create your Veyra account')}</a></p>
    </main><Footer /></div>
}

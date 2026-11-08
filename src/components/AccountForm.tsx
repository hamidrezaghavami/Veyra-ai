import { SignIn, SignUp } from '@clerk/react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function AccountForm({ signup = false }: { signup?: boolean }) {
  return <div className="min-h-screen text-white flex flex-col"><Navbar />
    <main className="relative z-10 flex-1 w-full max-w-lg mx-auto px-4 pt-36 pb-24">
      <h1 className="text-3xl mb-3">{signup ? 'Create your Veyra account' : 'Sign in to Veyra AI'}</h1>
      <p className="text-neutral-400 mb-8">Use your connected account or email. Clerk securely handles sign-in and password recovery.</p>
      <div className="flex justify-center">
        {signup
          ? <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/account" />
          : <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/account" />}
      </div>
    </main><Footer /></div>
}

import { useState } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { LiquidButton } from './LiquidButton'
import { authClient } from '../services/authService'
import { useRouter } from '../context/RouterContext'

export function AccountForm({ signup = false }: { signup?: boolean }) {
  const { navigate } = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending) return
    const data = new FormData(event.currentTarget)
    setPending(true); setError('')
    try {
      const credentials = { email: String(data.get('email')), password: String(data.get('password')) }
      const result = signup
        ? await authClient.signUp.email({ ...credentials, name: String(data.get('name')) })
        : await authClient.signIn.email(credentials)
      if (result.error) throw new Error(result.error.message || 'Unable to sign in. Check your details and try again.')
      navigate('/account')
    } catch (e) { setError(e instanceof Error ? e.message : 'Account service unavailable. Please try again.') }
    finally { setPending(false) }
  }
  return <div className="min-h-screen text-white flex flex-col"><Navbar />
    <main className="relative z-10 flex-1 w-full max-w-md mx-auto px-4 pt-36 pb-24">
      <h1 className="text-3xl mb-3">{signup ? 'Create your Veyra account' : 'Sign in to Veyra AI'}</h1>
      <p className="text-neutral-400 mb-8">{signup ? 'Your invoices and audit history stay in your account.' : 'Access your invoices, reviews, and spending.'}</p>
      <form onSubmit={submit} className="surface-card p-6 space-y-5" aria-busy={pending}>
        {signup && <div><label htmlFor="account-name">Full name</label><input className="form-input" id="account-name" name="name" autoComplete="name" required maxLength={200} /></div>}
        <div><label htmlFor="account-email">Email address</label><input className="form-input" id="account-email" name="email" type="email" autoComplete="email" spellCheck={false} required maxLength={254} /></div>
        <div><label htmlFor="account-password">Password</label><input className="form-input" id="account-password" name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 12 : 1} maxLength={128} required />{signup && <p className="text-xs text-neutral-400 mt-2">Use at least 12 characters.</p>}</div>
        {!signup && <div className="flex justify-end"><a href="/contact?subject=Account%20recovery" className="text-sm text-cyan-300 underline underline-offset-4 hover:text-cyan-100">Forgot password?</a></div>}
        {error && <p role="alert" className="text-rose-300">{error}</p>}
        <LiquidButton type="submit" disabled={pending} className="w-full">{pending ? 'Please wait…' : signup ? 'Create Account' : 'Sign In'}</LiquidButton>
        <p className="text-sm text-neutral-400">{signup ? 'Already have an account? ' : 'New to Veyra? '}<a className="text-cyan-300 underline" href={signup ? '/sign-in' : '/sign-up'}>{signup ? 'Sign in' : 'Create an account'}</a></p>
      </form>
    </main><Footer /></div>
}

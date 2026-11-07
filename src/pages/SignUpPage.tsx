import { useState } from 'react'
import { ArrowRight, Key, Sparkles, ShieldCheck, User, Mail, Lock } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { LiquidButton } from '../components/LiquidButton'
import { useRouter } from '../context/RouterContext'
import { useClerkConfig, ClerkSignUp } from '../lib/clerk'
import { authService } from '../services/authService'

export function SignUpPage() {
  const { navigate } = useRouter()
  const { isConfigured, saveKey } = useClerkConfig()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [clerkKey, setClerkKey] = useState('')
  const [showClerkInput, setShowClerkInput] = useState(false)

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return

    // Create session with the user's real name and email
    authService.createUserSession(email, fullName)
    navigate('/account')
  }

  const handleConnectClerk = (e: React.FormEvent) => {
    e.preventDefault()
    if (clerkKey.trim().startsWith('pk_')) {
      saveKey(clerkKey.trim())
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-between relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-32 pb-24 px-4 sm:px-6 relative z-10">
        <div className="max-w-md w-full mx-auto">
          {isConfigured ? (
            <div className="flex flex-col items-center justify-center">
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#21d2ed]/10 text-[#21d2ed] border border-[#21d2ed]/25 mb-3">
                  <ShieldCheck className="size-3.5" />
                  Secured by Clerk Authentication
                </span>
                <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
                  Create Your Account
                </h1>
                <p className="text-[13px] text-[#b0b0b0] mt-1">
                  Sign up with Google, GitHub, or email to access your enterprise dashboard.
                </p>
              </div>

              <div className="w-full flex justify-center">
                <ClerkSignUp
                  routing="path"
                  path="/sign-up"
                  signInUrl="/sign-in"
                  fallbackRedirectUrl="/account"
                />
              </div>

              <button
                onClick={() => saveKey('')}
                className="mt-6 text-[12px] text-neutral-500 hover:text-neutral-300 underline"
              >
                Change or disconnect Clerk key
              </button>
            </div>
          ) : (
            <div>
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#21d2ed]/10 text-[#21d2ed] border border-[#21d2ed]/25 mb-3">
                  <Sparkles className="size-3.5" />
                  Instant Account Onboarding
                </span>
                <h1 className="text-3xl font-medium tracking-tight text-white mb-2">
                  Create Your Veyra Account
                </h1>
                <p className="text-[14px] text-[#b0b0b0]">
                  Get immediate access to automated invoice OCR, 4-layer anomaly checks, and your personal audit dashboard.
                </p>
              </div>

              <div className="surface-card p-6 sm:p-8 border border-white/15 shadow-2xl mb-4">
                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div>
                    <label className="block text-[13px] text-[#b0b0b0] mb-1.5 font-medium">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 size-4 text-[#707070]" />
                      <input
                        type="text"
                        required
                        autoFocus
                        placeholder="e.g. Hamid Reza Ghavami"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-[#141824]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#21d2ed]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] text-[#b0b0b0] mb-1.5 font-medium">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 size-4 text-[#707070]" />
                      <input
                        type="email"
                        required
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#141824]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#21d2ed]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] text-[#b0b0b0] mb-1.5 font-medium">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 size-4 text-[#707070]" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#141824]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#21d2ed]"
                      />
                    </div>
                  </div>

                  <LiquidButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-2"
                    icon={<ArrowRight className="size-4" />}
                  >
                    Create Account & Open Dashboard
                  </LiquidButton>
                </form>

                <div className="mt-6 pt-4 border-t border-white/5 text-center text-[13px] text-neutral-400">
                  Already have an account?{' '}
                  <a
                    href="/sign-in"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate('/sign-in')
                    }}
                    className="text-white hover:text-[#21d2ed] transition-colors"
                  >
                    Sign in here
                  </a>
                </div>
              </div>

              {/* Clerk Integration Toggle */}
              <div className="surface-card p-4 border border-white/10 bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => setShowClerkInput(!showClerkInput)}
                  className="w-full flex items-center justify-between text-[13px] text-neutral-300 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Key className="size-3.5 text-[#21d2ed]" />
                    <span>Have a Clerk Publishable Key?</span>
                  </span>
                  <span className="text-[11px] text-[#21d2ed] underline">
                    {showClerkInput ? 'Hide' : 'Connect Clerk'}
                  </span>
                </button>

                {showClerkInput && (
                  <form onSubmit={handleConnectClerk} className="mt-3 pt-3 border-t border-white/5 space-y-2">
                    <input
                      type="text"
                      placeholder="pk_test_..."
                      value={clerkKey}
                      onChange={(e) => setClerkKey(e.target.value)}
                      className="w-full bg-[#141824]/80 border border-white/10 rounded-xl px-3 py-2 text-[12.5px] text-white focus:outline-none focus:border-[#21d2ed]"
                    />
                    <LiquidButton
                      type="submit"
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      disabled={!clerkKey.trim().startsWith('pk_')}
                    >
                      Activate Clerk
                    </LiquidButton>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

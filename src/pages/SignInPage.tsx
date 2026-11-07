import { useState } from 'react'
import { ArrowRight, Key, Sparkles, ShieldCheck } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { LiquidButton } from '../components/LiquidButton'
import { useRouter } from '../context/RouterContext'
import { useClerkConfig, ClerkSignIn } from '../lib/clerk'
import { authService } from '../services/authService'

export function SignInPage() {
  const { navigate } = useRouter()
  const { isConfigured, saveKey } = useClerkConfig()
  const [inputKey, setInputKey] = useState('')
  const [demoEmail, setDemoEmail] = useState('demo.auditor@veyra.ai')

  const handleConnectClerk = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputKey.trim().startsWith('pk_')) {
      saveKey(inputKey.trim())
    }
  }

  const handleInstantDemo = (e: React.FormEvent) => {
    e.preventDefault()
    authService.verifyOtp(demoEmail, '123456')
    navigate('/account')
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
                  Welcome to Veyra AI
                </h1>
              </div>

              <div className="w-full flex justify-center">
                <ClerkSignIn
                  routing="path"
                  path="/sign-in"
                  signUpUrl="/sign-up"
                  fallbackRedirectUrl="/account"
                />
              </div>

              <button
                onClick={() => saveKey('')}
                className="mt-6 text-[12px] text-neutral-500 hover:text-neutral-300 underline"
              >
                Switch or change Clerk key
              </button>
            </div>
          ) : (
            <div>
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#21d2ed]/10 text-[#21d2ed] border border-[#21d2ed]/25 mb-3">
                  <Sparkles className="size-3.5" />
                  Clerk Authentication Integration
                </span>
                <h1 className="text-3xl font-medium tracking-tight text-white mb-2">
                  Sign In to Veyra AI
                </h1>
                <p className="text-[14px] text-[#b0b0b0]">
                  Authenticate with your Clerk account to manage audits and access your enterprise dashboard.
                </p>
              </div>

              <div className="surface-card p-6 sm:p-8 border border-white/15 shadow-2xl mb-6">
                <h2 className="text-[15px] font-medium text-white mb-2 flex items-center gap-2">
                  <Key className="size-4 text-[#21d2ed]" />
                  Connect Your Clerk Free Tier
                </h2>
                <p className="text-[13px] text-[#909090] mb-4">
                  Paste your Clerk Publishable Key (`pk_test_...` or `pk_live_...`) to activate Clerk with Google, GitHub, and email sign-in:
                </p>

                <form onSubmit={handleConnectClerk} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="pk_test_..."
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      className="w-full bg-[#141824]/80 border border-white/10 rounded-xl px-4 py-2.5 text-[13.5px] text-white focus:outline-none focus:border-[#21d2ed]"
                    />
                  </div>

                  <LiquidButton
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                    disabled={!inputKey.trim().startsWith('pk_')}
                    icon={<ArrowRight className="size-4" />}
                  >
                    Activate Clerk Sign In
                  </LiquidButton>
                </form>

                <div className="mt-4 pt-4 border-t border-white/5 text-center text-[12px] text-neutral-400">
                  Don't have a key yet?{' '}
                  <a
                    href="https://dashboard.clerk.com/sign-up"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#21d2ed] hover:underline"
                  >
                    Get a free Clerk key at clerk.com →
                  </a>
                </div>
              </div>

              {/* Instant Access Option */}
              <div className="surface-card p-5 border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] text-white font-medium">Quick Preview Access</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-white/10 text-neutral-300">No key required</span>
                </div>
                <form onSubmit={handleInstantDemo} className="flex gap-2">
                  <input
                    type="email"
                    value={demoEmail}
                    onChange={(e) => setDemoEmail(e.target.value)}
                    className="flex-1 bg-[#141824]/80 border border-white/10 rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#21d2ed]"
                  />
                  <LiquidButton type="submit" variant="secondary" size="sm">
                    Enter Dashboard
                  </LiquidButton>
                </form>
              </div>

              <div className="mt-6 text-center text-[13px] text-neutral-400">
                Need an account?{' '}
                <a
                  href="/sign-up"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/sign-up')
                  }}
                  className="text-white hover:text-[#21d2ed] transition-colors"
                >
                  Create one now
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

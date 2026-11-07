import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { LiquidButton } from '../components/LiquidButton'
import { authService } from '../services/authService'
import { useRouter } from '../context/RouterContext'

export function SignUpPage() {
  const { navigate } = useRouter()
  const [email, setEmail] = useState('')

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return

    const res = authService.requestOtp(email)
    if (res.success) {
      navigate('/otp')
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-between relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-32 pb-24 px-4 sm:px-6 relative z-10">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-white mb-2">
              Sign Up
            </h1>
            <p className="text-[14px] text-[#b0b0b0]">
              Enter your email and we’ll send you a secure sign-up code.
            </p>
          </div>

          <div className="surface-card p-6 sm:p-8 border border-white/15 shadow-2xl">
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-[13px] text-[#b0b0b0] mb-2 font-medium">
                  Work email
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#141824]/80 border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#21d2ed]"
                />
              </div>

              <LiquidButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                icon={<ArrowRight className="size-4" />}
              >
                Create account
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
                Sign in
              </a>
            </div>
          </div>

          <div className="mt-6 text-center text-[12px] text-neutral-500">
            Powered by FrameAuth
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

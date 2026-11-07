import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { ShaderBackground } from '../components/ShaderBackground'
import { LiquidButton } from '../components/LiquidButton'
import { waitlistService } from '../services/waitlistService'
import { useRouter } from '../context/RouterContext'

export function WaitlistPage() {
  const { navigate } = useRouter()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [position, setPosition] = useState<number>(0)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return

    if (pending) return
    setPending(true); setError('')
    try { const res = await waitlistService.join(email); setPosition(res.position); setSubmitted(true) }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not join the waitlist. Please try again.') }
    finally { setPending(false) }
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-between relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-32 pb-24 px-4 sm:px-6 relative z-10">
        <div className="max-w-xl w-full mx-auto text-center">
          {/* Eyebrow */}
          <div className="eyebrow-tag mb-4 justify-center">
            <span>Early access</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-medium tracking-[-0.04em] text-white leading-[1.05] mb-5">
            Bring clarity to your <br />
            invoice workflow.
          </h1>

          <p className="text-[16px] text-[#b0b0b0] leading-[1.5] max-w-md mx-auto mb-8 font-normal">
            Join the Veyra AI waitlist for updates on AI-powered invoice auditing and expense management.
          </p>

          {/* Form or Confirmation Card */}
          <div className="surface-card p-6 sm:p-8 relative overflow-hidden border border-white/15 text-left shadow-2xl">
            <ShaderBackground variant="Small1" className="absolute inset-0 size-full -z-10 opacity-30" />

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4" aria-busy={pending}>
                {error && <p role="alert" className="text-rose-300">{error}</p>}
                <div>
                  <label htmlFor="work-email" className="block text-[13px] text-[#b0b0b0] mb-2 font-medium">
                    Work email*
                  </label>
                  <input
                    id="work-email" name="email" autoComplete="email" spellCheck={false} maxLength={254}
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#141824]/80 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white placeholder-neutral-500 focus:outline-none focus:border-[#21d2ed]"
                  />
                </div>

                <LiquidButton
                  type="submit" disabled={pending}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  icon={<ArrowRight className="size-4" />}
                >
                  {pending ? 'Joining…' : 'Join the Waitlist'}
                </LiquidButton>

                <p className="text-[12px] text-neutral-400 text-center pt-2">
                  By joining, you agree to our{' '}
                  <a href="/legal/terms-of-service" onClick={(e) => { e.preventDefault(); navigate('/legal/terms-of-service') }} className="text-[#b0b0b0] underline hover:text-white">Terms</a>
                  {' '}and{' '}
                  <a href="/legal/privacy-policy" onClick={(e) => { e.preventDefault(); navigate('/legal/privacy-policy') }} className="text-[#b0b0b0] underline hover:text-white">Privacy Policy</a>.
                </p>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="size-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="size-6" />
                </div>
                <h3 className="text-xl font-medium text-white">
                  You’re on the waitlist!
                </h3>
                <p className="text-[14px] text-[#b0b0b0]">
                  Your registration number is <span className="text-[#21d2ed] font-mono font-medium">#{position}</span>. Updates will be associated with <span className="text-white">{email}</span>.
                </p>
                <div className="pt-3">
                  <LiquidButton
                    variant="secondary"
                    size="md"
                    onClick={() => navigate('/account')}
                  >
                    Open Your Account →
                  </LiquidButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

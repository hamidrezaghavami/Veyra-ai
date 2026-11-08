import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { LiquidButton } from '../components/LiquidButton'
import { contactService } from '../services/contactService'
import { useRouter } from '../context/RouterContext'

export function ContactPage() {
  const { navigate } = useRouter()
  const accountRecovery = new URLSearchParams(window.location.search).get('subject') === 'Account recovery'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    subject: accountRecovery ? 'Account recovery' : '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.firstName || !formData.message) return

    if (pending) return
    setPending(true); setError('')
    try { await contactService.submit(formData); setSubmitted(true) }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not send your message. Please try again.') }
    finally { setPending(false) }
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-between relative overflow-hidden">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 max-w-2xl mx-auto w-full relative z-10">
        <div className="text-center mb-10">
          <div className="eyebrow-tag mb-3 justify-center">
            <span>Contact</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-medium tracking-[-0.04em] text-white leading-[1.05] mb-4">
            {accountRecovery ? 'Recover your account.' : 'Contact Veyra AI.'}
          </h1>
          <p className="text-[16px] text-[#b0b0b0]">
            {accountRecovery ? 'Enter your account email and describe the access issue. Never include your password in this message.' : "Have a question or need help? We'll get back to you shortly."}
          </p>
        </div>

        <div className="surface-card p-6 sm:p-8 border border-white/15 shadow-2xl">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4" aria-busy={pending}>
              {error && <p role="alert" className="text-rose-300">{error}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-firstName" className="block text-[13px] text-[#b0b0b0] mb-1.5">First name*</label>
                  <input id="contact-firstName" name="firstName" autoComplete="given-name" maxLength={100}
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-[#141824]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#21d2ed]"
                  />
                </div>
                <div>
                  <label htmlFor="contact-lastName" className="block text-[13px] text-[#b0b0b0] mb-1.5">Last name*</label>
                  <input id="contact-lastName" name="lastName" autoComplete="family-name" maxLength={100}
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-[#141824]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#21d2ed]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-email" className="block text-[13px] text-[#b0b0b0] mb-1.5">Email*</label>
                  <input id="contact-email" name="email" autoComplete="email" spellCheck={false} maxLength={254}
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#141824]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#21d2ed]"
                  />
                </div>
                <div>
                  <label htmlFor="contact-company" className="block text-[13px] text-[#b0b0b0] mb-1.5">Company</label>
                  <input id="contact-company" name="company" autoComplete="organization" maxLength={200}
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-[#141824]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#21d2ed]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-[13px] text-[#b0b0b0] mb-1.5">Subject*</label>
                <input id="contact-subject" name="subject" maxLength={200}
                  type="text"
                  required
                  placeholder="e.g. Enterprise pilot inquiry or API questions"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-[#141824]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#21d2ed]"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-[13px] text-[#b0b0b0] mb-1.5">Your message*</label>
                <textarea id="contact-message" name="message" maxLength={5000}
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#141824]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#21d2ed] resize-none"
                />
              </div>

              <LiquidButton
                type="submit" disabled={pending}
                variant="primary"
                size="lg"
                className="w-full"
                icon={<ArrowRight className="size-4" />}
              >
                {pending ? 'Sending…' : 'Send Message'}
              </LiquidButton>

              <p className="text-[12px] text-neutral-400 text-center pt-2">
                By submitting, you agree to our{' '}
                <a href="/legal/terms-of-service" onClick={(e) => { e.preventDefault(); navigate('/legal/terms-of-service') }} className="text-[#b0b0b0] underline hover:text-white">Terms of Service</a>
                {' '}and{' '}
                <a href="/legal/privacy-policy" onClick={(e) => { e.preventDefault(); navigate('/legal/privacy-policy') }} className="text-[#b0b0b0] underline hover:text-white">Privacy Policy</a>.
              </p>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="size-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="text-xl font-medium text-white">Message saved!</h3>
              <p className="text-[14px] text-[#b0b0b0]">
                Thank you, {formData.firstName}. Our team will review your inquiry and follow up at <span className="text-white">{formData.email}</span> within 24 hours.
              </p>
              <div className="pt-4">
                <LiquidButton
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/')}
                >
                  Return to Home
                </LiquidButton>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

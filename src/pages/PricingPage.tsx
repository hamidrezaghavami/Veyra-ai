import { CalendarDays, CalendarRange } from 'lucide-react'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'

const plans = [
  { name: 'Monthly', period: 'Pay month to month.', icon: CalendarDays },
  { name: 'Annual', period: 'Pay once a year.', icon: CalendarRange },
] as const

export function PricingPage() {
  const { t } = useLanguage()

  return <div className="relative z-10 flex min-h-screen flex-col">
    <Navbar />
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-20 pt-32 sm:px-6 sm:pt-40">
      <header className="mb-10 text-center">
        <h1 className="mb-4 text-4xl sm:text-5xl">{t('Pricing')}</h1>
        <p className="mx-auto max-w-lg text-neutral-300">{t('Both options include invoice extraction, review, and spending insights. Paid plans are coming soon.')}</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map(({ name, period, icon: Icon }) => <article key={name} className="surface-card flex flex-col gap-4 p-6 sm:p-8">
          <Icon className="text-cyan-300" size={24} strokeWidth={1.5} aria-hidden="true" />
          <h2 className="text-2xl">{t(name)}</h2>
          <p className="text-neutral-300">{t(period)}</p>
          <p className="mt-2 border-t border-white/10 pt-4 text-sm text-cyan-300">{t('Pricing to be announced')}</p>
        </article>)}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href="/waitlist" className="action-button">{t('Join the Waitlist')}</a>
        <a href="/sign-up" className="action-button">{t('Create Account')}</a>
      </div>
    </main>
    <Footer />
  </div>
}

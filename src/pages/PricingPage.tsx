import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'

const intervals = ['Monthly', 'Annual'] as const
const features = ['AI invoice extraction', 'Invoice review and audit history', 'Spending insights', 'AI invoice assistant']

export function PricingPage() {
  const { t } = useLanguage()
  const [interval, setInterval] = useState<(typeof intervals)[number]>('Monthly')

  return <div className="relative z-10 flex min-h-screen flex-col">
    <Navbar />
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20 pt-28 sm:px-6 sm:pt-36">
      <section className="rounded-3xl border border-white/10 bg-[radial-gradient(ellipse_at_top_right,#253e32_0%,#151e19_42%,#0d110f_82%)] px-4 pb-6 pt-12 sm:px-10 sm:pb-10 sm:pt-16">
        <header className="mb-10 text-center">
          <h1 className="mb-4 text-4xl sm:text-5xl">{t('Pricing')}</h1>
          <p className="mx-auto max-w-md text-neutral-300">{t('Choose monthly or annual billing. Paid plans are coming soon.')}</p>
          <fieldset className="mx-auto mt-6 inline-flex rounded-full border border-white/20 bg-black/25 p-1">
            <legend className="sr-only">{t('Billing period')}</legend>
            {intervals.map(option => <label key={option} className="cursor-pointer">
              <input type="radio" name="billing-period" value={option} checked={interval === option} onChange={() => setInterval(option)} className="peer sr-only" />
              <span className="block rounded-full px-5 py-2 text-sm font-medium text-neutral-300 peer-checked:bg-cyan-400 peer-checked:text-[#14251b] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan-300">{t(option)}</span>
            </label>)}
          </fieldset>
        </header>
        <article className="surface-card mx-auto grid max-w-3xl gap-7 p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <h2 className="text-2xl">Veyra ai</h2>
            <div aria-live="polite" className="mt-4">
              <p className="text-lg font-medium text-cyan-300">{t('Pricing to be announced')}</p>
              <p className="mt-1 text-sm text-neutral-300">{t(interval === 'Monthly' ? 'Billed monthly' : 'Billed annually')}</p>
            </div>
            <a href="/waitlist" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-3 text-sm font-semibold text-[#14251b] hover:bg-cyan-300">
              {t('Join the Waitlist')}<ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="border-t border-white/10 pt-6 sm:border-l sm:border-t-0 sm:pl-7 sm:pt-0">
            <h3 className="mb-4 text-base">{t('Features included')}</h3>
            <ul className="grid gap-3 text-sm text-neutral-300">
              {features.map(feature => <li key={feature} className="flex items-center gap-3"><Check size={16} className="shrink-0 text-cyan-300" aria-hidden="true" />{t(feature)}</li>)}
            </ul>
          </div>
        </article>
        <p className="mt-6 text-center text-sm text-neutral-300"><a href="/sign-up" className="underline underline-offset-4 hover:text-white">{t('Create Account')}</a></p>
      </section>
    </main>
    <Footer />
  </div>
}

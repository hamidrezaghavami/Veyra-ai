import { useLanguage } from '../context/LanguageContext'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { LiquidButton } from '../components/LiquidButton'
import { useRouter } from '../context/RouterContext'

export function ThanksPage() {
  const { t } = useLanguage()

  const { navigate } = useRouter()

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-between relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-32 pb-24 px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-lg mx-auto surface-card p-8 sm:p-12 border border-white/15 shadow-2xl">
          <div className="size-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="size-8" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-white mb-3">{t("Thank you!")}</h1>

          <p className="text-[15px] text-[#b0b0b0] leading-relaxed mb-8">{t("Your submission has been received. Our team will review your details and get back to you shortly.")}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <LiquidButton
              variant="primary"
              size="md"
              onClick={() => navigate('/')}
            >{t("Return to Home")}</LiquidButton>
            <LiquidButton
              variant="secondary"
              size="md"
              onClick={() => navigate('/account')}
              icon={<ArrowRight className="size-4" />}
            >{t("Explore Console")}</LiquidButton>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

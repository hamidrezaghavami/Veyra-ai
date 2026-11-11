import { useLanguage } from '../context/LanguageContext'
import { useState } from 'react'
import { ArrowRight, CheckCircle2, AlertTriangle, FileText, Sparkles, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from '../context/RouterContext'
import { LiquidButton } from './LiquidButton'

export function Hero() {
  const { t } = useLanguage()

  const { navigate } = useRouter()
  const [heroApproved, setHeroApproved] = useState(false)
  const [activeTab, setActiveTab] = useState<'invoice' | 'audit'>('invoice')

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="inline-flex items-center gap-2 text-[12px] font-medium text-cyan-300 mb-7">
          <ShieldCheck size={15} aria-hidden="true" />{t("Invoice and expense auditing with AI")}
        </p>

        {/* Main Headline (60px/1.05/-0.04em) */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="veyra-hero-title text-4xl sm:text-6xl md:text-[66px] font-medium tracking-[-0.04em] text-white leading-[1.05] max-w-4xl mx-auto"
        >{t("Your invoices, audited. ")}<br className="hidden sm:block" />{t("Your expenses, clear.")}</motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-lg sm:text-[19px] text-[#b0b0b0] leading-[1.4] font-normal"
        >{t("Process invoices, track expenses, and spot financial errors with AI. Stay in control of every approval.")}</motion.p>

        {/* Liquid Glass Action Buttons with Framer Motion */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5"
        >
          <LiquidButton
            variant="primary"
            size="lg"
            onClick={() => navigate('/sign-up')}
            className="w-full sm:w-auto"
            icon={<ArrowRight className="size-4" />}
          >{t("Try Veyra AI Free")}</LiquidButton>

          <LiquidButton
            variant="secondary"
            size="lg"
            onClick={() => {
              const el = document.querySelector('#features')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
            className="w-full sm:w-auto"
          >{t("Learn more")}</LiquidButton>
        </motion.div>

        {/* Sub-hero Audience Proof */}
        <p className="mt-5 text-[13px] text-neutral-400 font-normal">{t("Built for freelancers, small businesses, and accounting teams")}</p>

        {/* Hero Interactive Showcase Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 max-w-3xl mx-auto surface-card p-2 sm:p-3 relative overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.7)] text-left"
        >
          {/* Invoice preview background */}
          <div className="relative h-44 sm:h-52 rounded-xl overflow-hidden mb-3 bg-[#101713]" id="invoice-preview">
            <img src="/images/invoice-preview-background.jpg" alt="" width={1600} height={533} className="absolute inset-0 size-full object-cover object-[62%_50%]" />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,12,9,.48),transparent_40%,rgba(7,12,9,.84))]" />
            <div className="absolute inset-0 p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-secondary border border-white/15">
                  <FileText className="size-3.5 text-[#9ee6c5]" />
                  <span className="text-[12px] font-mono text-white">{t("Example invoice · INV-2026-9812.pdf")}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium backdrop-blur-md">
                  <ShieldCheck className="size-3" />
                  <span>{t("Illustrative preview")}</span>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400">{t("Detected Vendor")}</div>
                  <div className="text-xl font-medium text-white tracking-tight">{t("Amazon Web Services (AWS)")}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400">{t("Total Amount")}</div>
                  <div className="text-2xl font-mono font-medium text-white">$5,217.65</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Inspection Tray */}
          <div className="surface-inset p-4 sm:p-5">
            {/* Nav Tabs */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('invoice')}
                  className={`text-[13px] px-3.5 py-1 rounded-full transition-colors cursor-pointer ${
                    activeTab === 'invoice'
                      ? 'liquid-glass-secondary text-white font-medium border-white/20'
                      : 'text-[#b0b0b0] hover:text-white'
                  }`}
                >{t("Extracted Breakdown")}</motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('audit')}
                  className={`text-[13px] px-3.5 py-1 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'audit'
                      ? 'liquid-glass-secondary text-white font-medium border-white/20'
                      : 'text-[#b0b0b0] hover:text-white'
                  }`}
                >
                  <span>{t("Validation Checks")}</span>
                  <span className="size-1.5 rounded-full bg-[#9ee6c5]" />
                </motion.button>
              </div>

              <div className="text-[12px] text-neutral-400">{t("Status:")}{' '}
                <span className={heroApproved ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                  {heroApproved ? t('Approved by Controller') : t('Ready for Review')}
                </span>
              </div>
            </div>

            {/* Tab Contents */}
            {activeTab === 'invoice' ? (
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between items-center py-1.5 border-b border-white/5 text-[#b0b0b0]">
                  <span>{t("EC2 Compute Elastic Nodes (c6i.4xlarge) x 4")}</span>
                  <span className="font-mono text-white">$2,880.00</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5 text-[#b0b0b0]">
                  <span>{t("S3 Standard Storage (52 TB Multi-AZ)")}</span>
                  <span className="font-mono text-white">$1,196.00</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5 text-[#b0b0b0]">
                  <span>{t("Sales Tax / VAT (8.25%)")}</span>
                  <span className="font-mono text-white">$397.65</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-[12px]">
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                  <span>{t("Duplicate Check: Zero identical vendor invoice numbers found in past 180 days.")}</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                  <span>{t("Math Validation: Stated total ($5,217.65) strictly matches sum of line items + tax.")}</span>
                </div>
              </div>
            )}

            {/* Decision Controls with Liquid Motion */}
            <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[12px] text-neutral-400">{t("You make the final call on every disbursement.")}</span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <LiquidButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setHeroApproved(false)}
                  className="w-1/2 sm:w-auto"
                >{t("Flag Issue")}</LiquidButton>
                <LiquidButton
                  variant={heroApproved ? 'accent' : 'primary'}
                  size="sm"
                  onClick={() => setHeroApproved(true)}
                  className="w-1/2 sm:w-auto"
                >
                  {heroApproved ? t('✓ Approved') : t('Approve Invoice')}
                </LiquidButton>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

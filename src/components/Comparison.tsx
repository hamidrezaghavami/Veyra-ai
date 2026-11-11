import { useLanguage } from '../context/LanguageContext'
import { X, Check } from 'lucide-react'
import { motion } from 'framer-motion'

export function Comparison() {
  const { t } = useLanguage()

  const manual = [
    'Documents scattered across folders',
    'Invoice details entered by hand',
    'Duplicate invoices easy to miss',
    'Totals and taxes checked manually',
    'Spending hidden in spreadsheets',
    'Approval decisions hard to trace',
  ]

  const veyra = [
    'Invoices and receipts in one place',
    'AI extracts essential invoice details',
    'Duplicate submissions flagged for review',
    'Totals and tax inconsistencies checked',
    'Spending organized by vendor and category',
    'A history of reviews and approvals',
  ]

  return (
    <section className="py-24 sm:py-32 relative border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-16"
        >
          <div className="eyebrow-tag mb-3">
            <span>{t("Why Veyra AI")}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-[-0.04em] text-white leading-[1.05]">{t("Less manual checking. ")}<br />{t("More informed decisions.")}</h2>
        </motion.div>

        {/* Comparison Grid with Slide-in Motions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Manual processes */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="surface-card p-6 sm:p-8 bg-[#11141e]/50 border-white/5"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm font-medium text-neutral-400">{t("Manual processes")}</span>
            </div>
            <ul className="space-y-4">
              {manual.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[14px] text-neutral-400">
                  <div className="size-5 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 mt-0.5 text-rose-400">
                    <X className="size-3" />
                  </div>
                  <span>{t(item)}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: With Veyra AI */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="surface-card p-6 sm:p-8 border-[#9ee6c5]/40 relative overflow-hidden shadow-[0_20px_50px_rgba(33,210,237,0.12)] bg-gradient-to-b from-[#141824] to-[#0e121a]"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm font-medium text-white flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#9ee6c5]" />{t("With Veyra AI")}</span>
            </div>
            <ul className="space-y-4">
              {veyra.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[14px] text-white">
                  <div className="size-5 rounded-full bg-[#9ee6c5]/20 border border-[#9ee6c5]/40 flex items-center justify-center shrink-0 mt-0.5 text-[#9ee6c5]">
                    <Check className="size-3" />
                  </div>
                  <span>{t(item)}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

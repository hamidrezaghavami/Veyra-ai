import { useLanguage } from '../context/LanguageContext'
import {
  FileText,
  AlertOctagon,
  FolderTree,
  ShieldCheck,
  History,
  Bot,
} from 'lucide-react'
import { motion } from 'framer-motion'

export function BuiltForTeams() {
  const { t } = useLanguage()

  const features = [
    {
      title: 'Reduce manual entry',
      desc: 'Extract key fields from invoices and receipts without retyping each document.',
      icon: FileText,
    },
    {
      title: 'Catch potential errors',
      desc: 'Flag duplicates, incorrect totals, and tax inconsistencies for your review.',
      icon: AlertOctagon,
    },
    {
      title: 'Organize your expenses',
      desc: 'Categorize transactions and track spending across vendors and categories.',
      icon: FolderTree,
    },
    {
      title: 'Control every approval',
      desc: 'Review findings, correct records, and approve or reject invoices yourself.',
      icon: ShieldCheck,
    },
    {
      title: 'Trace every decision',
      desc: 'Keep a history of processing, detected issues, corrections, and approvals.',
      icon: History,
    },
    {
      title: 'Ask your assistant',
      desc: 'Explore your spending with natural-language questions backed by your data.',
      icon: Bot,
    },
  ]

  return (
    <section className="py-24 sm:py-32 relative">
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
            <span>{t("Built for teams")}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-[-0.04em] text-white leading-[1.05]">{t("Everything you need to ")}<br />{t("review your finances.")}</h2>
        </motion.div>

        {/* 6 Feature Grid with Staggered Slide In */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="surface-card p-6 flex flex-col justify-between hover:border-[#21d2ed]/40 transition-all duration-300"
            >
              <div>
                <div className="size-10 rounded-xl bg-[#141824] border border-white/10 flex items-center justify-center text-[#21d2ed] mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                  <item.icon className="size-5" />
                </div>
                <h3 className="text-lg font-medium text-white tracking-[-0.02em] mb-2.5">
                  {t(item.title)}
                </h3>
                <p className="text-[14px] text-[#b0b0b0] leading-[1.5]">
                  {t(item.desc)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

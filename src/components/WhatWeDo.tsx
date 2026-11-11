import { useLanguage } from '../context/LanguageContext'
import { FileSearch, ShieldAlert, LineChart } from 'lucide-react'
import { motion } from 'framer-motion'
import { ShaderBackground } from './ShaderBackground'

export function WhatWeDo() {
  const { t } = useLanguage()

  const cards = [
    {
      title: 'Extract invoice details',
      desc: 'Upload a PDF or image. AI reads vendors, dates, line items, taxes, and totals, turning documents into structured records.',
      icon: FileSearch,
      shaderVariant: 'Small1' as const,
      preview: {
        badge: 'OCR Ingestion',
        meta: 'Vendor · Date · 12 Line Items · Tax %',
      },
    },
    {
      title: 'Flag financial errors',
      desc: 'Check for duplicate invoices, incorrect totals, missing information, and tax inconsistencies before approval.',
      icon: ShieldAlert,
      shaderVariant: 'Small2' as const,
      preview: {
        badge: 'Audit Checks',
        meta: 'Duplicate detection · Math verification · VAT rules',
      },
    },
    {
      title: 'Understand your spending',
      desc: 'Track expenses by vendor and category. Ask your AI assistant questions and get answers grounded in your records.',
      icon: LineChart,
      shaderVariant: 'Small3' as const,
      preview: {
        badge: 'Spend Intelligence',
        meta: 'Trends · Category allocations · Natural-language queries',
      },
    },
  ]

  return (
    <section id="features" className="py-24 sm:py-32 relative">
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
            <span>{t("What Veyra AI does")}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-[-0.04em] text-white leading-[1.05]">{t("Less invoice admin. ")}<br />{t("More financial clarity.")}</h2>
        </motion.div>

        {/* 3-Column Shader Cards Grid with Staggered Slide In */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ y: -5 }}
              className="surface-card p-2 sm:p-2.5 flex flex-col justify-between group hover:border-[#9ee6c5]/40 transition-all duration-300"
            >
              {/* Top Shader Preview with Visual Elements */}
              <div className="relative h-48 rounded-xl overflow-hidden mb-5">
                <ShaderBackground variant={card.shaderVariant} className="size-full" />
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="size-8 rounded-lg bg-[#080a0f]/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-[#9ee6c5]">
                      <card.icon className="size-4" />
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 text-neutral-300 border border-white/5">
                      {t(card.preview.badge)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#080a0f]/80 backdrop-blur-md border border-white/10 text-[11px] text-[#b0b0b0]">
                    {t(card.preview.meta)}
                  </div>
                </div>
              </div>

              {/* Text Description */}
              <div className="p-4 pt-1">
                <h3 className="text-xl font-medium text-white tracking-[-0.02em] mb-2 group-hover:text-[#9ee6c5] transition-colors">
                  {t(card.title)}
                </h3>
                <p className="text-[14px] text-[#b0b0b0] leading-[1.45]">
                  {t(card.desc)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

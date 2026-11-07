import { useState } from 'react'
import {
  FileText,
  ShieldAlert,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShaderBackground } from './ShaderBackground'
import { LiquidButton } from './LiquidButton'
import { useRouter } from '../context/RouterContext'

export function UseCases() {
  const { navigate } = useRouter()
  const [activeTab, setActiveTab] = useState<number>(0)

  const tabs = [
    {
      id: 'process',
      label: 'Process invoices',
      title: 'From messy receipt to structured record in seconds',
      description:
        'Upload invoices and receipts as PDFs or images. AI extracts the key details and turns each document into a structured financial record ready for validation.',
      shader: 'Large1' as const,
    },
    {
      id: 'audit',
      label: 'Audit financial records',
      title: 'Automated math verification and duplicate detection',
      description:
        'Review flags for duplicate submissions, incorrect totals, tax inconsistencies, and missing information. Understand the findings before making an approval decision.',
      shader: 'Large2' as const,
    },
    {
      id: 'track',
      label: 'Track your expenses',
      title: 'Real-time visibility across vendors and categories',
      description:
        'See monthly spending, compare trends, and explore expenses by vendor and category. Keep an organized view of where your money goes.',
      shader: 'Large3' as const,
    },
    {
      id: 'ask',
      label: 'Ask financial questions',
      title: 'Grounded answers derived straight from your ledgers',
      description:
        'Ask which invoices contain errors or why an expense category has increased. Your AI Financial Assistant analyzes your actual records to explain the answer.',
      shader: 'Large1' as const,
    },
  ]

  const current = tabs[activeTab]

  return (
    <section id="use-cases" className="py-24 sm:py-32 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-12"
        >
          <div className="eyebrow-tag mb-3">
            <span>Use cases</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-[-0.04em] text-white leading-[1.05]">
            One platform. <br />
            Every financial step.
          </h2>
        </motion.div>

        {/* Tab Buttons (Liquid Glass Container) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-8 border-b border-white/[0.06]">
          {tabs.map((tab, idx) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 rounded-full text-[13.5px] font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === idx
                  ? 'liquid-glass-primary shadow-lg'
                  : 'text-[#b0b0b0] hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Showcase Card with Slide Animation */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="surface-card p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Left Context Column */}
          <div className="lg:col-span-5 flex flex-col justify-between min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${activeTab}`}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <div className="text-[12px] uppercase tracking-wider text-[#21d2ed] font-medium mb-3">
                  0{activeTab + 1} · {current.label}
                </div>
                <h3 className="text-2xl sm:text-3xl font-medium text-white tracking-[-0.03em] leading-tight mb-4">
                  {current.title}
                </h3>
                <p className="text-[15px] text-[#b0b0b0] leading-[1.5] mb-8">
                  {current.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-4">
              <LiquidButton
                variant="primary"
                size="md"
                onClick={() => navigate('/account')}
                icon={<ArrowRight className="size-4" />}
              >
                Try this workflow
              </LiquidButton>
            </div>
          </div>

          {/* Right Interactive Visual Display with Sliding AnimatePresence */}
          <div className="lg:col-span-7">
            <div className="surface-inset p-3 sm:p-5 relative overflow-hidden rounded-xl border border-white/10 shadow-xl min-h-[340px] flex flex-col justify-center">
              <ShaderBackground variant={current.shader} className="absolute inset-0 size-full -z-10" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={`mockup-${activeTab}`}
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  {activeTab === 0 && (
                    <div className="space-y-3 bg-[#080a0f]/90 backdrop-blur-md p-4 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[12px]">
                        <span className="text-[#b0b0b0]">Uploaded Document</span>
                        <span className="text-emerald-400 font-mono">100% Extracted</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[12px]">
                        <div className="p-2.5 rounded-lg bg-white/5">
                          <span className="text-[#b0b0b0] block text-[10px] uppercase">Vendor</span>
                          <span className="text-white font-medium">Datadog APM</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/5">
                          <span className="text-[#b0b0b0] block text-[10px] uppercase">Invoice #</span>
                          <span className="text-white font-medium font-mono">SUB-8921-OCT</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/5">
                          <span className="text-[#b0b0b0] block text-[10px] uppercase">Subtotal</span>
                          <span className="text-white font-medium font-mono">$2,840.00</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/5">
                          <span className="text-[#b0b0b0] block text-[10px] uppercase">Total Due</span>
                          <span className="text-white font-medium font-mono">$3,074.30</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 1 && (
                    <div className="space-y-3 bg-[#080a0f]/90 backdrop-blur-md p-4 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[12px]">
                        <span className="text-white font-medium">Audit Rule Engine</span>
                        <span className="text-rose-400 font-mono">1 Anomaly Caught</span>
                      </div>
                      <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-[12px] text-rose-300">
                        <AlertTriangle className="size-4 shrink-0 text-rose-400 mt-0.5" />
                        <div>
                          <div className="font-medium text-rose-200">Duplicate Submission Detected</div>
                          <div className="text-[11px] text-rose-300/80">
                            Invoice #4828 from Northwind Freight ($6,280.00) matches an invoice paid on Oct 28.
                          </div>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-[12px] text-emerald-300">
                        <CheckCircle2 className="size-4 text-emerald-400" />
                        <span>Vendor tax ID & payment wiring instructions verified</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 2 && (
                    <div className="space-y-3 bg-[#080a0f]/90 backdrop-blur-md p-4 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[12px]">
                        <span className="text-white font-medium">Expense Analytics · Q4 2026</span>
                        <span className="text-[#21d2ed] font-mono">$42,910 Total Audited</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
                        <div className="p-2.5 rounded-lg bg-white/5">
                          <div className="text-neutral-400">Cloud & Infra</div>
                          <div className="text-white font-mono font-medium text-[13px]">$18,420</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/5">
                          <div className="text-neutral-400">Software / SaaS</div>
                          <div className="text-white font-mono font-medium text-[13px]">$14,290</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/5">
                          <div className="text-neutral-400">Logistics</div>
                          <div className="text-white font-mono font-medium text-[13px]">$10,200</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 pt-1">
                        <TrendingUp className="size-3.5 text-emerald-400" />
                        <span>Zero duplicate disbursements recorded this fiscal month.</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 3 && (
                    <div className="space-y-3 bg-[#080a0f]/90 backdrop-blur-md p-4 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2 text-[12px] text-[#21d2ed]">
                        <MessageSquare className="size-3.5" />
                        <span className="font-medium">AI Financial Assistant</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5 text-[12px] text-white">
                        "Which invoices have errors or need review this week?"
                      </div>
                      <div className="p-3 rounded-lg bg-[#141824] border border-white/5 text-[12px] text-[#b0b0b0] leading-relaxed">
                        <span className="text-white font-medium block mb-1">Veyra Assistant:</span>
                        Found 2 flagged invoices: Northwind Freight #4828 ($6,280 duplicate alert) and Apex Depot #10943 ($64 tax calculation mismatch).
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

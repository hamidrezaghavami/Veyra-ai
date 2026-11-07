import { UploadCloud, CheckCheck, UserCheck } from 'lucide-react'
import { motion } from 'framer-motion'

export function HowItWorks() {
  const steps = [
    {
      step: 'Step 1',
      title: 'Upload your documents',
      desc: 'Add invoices and receipts as PDFs or images. Keep your financial documents in one place.',
      icon: UploadCloud,
    },
    {
      step: 'Step 2',
      title: 'Check the findings',
      desc: 'AI extracts the details. Validation checks flag duplicates, missing fields, and calculation errors.',
      icon: CheckCheck,
    },
    {
      step: 'Step 3',
      title: 'Review and approve',
      desc: 'Review flagged issues, make corrections, and approve or reject each invoice. You make the final call.',
      icon: UserCheck,
    },
  ]

  return (
    <section id="how-it-works" className="py-24 sm:py-32 relative">
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
            <span>How it works</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-[-0.04em] text-white leading-[1.05]">
            From document to <br />
            reviewed record.
          </h2>
        </motion.div>

        {/* 3 Step Cards Grid with Staggered Slide In */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ y: -5 }}
              className="surface-card p-6 flex flex-col justify-between hover:border-[#21d2ed]/40 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[12px] font-mono uppercase tracking-widest text-[#21d2ed]">
                    {item.step}
                  </span>
                  <div className="size-9 rounded-xl bg-[#141824] border border-white/10 flex items-center justify-center text-[#21d2ed] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                    <item.icon className="size-4" />
                  </div>
                </div>

                <h3 className="text-xl font-medium text-white tracking-[-0.02em] mb-3">
                  {item.title}
                </h3>
                <p className="text-[14px] text-[#b0b0b0] leading-[1.45]">
                  {item.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
                <span>Phase 0{idx + 1}</span>
                <span className="font-mono text-[#21d2ed]">100% Traceable</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

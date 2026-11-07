import { Check, Sparkles, Tag, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { CtaBanner } from '../components/CtaBanner'
import { CHANGELOG_ITEMS } from '../data/changelogData'

export function ChangelogPage() {
  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-between relative overflow-hidden">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 max-w-4xl mx-auto w-full relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="eyebrow-tag mb-3">
            <span>Changelog</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-medium tracking-[-0.04em] text-white leading-[1.05] mb-4">
            What's new
          </h1>
          <p className="text-lg text-[#b0b0b0]">
            Product updates for Veyra AI’s invoice and expense workflows.
          </p>
        </div>

        {/* Timeline Entries */}
        <div className="space-y-12 mb-20 relative before:absolute before:inset-0 before:left-5 sm:before:left-7 before:w-px before:bg-white/[0.08]">
          {CHANGELOG_ITEMS.map((item) => (
            <div key={item.version} className="relative pl-12 sm:pl-16">
              {/* Timeline marker */}
              <div className="absolute left-3 sm:left-5 top-1 size-4 rounded-full bg-[#111113] border-2 border-[#21d2ed] -translate-x-1/2 shadow-[0_0_10px_rgba(33,210,237,0.5)]" />

              <motion.div
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="surface-card p-6 sm:p-8 hover:border-white/20 transition-all shadow-xl"
              >
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-[12px] font-mono font-semibold px-2.5 py-0.5 rounded-full liquid-glass-secondary text-[#21d2ed] border border-[#21d2ed]/40">
                    {item.version}
                  </span>
                  <span className="text-[13px] text-neutral-400">{item.date}</span>
                </div>

                <h2 className="text-2xl font-medium text-white tracking-[-0.02em] mb-3">
                  {item.title}
                </h2>

                <p className="text-[15px] text-[#b0b0b0] leading-relaxed mb-6">
                  {item.description}
                </p>

                <div className="space-y-2.5 pt-4 border-t border-white/5">
                  {item.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-[13px] text-neutral-300">
                      <span className="size-1.5 rounded-full bg-[#21d2ed] shrink-0 mt-2" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {item.quote && (
                  <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/5 text-[13px] text-[#b0b0b0] italic">
                    "{item.quote.text}"
                    <span className="block mt-1 font-normal not-italic text-white text-[12px]">
                      — {item.quote.author}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>
          ))}
        </div>

        <CtaBanner />
      </main>

      <Footer />
    </div>
  )
}

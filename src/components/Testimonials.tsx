import { useState, useRef, useEffect } from 'react'
import { motion, useAnimationControls, PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import { LiquidButton } from './LiquidButton'
import { useRouter } from '../context/RouterContext'

export function Testimonials() {
  const { navigate } = useRouter()
  const [isPaused, setIsPaused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const allReviews = [
    {
      quote: 'Veyra replaced 15 hours of weekly manual reporting and invoice reconciliation. It just runs now.',
      author: 'Aisha Kamara',
      role: 'Ops Lead at Corebit',
      tag: '15 hrs/wk saved',
    },
    {
      quote: 'Before Veyra, coordinating our expense verification took longer than the actual work. Not anymore.',
      author: 'Daniel Park',
      role: 'Founder at Aerix',
      tag: 'Zero duplicate disbursements',
    },
    {
      quote: "Veyra cut our team's workload in half. Invoice tasks that used to take hours now take minutes.",
      author: 'Sarah Mitchell',
      role: 'Product Lead at Lumen Labs',
      tag: '99.4% accuracy',
    },
    {
      quote: 'It feels like having an extra finance controller on call — without the overhead.',
      author: 'Emma Larsson',
      role: 'Head of Marketing at Driftwave',
      tag: 'Audit speed 10x',
    },
    {
      quote: 'I stopped dreading Monday mornings. Veyra handles the heavy lifting before I even sit down.',
      author: 'Tom Eriksson',
      role: 'Growth Lead at Corebit',
      tag: 'Instant sync',
    },
    {
      quote: 'We set up our entire invoice ingestion flow in an afternoon. Every receipt is pre-audited.',
      author: 'Priya Nair',
      role: 'People Ops at Aerix',
      tag: 'Same-day onboarding',
    },
    {
      quote: "I'm not technical at all, but I built four automated audit rules in my first week. No code, no help needed.",
      author: 'Marcus Webb',
      role: 'Operations Manager at Lumen Labs',
      tag: 'Self-serve rules',
    },
  ]

  // Double array for seamless infinite sliding
  const row1 = [...allReviews, ...allReviews]
  const row2 = [...allReviews.slice(3), ...allReviews.slice(0, 3), ...allReviews, ...allReviews]

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % allReviews.length)
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + allReviews.length) % allReviews.length)
  }

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="eyebrow-tag mb-3">
              <span>Customer stories</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-medium tracking-[-0.04em] text-white leading-[1.05]">
              Customer stories. <br />
              <span className="text-neutral-500 font-normal">[Coming soon].</span>
            </h2>
          </motion.div>

          {/* Carousel Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <LiquidButton
              variant="secondary"
              size="sm"
              onClick={() => navigate('/contact')}
            >
              Leave a review
            </LiquidButton>

            <div className="flex items-center gap-1.5 ml-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrev}
                className="size-9 rounded-full liquid-glass-secondary flex items-center justify-center text-white border-white/15 hover:border-white/30 transition-colors cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="size-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="size-9 rounded-full liquid-glass-secondary flex items-center justify-center text-white border-white/15 hover:border-white/30 transition-colors cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight className="size-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* INFINITE MOTION SLIDERS (Two Parallel Tracks with Pause-on-Hover) */}
      <div
        className="space-y-6 relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left & Right Gradient Fog Fade */}
        <div className="absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-[#080a0f] to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-[#080a0f] to-transparent z-20 pointer-events-none" />

        {/* TRACK 1: Slides to Left */}
        <div className="flex overflow-hidden">
          <motion.div
            animate={isPaused ? {} : { x: ['0%', '-50%'] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 45,
                ease: 'linear',
              },
            }}
            className="flex gap-6 shrink-0 pl-4"
          >
            {row1.map((item, idx) => (
              <motion.div
                key={`r1-${idx}`}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="w-[340px] sm:w-[400px] shrink-0 surface-card p-6 sm:p-7 flex flex-col justify-between hover:border-[#21d2ed]/40 transition-colors shadow-xl group select-none cursor-grab active:cursor-grabbing"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#21d2ed]/10 text-[#21d2ed] border border-[#21d2ed]/30">
                      {item.tag}
                    </span>
                    <Quote className="size-4 text-neutral-600 group-hover:text-[#21d2ed] transition-colors" />
                  </div>
                  <p className="text-[15px] sm:text-[16px] text-white leading-[1.5] mb-6 font-normal">
                    "{item.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-medium text-white">{item.author}</div>
                    <div className="text-[12px] text-neutral-400">{item.role}</div>
                  </div>
                  <div className="flex text-amber-400 text-xs gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* TRACK 2: Slides to Right */}
        <div className="flex overflow-hidden">
          <motion.div
            animate={isPaused ? {} : { x: ['-50%', '0%'] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 52,
                ease: 'linear',
              },
            }}
            className="flex gap-6 shrink-0 pl-4"
          >
            {row2.map((item, idx) => (
              <motion.div
                key={`r2-${idx}`}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="w-[340px] sm:w-[400px] shrink-0 surface-card p-6 sm:p-7 flex flex-col justify-between hover:border-[#21d2ed]/40 transition-colors shadow-xl group select-none cursor-grab active:cursor-grabbing"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                      {item.tag}
                    </span>
                    <Quote className="size-4 text-neutral-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <p className="text-[15px] sm:text-[16px] text-white leading-[1.5] mb-6 font-normal">
                    "{item.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-medium text-white">{item.author}</div>
                    <div className="text-[12px] text-neutral-400">{item.role}</div>
                  </div>
                  <div className="flex text-amber-400 text-xs gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { ShaderBackground } from '../components/ShaderBackground'
import { LiquidButton } from '../components/LiquidButton'
import { ArrowRight, Sparkles } from 'lucide-react'

export function DesignSystemPage() {
  const colors = [
    { name: 'Dark/Background', hex: '#080a0f', rgb: 'rgb(8, 10, 15)', usage: 'Deep obsidian page canvas' },
    { name: 'Dark/Surface 1', hex: '#111113', rgb: 'rgb(17, 17, 19)', usage: 'Cards & main panels (16px radius)' },
    { name: 'Dark/Surface 2', hex: '#141416', rgb: 'rgb(20, 20, 22)', usage: 'Insets inside cards (12px radius)' },
    { name: 'Dark/Accent', hex: '#21d2ed', rgb: 'rgb(33, 210, 237)', usage: 'Eyebrows, active tabs, focus states' },
    { name: 'Dark/Border', hex: 'rgba(255,255,255,0.06)', rgb: '1px solid hairline', usage: 'Card outlines & divider lines' },
    { name: 'Text/Primary', hex: '#ffffff', rgb: 'rgb(255, 255, 255)', usage: 'Headings & primary labels' },
    { name: 'Text/Secondary', hex: '#b0b0b0', rgb: 'rgb(176, 176, 176)', usage: 'Body copy & card descriptions' },
  ]

  const typeStyles = [
    { name: 'Heading 1', spec: '60px / 1.05 / -0.04em', sample: 'Your invoices, audited. Your expenses, clear.' },
    { name: 'Heading 2', spec: '48px / 1.05 / -0.04em', sample: 'Less invoice admin. More financial clarity.' },
    { name: 'Heading 3', spec: '36px / 1.15 / -0.04em', sample: 'One platform. Every financial step.' },
    { name: 'Heading 4', spec: '28px / 1.3 / -0.02em', sample: 'Upload your documents' },
    { name: 'Heading 5', spec: '20px / 1.3 / -0.02em', sample: 'Extract invoice details' },
    { name: 'Body Large', spec: '18px / 1.4', sample: 'Process invoices, track expenses, and spot financial errors with AI.' },
    { name: 'Body Medium', spec: '16px / 1.45', sample: 'Upload a PDF or image. AI reads vendors, dates, and line items.' },
    { name: 'Eyebrow Tag', spec: '12px / 500 / uppercase', sample: 'WHAT VEYRA AI DOES' },
  ]

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-between relative overflow-hidden">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 max-w-5xl mx-auto w-full relative z-10">
        <div className="mb-14">
          <div className="eyebrow-tag mb-3">
            <span>Design tokens</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-white mb-3">
            Veyra AI Design System
          </h1>
          <p className="text-[16px] text-[#b0b0b0] max-w-2xl leading-relaxed">
            Every color, text style, surface, liquid glass element, and interactive motion component Veyra is built from.
          </p>
        </div>

        {/* 01 LIQUID GLASS & BUTTON MOTIONS */}
        <section className="mb-16">
          <h2 className="text-2xl font-medium text-white mb-6">01 · Liquid Glass & Button Motion Physics</h2>
          <div className="surface-card p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="space-y-3">
                <div className="text-[13px] text-neutral-400">Primary Liquid Glass</div>
                <LiquidButton variant="primary" size="lg" className="w-full" icon={<ArrowRight className="size-4" />}>
                  Try Veyra Free
                </LiquidButton>
              </div>

              <div className="space-y-3">
                <div className="text-[13px] text-neutral-400">Frosted Glass (Secondary)</div>
                <LiquidButton variant="secondary" size="lg" className="w-full">
                  Learn more
                </LiquidButton>
              </div>

              <div className="space-y-3">
                <div className="text-[13px] text-neutral-400">Cyan Refraction Accent</div>
                <LiquidButton variant="accent" size="lg" className="w-full" icon={<Sparkles className="size-4" />}>
                  Approve Invoice
                </LiquidButton>
              </div>
            </div>

            <div className="p-4 rounded-xl liquid-glass-secondary border-white/10 text-[13px] text-neutral-300">
              <div className="font-medium text-white mb-1">Liquid Glass Specs:</div>
              Includes dual-direction inset shadows (`inset 0 1px 1px rgba(255,255,255,0.4)` & `inset 0 -1px 1px rgba(0,0,0,0.3)`), specular rim highlight, diagonal light sheen sweep on hover, and Framer Motion spring physics (`stiffness: 450, damping: 25`).
            </div>
          </div>
        </section>

        {/* 02 COLORS */}
        <section className="mb-16">
          <h2 className="text-2xl font-medium text-white mb-6">02 · Colors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {colors.map((c) => (
              <div key={c.name} className="surface-card p-4">
                <div
                  className="h-16 rounded-lg mb-3 border border-white/10"
                  style={{ backgroundColor: c.hex.startsWith('#') ? c.hex : '#111113' }}
                />
                <div className="text-[14px] font-medium text-white">{c.name}</div>
                <div className="text-[12px] font-mono text-[#21d2ed]">{c.hex}</div>
                <div className="text-[11px] text-neutral-400 mt-1">{c.usage}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 03 TYPOGRAPHY */}
        <section className="mb-16">
          <h2 className="text-2xl font-medium text-white mb-6">03 · Typography (Onest)</h2>
          <div className="surface-card divide-y divide-white/5">
            {typeStyles.map((t) => (
              <div key={t.name} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="sm:w-1/3">
                  <div className="text-[14px] font-medium text-white">{t.name}</div>
                  <div className="text-[12px] font-mono text-neutral-500">{t.spec}</div>
                </div>
                <div className="sm:w-2/3 text-[#b0b0b0] text-[15px]">
                  {t.sample}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 04 SHADERS & SURFACES */}
        <section className="mb-16">
          <h2 className="text-2xl font-medium text-white mb-6">04 · Shader Backgrounds</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['Small1', 'Small2', 'Small3'].map((v) => (
              <div key={v} className="surface-card p-3">
                <div className="h-32 rounded-xl overflow-hidden mb-3 relative">
                  <ShaderBackground variant={v as any} className="size-full" />
                </div>
                <div className="text-[13px] font-medium text-white">Shader · {v}</div>
                <div className="text-[11px] text-neutral-400">Used inside feature cards</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

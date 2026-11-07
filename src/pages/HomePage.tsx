import { Navbar } from '../components/Navbar'
import { Hero } from '../components/Hero'
import { Logos } from '../components/Logos'
import { WhatWeDo } from '../components/WhatWeDo'
import { UseCases } from '../components/UseCases'
import { HowItWorks } from '../components/HowItWorks'
import { BuiltForTeams } from '../components/BuiltForTeams'
import { Comparison } from '../components/Comparison'
import { Testimonials } from '../components/Testimonials'
import { Metrics } from '../components/Metrics'
import { Pricing } from '../components/Pricing'
import { Faq } from '../components/Faq'
import { CtaBanner } from '../components/CtaBanner'
import { Footer } from '../components/Footer'

export function HomePage() {
  return (
    <div className="min-h-screen bg-transparent text-white overflow-x-hidden selection:bg-[#21d2ed]/30 selection:text-white relative">
      {/* Living Atmospheric Background */}

      <a href="#main-content" className="skip-link">Skip to content</a>
      {/* Navigation */}
      <Navbar />

      {/* Main Page Flow */}
      <main id="main-content" className="relative z-10">
        <Hero />
        <Logos />
        <WhatWeDo />
        <UseCases />
        <HowItWorks />
        <BuiltForTeams />
        <Comparison />
        <Testimonials />
        <Metrics />
        <Pricing />
        <Faq />
        <CtaBanner />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

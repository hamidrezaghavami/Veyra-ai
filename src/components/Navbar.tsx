import { useState, useEffect } from 'react'
import { ArrowRight, Menu, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from '../context/RouterContext'
import { LiquidButton } from './LiquidButton'
import { useClerkConfig, SignedIn, SignedOut, UserButton } from '../lib/clerk'
import { authService } from '../services/authService'

export function Navbar() {
  const { path, navigate } = useRouter()
  const { isConfigured } = useClerkConfig()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setMobileMenuOpen(false)

    if (href.startsWith('#')) {
      if (path !== '/') {
        navigate('/')
        setTimeout(() => {
          const el = document.querySelector(href)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 150)
      } else {
        const el = document.querySelector(href)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(href)
    }
  }

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Use Cases', href: '#use-cases' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Blog', href: '/blog' },
    { name: 'Changelog', href: '/changelog' },
  ]

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 transition-all duration-300">
      <div className="max-w-6xl mx-auto">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`flex items-center justify-between px-5 md:px-7 py-2.5 rounded-full transition-all duration-300 liquid-glass-nav ${
            scrolled ? 'shadow-[0_25px_50px_rgba(0,0,0,0.8)]' : ''
          }`}
        >
          {/* Brand Logo */}
          <motion.a
            href="/"
            onClick={handleNavClick('/')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="size-8 rounded-xl bg-[#141824] border border-white/15 flex items-center justify-center p-1.5 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] group-hover:border-[#21d2ed]/50 group-hover:shadow-[0_0_15px_rgba(33,210,237,0.3)]">
              {/* Veyra geometric mark */}
              <svg viewBox="0 0 24 24" fill="none" className="size-full text-[#21d2ed]">
                <path
                  d="M4 6L12 18L20 6"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="1.8" fill="currentColor" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-[16px] tracking-tight text-white font-sans">
                Veyra AI
              </span>
            </div>
          </motion.a>

          {/* Desktop Nav Links with Fluid Hover Pills */}
          <div className="hidden md:flex items-center gap-1 text-[13.5px] font-normal text-[#b0b0b0]">
            {navLinks.map((link) => {
              const isActive =
                link.href.startsWith('/') &&
                (link.href === path || (link.href !== '/' && path.startsWith(link.href)))

              return (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={handleNavClick(link.href)}
                  whileHover={{ y: -1 }}
                  className={`px-3 py-1.5 rounded-full transition-colors relative cursor-pointer ${
                    isActive ? 'text-white font-medium' : 'hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 bg-white/10 rounded-full border border-white/10 -z-0"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.a>
              )
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {isConfigured ? (
              <>
                <SignedIn>
                  <LiquidButton
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/account')}
                    className="border-white/10"
                  >
                    Dashboard
                  </LiquidButton>
                  <div className="flex items-center ml-1">
                    <UserButton />
                  </div>
                </SignedIn>
                <SignedOut>
                  <LiquidButton
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/sign-in')}
                    className="border-white/10"
                  >
                    Sign In
                  </LiquidButton>
                  <LiquidButton
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/sign-up')}
                    icon={<ArrowRight className="size-3.5" />}
                  >
                    Get started
                  </LiquidButton>
                </SignedOut>
              </>
            ) : authService.isAuthenticated() ? (
              <>
                <LiquidButton
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/account')}
                  className="border-white/10"
                >
                  Dashboard
                </LiquidButton>
                <button
                  onClick={() => navigate('/account')}
                  className="size-7 rounded-full bg-[#21d2ed]/20 text-[#21d2ed] border border-[#21d2ed]/40 flex items-center justify-center text-[11px] font-semibold cursor-pointer hover:bg-[#21d2ed]/30 transition-all"
                  title="Go to Account Dashboard"
                >
                  {(authService.getCurrentUser()?.name || 'FC')
                    .split(' ')
                    .filter(Boolean)
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'FC'}
                </button>
              </>
            ) : (
              <>
                <LiquidButton
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/sign-in')}
                  className="border-white/10"
                >
                  Sign In
                </LiquidButton>
                <LiquidButton
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/sign-up')}
                  icon={<ArrowRight className="size-3.5" />}
                >
                  Get started
                </LiquidButton>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-white/5 border border-white/10 text-neutral-300 hover:text-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </motion.button>
        </motion.nav>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 p-5 rounded-3xl liquid-glass-nav flex flex-col gap-4 shadow-2xl"
            >
              <div className="flex flex-col gap-2.5 text-[15px] text-[#b0b0b0]">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={handleNavClick(link.href)}
                    className="py-1.5 px-3 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                <a
                  href="/waitlist"
                  onClick={handleNavClick('/waitlist')}
                  className="py-1.5 px-3 rounded-lg text-[#21d2ed] hover:bg-[#21d2ed]/10 transition-colors"
                >
                  Join Early Access Waitlist
                </a>
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                <LiquidButton
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate('/sign-in')
                  }}
                  className="w-full"
                >
                  Sign In
                </LiquidButton>
                <LiquidButton
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate('/sign-up')
                  }}
                  className="w-full"
                  icon={<ArrowRight className="size-3.5" />}
                >
                  Get started
                </LiquidButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

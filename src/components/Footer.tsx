import { useLanguage } from '../context/LanguageContext'
import { useRouter } from '../context/RouterContext'

export function Footer() {
  const { t } = useLanguage()

  const { navigate } = useRouter()

  const handleLink = (href: string) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (href.startsWith('#')) return
    e.preventDefault()
    if (href.startsWith('#')) {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(href)
    }
  }

  return (
    <footer className="border-t border-white/[0.06] bg-[#0d0d0f]/75 backdrop-blur-md pt-16 pb-12 text-[#b0b0b0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12">
          {/* Brand Info (2 cols) */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="size-7 rounded-md bg-[#18181b] border border-white/10 flex items-center justify-center p-1 text-[#9ee6c5]">
                <svg viewBox="0 0 24 24" fill="none" className="size-full">
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
              <span className="font-medium text-lg text-white tracking-tight">{t("Veyra AI")}</span>
            </div>
            <p className="text-[14px] leading-relaxed max-w-sm text-neutral-400">{t("AI-powered invoice auditing and expense tracking. Understand your spending and stay in control.")}</p>
          </div>

          {/* Navigation */}
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-white mb-4">{t("Navigation")}</div>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <a href="/#features" className="hover:text-white transition-colors">{t("Features")}</a>
              </li>
              <li>
                <a href="/#use-cases" className="hover:text-white transition-colors">{t("Use Cases")}</a>
              </li>
              <li>
                <a href="/#pricing" className="hover:text-white transition-colors">{t("Pricing")}</a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-white transition-colors">{t("FAQ")}</a>
              </li>
              <li>
                <a href="/blog" onClick={handleLink('/blog')} className="hover:text-white transition-colors">{t("Blog")}</a>
              </li>
              <li>
                <a href="/changelog" onClick={handleLink('/changelog')} className="hover:text-white transition-colors">{t("Changelog")}</a>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-white mb-4">{t("Information")}</div>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <a href="/contact" onClick={handleLink('/contact')} className="hover:text-white transition-colors">{t("Contact")}</a>
              </li>
              <li>
                <a href="/waitlist" onClick={handleLink('/waitlist')} className="hover:text-white transition-colors">{t("Waitlist")}</a>
              </li>
              <li>
                <a href="/legal/privacy-policy" onClick={handleLink('/legal/privacy-policy')} className="hover:text-white transition-colors">{t("Privacy Policy")}</a>
              </li>
              <li>
                <a href="/legal/terms-of-service" onClick={handleLink('/legal/terms-of-service')} className="hover:text-white transition-colors">{t("Terms of Service")}</a>
              </li>
              <li>
                <a href="/design-system" onClick={handleLink('/design-system')} className="hover:text-white transition-colors">{t("Design System")}</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between text-[13px] text-neutral-500 gap-4">
          <div>
            © {new Date().getFullYear()}{t(" Veyra AI")}</div>
          <div className="flex items-center gap-6">
            <span>{t("All rights reserved.")}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

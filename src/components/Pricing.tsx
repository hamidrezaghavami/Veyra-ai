import { useLanguage } from '../context/LanguageContext'
export function Pricing() {
  const { t } = useLanguage()

  return <section id="pricing" className="py-24 max-w-6xl mx-auto px-4"><div className="surface-card p-8 sm:p-12 text-center"><p className="eyebrow-tag mb-4">{t("Early access")}</p><h2 className="text-3xl sm:text-4xl mb-5">{t("Start reviewing your invoices.")}</h2><p className="text-neutral-400 max-w-xl mx-auto mb-7">{t("Paid plans are not available yet. Create an account to explore Veyra, or join the waitlist for product and pricing updates.")}</p><div className="flex flex-wrap justify-center gap-4"><a href="/sign-up" className="action-button">{t("Create Account")}</a><a href="/waitlist" className="action-button">{t("Join the Waitlist")}</a></div></div></section>
}

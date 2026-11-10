import { useLanguage } from '../context/LanguageContext'
export function Testimonials() {
  const { t } = useLanguage()

  return <section className="py-20 max-w-6xl mx-auto px-4"><div className="surface-card p-8 sm:p-12"><p className="eyebrow-tag mb-3">{t("Built with your feedback")}</p><h2 className="text-3xl mb-4">{t("Help shape Veyra AI.")}</h2><p className="text-neutral-400 mb-6 max-w-xl">{t("We’re building a better way to review invoices. Tell us about your workflow and the problems you want to solve.")}</p><a className="action-button" href="/contact">{t("Share Your Feedback")}</a></div></section>
}

import { useLanguage } from '../context/LanguageContext'
export function Logos() {
  const { t } = useLanguage()

  return <section className="py-10 border-y border-white/10 text-center px-4"><p className="text-neutral-400 text-sm">{t("Built for freelancers, small businesses, and accounting professionals.")}</p></section>
}

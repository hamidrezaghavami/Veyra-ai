import { useLanguage } from '../context/LanguageContext'
export function LanguageSwitch() {
  const { language, setLanguage, t } = useLanguage()
  return <div className="language-switch" role="group" aria-label={t('Language')}>
    <button type="button" lang="en" aria-label="English" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
    <button type="button" lang="tr" aria-label="Türkçe" aria-pressed={language === 'tr'} onClick={() => setLanguage('tr')}>TR</button>
  </div>
}

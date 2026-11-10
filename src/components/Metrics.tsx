import { useLanguage } from '../context/LanguageContext'
export function Metrics() {
  const { t } = useLanguage()

  return <section className="py-16 border-y border-white/10"><div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-3 gap-8">{[['Read Documents','Extract fields from PDFs and images.'],['Review Findings','Check arithmetic and possible duplicates.'],['Keep Control','Approve or reject with a recorded review note.']].map(([title,text]) => <div key={title}><h3 className="text-lg mb-3">{t(title)}</h3><p className="text-neutral-400">{t(text)}</p></div>)}</div></section>
}

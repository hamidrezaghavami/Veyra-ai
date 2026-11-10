import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import type { InvoiceRecord } from '../shared/types'
export function ReviewGuide({ userId, invoices, onUpload, onReview, opened }: { userId: string; invoices: InvoiceRecord[]; onUpload: () => void; onReview: () => void; opened: boolean }) {
  const { t } = useLanguage()
  const key = `veyra-guide:${userId}`
  const [hidden, setHidden] = useState(() => { try { return localStorage.getItem(key) === 'hidden' } catch { return false } })
  const complete = invoices.some(i => i.auditHistory.some(h => ['Invoice approved','Invoice rejected','Flagged for review'].includes(h.action)))
  const dismiss = () => { setHidden(true); try { localStorage.setItem(key, 'hidden') } catch {} }
  if (hidden) return <button className="ws-back" onClick={() => setHidden(false)}>{t('Quick guide')}</button>
  return <section className="ws-guide" aria-label={t('Quick guide')}><div className="ws-section-heading"><h2>{t(complete ? 'Your first review is complete' : 'Three steps to your first review')}</h2><button className="ws-back" onClick={dismiss}>{t(complete ? 'Done' : 'Hide guide')}</button></div><ol>{[
    { label: 'Upload an invoice', done: invoices.length > 0 },
    { label: 'Compare the original and details', done: opened || complete },
    { label: 'Save your decision', done: complete },
  ].map((step, index) => <li key={step.label} className={step.done ? 'is-done' : ''}><span aria-label={t(step.done ? 'Completed' : 'Step')}>{step.done ? '✓' : index + 1}</span>{t(step.label)}</li>)}</ol>{!complete && <button className="ws-review-link" onClick={invoices.length ? onReview : onUpload}>{t(invoices.length ? 'Review an invoice' : 'Upload invoice')} →</button>}</section>
}

import { lazy, Suspense, useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { invoiceService } from '../services/invoiceService'

const PdfPreview = lazy(() => import('./PdfPreview'))

export function OriginalDocument({ id, fileName }: { id: string; fileName?: string }) {
  const { t } = useLanguage()
  const [source, setSource] = useState<Blob | null>(null)
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    setSource(null); setError(''); setLoading(true)
    invoiceService.getDocument(id, controller.signal).then(blob => { if (!controller.signal.aborted) setSource(blob) })
      .catch(e => { if (!controller.signal.aborted) setError(e.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [id])
  useEffect(() => {
    setText(''); setUrl('')
    if (!source) return
    let active = true
    const next = URL.createObjectURL(source)
    setUrl(next)
    if (source.type === 'application/json') source.text().then(value => { if (active) { try { setText(JSON.stringify(JSON.parse(value), null, 2)) } catch { setText(value) } } })
    return () => { active = false; URL.revokeObjectURL(next) }
  }, [source])
  return <section className="ws-original" aria-label={t('Original document')}>
    <div className="ws-section-heading"><h3>{t('Original document')}</h3>{url && <a className="ws-review-link" href={url} download={fileName || 'invoice'}>{t('Download')}</a>}</div>
    {loading ? <p role="status">{t('Loading original…')}</p> : <>
      {error && <p role="alert">{t(error)}</p>}
      {!source && <><p>{t('This older invoice has no saved original. Choose a local copy to compare; it stays on your device.')}</p><label className="ws-local-file">{t('Preview local copy')}<input type="file" accept="application/pdf,image/png,image/jpeg,image/webp,application/json" onChange={event => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 2_800_000 || !['application/pdf','image/png','image/jpeg','image/webp','application/json'].includes(file.type)) { setError('Choose a PDF, PNG, JPEG, WebP, or invoice JSON file.'); return } setError(''); setSource(file) }} /></label></>}
      {source && url && (source.type === 'application/json' ? <pre>{text}</pre> : source.type.startsWith('image/') ? <img src={url} alt={t('Original invoice')} /> : source.type === 'application/pdf' ? <Suspense fallback={<p role="status">{t('Loading original…')}</p>}><PdfPreview source={source} /></Suspense> : <p>{t('Preview unavailable. Download the original to open it.')}</p>)}
    </>}
  </section>
}

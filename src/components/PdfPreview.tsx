import { useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { documentValueMatcher } from '../shared/documentMatch'
import { useLanguage } from '../context/LanguageContext'

export default function PdfPreview({ source, focusValue }: { source: Blob; focusValue: string | number | null }) {
  const { t } = useLanguage()
  const canvas = useRef<HTMLCanvasElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const pageScroll = useRef<HTMLDivElement>(null)
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null)
  const [page, setPage] = useState(1)
  const [width, setWidth] = useState(400)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [matches, setMatches] = useState(0)
  useEffect(() => {
    let active = true
    let task: ReturnType<typeof import('pdfjs-dist')['getDocument']> | undefined
    setDocument(null); setPage(1); setError(''); setLoading(true)
    async function load() {
      const [pdfjs, worker, bytes] = await Promise.all([
        import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url'), source.arrayBuffer(),
      ])
      if (!active) return
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default
      task = pdfjs.getDocument({ data: new Uint8Array(bytes) })
      const pdf = await task.promise
      if (active) setDocument(pdf)
    }
    load().catch(() => { if (active) { setError('Could not preview this PDF. Download the original to open it.'); setLoading(false) } })
    return () => { active = false; void task?.destroy() }
  }, [source])
  useEffect(() => {
    if (!container.current) return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(1, entry.contentRect.width)))
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!document || !canvas.current) return
    let active = true
    let render: ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']> | undefined
    setLoading(true); setError('')
    async function draw() {
      const pdfPage = await document!.getPage(page)
      if (!active || !canvas.current) return
      const viewport = pdfPage.getViewport({ scale: Math.min(width, 1200) / pdfPage.getViewport({ scale: 1 }).width })
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const target = canvas.current
      const context = target.getContext('2d')
      if (!context) throw new Error('Canvas unavailable')
      target.width = Math.ceil(viewport.width * ratio)
      target.height = Math.ceil(viewport.height * ratio)
      target.style.width = `${viewport.width}px`
      target.style.height = `${viewport.height}px`
      render = pdfPage.render({ canvas: target, canvasContext: context, viewport, transform: ratio === 1 ? undefined : [ratio,0,0,ratio,0,0] })
      await render.promise
      if (!active) return
      let found = 0
      let firstMatchY: number | null = null
      if (focusValue !== null) {
        const content = await pdfPage.getTextContent()
        if (!active) return
        const { Util } = await import('pdfjs-dist')
        if (!active) return
        const matchesValue = documentValueMatcher(focusValue)
        context.save()
        context.scale(ratio, ratio)
        for (const item of content.items) {
          if (!('str' in item) || !matchesValue(item.str)) continue
          const transform = Util.transform(viewport.transform, item.transform)
          const height = Math.hypot(transform[2],transform[3])
          context.fillStyle = 'rgba(237, 185, 85, .32)'
          context.strokeStyle = '#b37b1c'
          const x = transform[4] - 2
          const y = transform[5] - height
          const highlightWidth = Math.max(item.width * viewport.scale, 8) + 4
          context.fillRect(x, y, highlightWidth, height + 4)
          context.strokeRect(x, y, highlightWidth, height + 4)
          firstMatchY ??= y
          found++
        }
        context.restore()
      }
      if (pageScroll.current) {
        const pane = pageScroll.current
        pane.scrollTop = firstMatchY === null ? 0 : Math.max(0, firstMatchY - pane.clientHeight / 2)
      }
      setMatches(found)
      setLoading(false)
    }
    draw().catch(() => { if (active) { setError('Could not preview this PDF. Download the original to open it.'); setLoading(false) } })
    return () => { active = false; render?.cancel() }
  }, [document, page, width, focusValue])
  return <div ref={container} className="ws-pdf-preview">
    {document && <div className="ws-pdf-controls"><button type="button" className="ws-back" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>{t('Previous page')}</button><span>{t('Page {page} of {total}', {page, total: document.numPages})}</span><button type="button" className="ws-back" disabled={page >= document.numPages} onClick={() => setPage(value => value + 1)}>{t('Next page')}</button></div>}
    {loading && <p role="status">{t('Loading original…')}</p>}
    {!loading && !error && focusValue !== null && <p className="ws-pdf-match" role="status">{t(matches ? 'Matching text highlighted on this page. Verify it against the field.' : 'No exact text match on this page. Check other pages or compare visually.')}</p>}
    {error && <p role="alert">{t(error)}</p>}
    <div className="ws-pdf-page" ref={pageScroll}><canvas ref={canvas} aria-label={t('Original invoice')} role="img" hidden={!!error} /></div>
  </div>
}

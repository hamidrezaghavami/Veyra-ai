import { useLanguage } from '../context/LanguageContext'
import { useState } from 'react'
import { ArrowRight, Check, FileText, LoaderCircle, Upload } from 'lucide-react'
import type { RefObject } from 'react'
import type { InvoiceStatus } from '../shared/types'

export const statusLabels: Record<InvoiceStatus, string> = { 'Pending Audit': 'Needs review', Flagged: 'Check needed', Approved: 'Approved', Rejected: 'Rejected' }
export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { t } = useLanguage()

  return <span className={`ws-status ws-status-${status === 'Approved' ? 'approved' : status === 'Rejected' ? 'rejected' : status === 'Flagged' ? 'flagged' : 'pending'}`}><span aria-hidden="true" />{t(statusLabels[status])}</span>
}
export function WorkflowSteps({ current = 0 }: { current?: number }) {
  const { t } = useLanguage()

  return <ol className="ws-steps" aria-label={t("Invoice workflow")}>{['Upload invoice', 'Review details', 'Approve or reject'].map((label, index) => <li key={label} aria-current={current === index ? 'step' : undefined}><span className="ws-step-number" aria-hidden="true">{index < current ? <Check size={12} /> : index + 1}</span><span>{t(label)}</span>{index < 2 && <ArrowRight size={13} className="ws-step-arrow" aria-hidden="true" />}</li>)}</ol>
}
export function EmptyInvoices({ onUpload }: { onUpload: () => void }) {
  const { t } = useLanguage()

  return <section className="ws-empty"><div className="ws-empty-icon"><FileText size={26} strokeWidth={1.5} aria-hidden="true" /></div><p className="ws-eyebrow">{t("Start here")}</p><h2>{t("Your first invoice, in one place.")}</h2><p>{t("Upload an invoice. We’ll check the numbers.")}<br />{t("You review the details and decide what to approve.")}</p><button className="ws-button ws-primary" onClick={onUpload}><Upload size={16} aria-hidden="true" />{t("Upload your first invoice")}</button><WorkflowSteps /></section>
}
export function InvoiceUpload({ inputRef, busy, onUpload }: { inputRef: RefObject<HTMLInputElement | null>; busy: boolean; onUpload: (file?: File) => Promise<void> }) {
  const { t } = useLanguage()

  const [dragging, setDragging] = useState(false)
  return <section className="ws-upload-panel"><WorkflowSteps /><div className={`ws-dropzone ${dragging ? 'ws-dragging' : ''}`} aria-busy={busy} onDragOver={event => { event.preventDefault(); if (!busy) setDragging(true) }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false) }} onDrop={event => { event.preventDefault(); setDragging(false); if (!busy) void onUpload(event.dataTransfer.files[0]) }}>
    <div className="ws-empty-icon">{busy ? <LoaderCircle size={26} className="animate-spin" aria-hidden="true" /> : <Upload size={26} strokeWidth={1.5} aria-hidden="true" />}</div>
    <h2>{busy ? t('Checking your invoice…') : t('Drop your invoice here')}</h2><p>{busy ? t('Reading the details and checking the calculations.') : t('An invoice or receipt, as a PDF or image.')}</p>
    <input ref={inputRef} id="invoice-file" name="document" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.json" disabled={busy} onChange={event => void onUpload(event.target.files?.[0])} className="sr-only" tabIndex={-1} aria-label={t("Choose invoice file")} />
    <button className="ws-button ws-primary" disabled={busy} onClick={() => inputRef.current?.click()}>{busy ? t('Processing…') : t('Choose file')}{!busy && <ArrowRight size={15} aria-hidden="true" />}</button><span className="ws-file-hint">{t("PDF, PNG, JPEG, WebP or JSON · Up to 2.8 MB")}</span>
    {busy && <p role="status" className="sr-only">{t("Reading document and checking calculations. Please wait.")}</p>}
  </div><div className="ws-upload-note"><p>{t("You’re in control")}</p><span>{t("Review and correct the extracted details before approving.")}</span></div><details className="ws-privacy"><summary>{t("How your document is handled")}</summary><p>{t("Contents are processed by Google Gemini. Google’s free tier may use submitted content to improve its products; upload only non-sensitive documents. The original file is not retained. Extracted fields and review history are saved to your account.")}</p></details><p className="ws-privacy-short">{t("Use non-sensitive documents. Google’s free tier may use their contents to improve its products.")}</p></section>
}

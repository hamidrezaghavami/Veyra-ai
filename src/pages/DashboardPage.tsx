import { OriginalDocument } from '../components/OriginalDocument'
import { ReviewGuide } from '../components/ReviewGuide'
import { reviewQueue } from '../shared/reviewQueue'
import { LanguageSwitch } from '../components/LanguageSwitch'
import { useLanguage } from '../context/LanguageContext'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useSession } from '../services/authService'
import { UserButton, useClerk } from '@clerk/react'
import { invoiceService } from '../services/invoiceService'
import type { InvoiceRecord, ChatMessage } from '../shared/types'
import { aiAssistantService } from '../services/aiAssistantService'
import { useRouter } from '../context/RouterContext'
import { formatMoney, downloadLedger } from '../shared/export'
import { FileText, BarChart3, MessageSquare, Search, Download, LogOut, ArrowRight, ArrowLeft, Plus, X, Check, AlertCircle } from 'lucide-react'
import { EmptyInvoices, InvoiceUpload, StatusBadge, statusLabels } from '../components/DashboardPrimitives'
import { summarizeLedger } from '../shared/analytics.js'

type Tab = 'review'|'invoices'|'upload'|'analytics'|'assistant'
const navigation = [{ key: 'review', label: 'Needs review', icon: AlertCircle }, { key: 'invoices', label: 'Invoices', icon: FileText }, { key: 'analytics', label: 'Spending', icon: BarChart3 }, { key: 'assistant', label: 'Assistant', icon: MessageSquare }] as const
const titles: Record<Tab, [string,string]> = { review: ['Needs review', 'Check flagged invoices first, then work through upcoming due dates.'], invoices: ['Your invoices', 'Upload, review, and keep everything in order.'], upload: ['Upload an invoice', 'We’ll read the details. You make the final call.'], analytics: ['Your spending', 'A clearer view of the invoices you’ve saved.'], assistant: ['Ask your assistant', 'Get answers from your saved invoices.'] }
const query = () => new URLSearchParams(window.location.search)
const displayDate = (value: string, locale: string) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value + 'T00:00:00'))
export function DashboardPage() {
  const { t, locale, language } = useLanguage()
  const money = (value: number, currency: string) => formatMoney(value, currency, locale)
  const date = (value: string) => displayDate(value, locale)

  const { data: session, isPending: checkingSession } = useSession()
  const { signOut } = useClerk()
  const { navigate } = useRouter()
  const [tab, setTab] = useState<Tab>(() => { const value = query().get('tab'); return value && Object.keys(titles).includes(value) ? value as Tab : 'invoices' })
  const [status, setStatus] = useState(query().get('status') || 'all')
  const [search, setSearch] = useState(query().get('search') || '')
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selected, setSelected] = useState<InvoiceRecord|null>(null)
  const [openedReview, setOpenedReview] = useState(false)
  useEffect(() => { setOpenedReview(false) }, [session?.user.id])
  useEffect(() => { if (selected) setOpenedReview(true) }, [selected])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [question, setQuestion] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const questionInput = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Remove legacy demo records so they cannot be mistaken for saved account data.
    for (const key of ['veyra_auth_user','veyra_pending_otp','veyra_invoices_v1','veyra_clerk_pubkey']) localStorage.removeItem(key)
  }, [])
  useEffect(() => {
    if (!checkingSession && !session) navigate('/sign-in')
  }, [checkingSession, session?.user.id, navigate])
  useEffect(() => {
    let active = true
    setInvoices([]); setSelected(null); setMessages([])
    if (!session) return
    setLoading(true)
    invoiceService.getAll().then(data => { if (active) setInvoices(data) }).catch(e => { if (active) setError(e.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [session?.user.id])
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('tab', tab)
    if (status !== 'all') params.set('status', status)
    if (search) params.set('search', search)
    history.replaceState({}, '', `${location.pathname}?${params}`)
  }, [tab, status, search])

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [tab])

  const queue = useMemo(() => reviewQueue(invoices), [invoices])
  const visible = useMemo(() => (tab === 'review' ? queue : invoices).filter(i => (tab === 'review' || status === 'all' || (status === 'review' ? ['Pending Audit','Flagged'].includes(i.status) : i.status === status)) && `${i.vendor} ${i.invoiceNumber}`.toLocaleLowerCase(locale).includes(search.toLocaleLowerCase(locale))), [invoices,queue,tab,status,search,locale])
  const summaries = useMemo(() => summarizeLedger(invoices), [invoices])
  const reviewCount = invoices.filter(i => ['Pending Audit','Flagged'].includes(i.status)).length
  const approvedCount = invoices.filter(i => i.status === 'Approved').length
  const go = (next: Tab) => { setTab(next); setError(''); setNotice('') }
  const replaceInvoice = (record: InvoiceRecord) => {
    setInvoices(list => list.map(i => i.id === record.id ? record : i))
    setSelected(record)
    setNotice(record.status === 'Approved' ? 'Invoice approved.' : record.status === 'Rejected' ? 'Invoice rejected.' : 'Invoice updated. Check the details before approving.')
  }
  const upload = async (file?: File) => {
    if (!file || busy) return
    setBusy(true); setError(''); setNotice('')
    try {
      const record = await invoiceService.upload(file)
      setInvoices(list => [record,...list]); setSelected(record); setTab('invoices')
      setNotice('Document saved and checked. Review the extracted fields before approval.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed. Please try again.') }
    finally { setBusy(false); if (fileInput.current) fileInput.current.value = '' }
  }
  const ask = async (event: FormEvent) => {
    event.preventDefault()
    if (!question.trim() || busy) return
    const text = question.trim()
    setBusy(true); setError(''); setQuestion('')
    setMessages(list => [...list, {id:crypto.randomUUID(),sender:'user',text,timestamp:new Date().toISOString()}])
    try { const answer = await aiAssistantService.processQuestion(text, language); setMessages(list => [...list,answer]) }
    catch (e) { setError(e instanceof Error ? e.message : 'Assistant unavailable. Please try again.') }
    finally { setBusy(false) }
  }
  if (checkingSession || !session) return <main className="p-12 text-center" role="status">{t("Checking your account…")}</main>

  return <div className="workspace">
    <a href="#workspace-main" className="ws-skip">{t("Skip to content")}</a>
    <aside className="ws-sidebar">
      <a href="/" className="ws-brand"><span className="ws-brand-mark" aria-hidden="true">{t("v")}</span>{t("veyra")}<span className="ws-brand-dot">.</span></a>
      <p className="ws-nav-caption">{t("Workspace")}</p>
      <nav aria-label={t("Workspace")} className="ws-nav">{navigation.map(({key,label,icon: Icon}) => <button key={key} aria-current={(tab === key || key === 'invoices' && tab === 'upload') ? 'page' : undefined} onClick={() => go(key)}><Icon size={18} strokeWidth={1.7} aria-hidden="true" /><span>{t(label)}</span>{key === 'review' && reviewCount > 0 && <span className="ws-nav-count" aria-label={`${reviewCount} ${t('need review')}`}>{reviewCount}</span>}</button>)}</nav>
      <div className="ws-sidebar-footer"><div className="ws-account"><UserButton /><div><span>{session.user.name}</span><small>{t("Personal workspace")}</small></div></div><LanguageSwitch /><button className="ws-signout" onClick={async () => { try { await signOut({ redirectUrl: '/sign-in' }); setInvoices([]); setSelected(null) } catch { setError('Could not sign out. Please try again.') } }}><LogOut size={15} aria-hidden="true" />{t("Sign out")}</button></div>
    </aside>
    <div className="ws-body"><header className="ws-topbar"><span className="ws-breadcrumb">{t("Workspace ")}<span aria-hidden="true">/</span> {t(tab === 'upload' ? 'New invoice' : navigation.find(item => item.key === tab)?.label)}</span><span className="ws-saved"><span aria-hidden="true" />{t("Saved to your account")}</span></header>
    <main id="workspace-main" className="ws-main">
      {tab === 'upload' && <button className="ws-back" onClick={() => go('invoices')}><ArrowLeft size={14} aria-hidden="true" />{t("Back to invoices")}</button>}
      <div className="ws-page-heading"><div><p className="ws-eyebrow">{tab === 'upload' ? t('Step 1 of 3') : t('Your workspace')}</p><h1>{t(titles[tab][0])}</h1><p>{t(titles[tab][1])}</p></div>{tab !== 'upload' && <button className="ws-button ws-primary" disabled={busy} onClick={() => go('upload')}><Plus size={16} aria-hidden="true" />{t("Upload invoice")}</button>}</div>
      {error && <div role="alert" className="ws-alert"><AlertCircle size={18} aria-hidden="true" /><span>{t(error)}</span><button aria-label={t("Dismiss error")} onClick={() => setError('')}><X size={16} aria-hidden="true" /></button></div>}
      {notice && <p role="status" className="ws-notice"><Check size={16} aria-hidden="true" />{t(notice)}</p>}
      {loading ? <div className="ws-loading" role="status">{t("Loading your invoices…")}</div> : <>
        {(tab === 'invoices' || tab === 'review') && <>
          <ReviewGuide key={session.user.id} userId={session.user.id} invoices={invoices} opened={openedReview} onUpload={() => go('upload')} onReview={() => { if (queue[0] || invoices[0]) setSelected(queue[0] || invoices[0]) }} />
          {tab === 'review' && queue.length > 0 && <div className="ws-queue-heading"><p>{t(queue.length ? 'Invoices waiting for your decision: {count}' : 'You’re all caught up', { count: queue.length })}</p>{visible.length > 0 && <button className="ws-button ws-primary" onClick={() => setSelected(visible[0])}>{t('Review next invoice')} →</button>}</div>}
          {tab === 'invoices' &&
          <div className="ws-stats">{([{ label: 'Total invoices', value: invoices.length, filter: 'all', hint: 'All your documents' }, { label: 'Needs review', value: reviewCount, filter: 'review', hint: reviewCount ? t('Ready for your decision') : t('You’re all caught up') }, { label: 'Approved', value: approvedCount, filter: 'Approved', hint: 'Reviewed and confirmed' }]).map(stat => <button key={stat.label} className="ws-stat" onClick={() => { setStatus(stat.filter); setSearch(''); if (stat.filter === 'review') go('review') }}><span>{t(stat.label)}<ArrowRight size={14} aria-hidden="true" /></span><strong>{stat.value}</strong><small>{t(stat.hint)}</small></button>)}</div>}
          {!invoices.length && tab !== 'review' ? <EmptyInvoices onUpload={() => go('upload')} /> : <section className="ws-invoice-panel" aria-label={t("Saved invoices")}>
            <div className="ws-table-tools"><div className="ws-search"><Search size={16} aria-hidden="true" /><label htmlFor="ledger-search" className="sr-only">{t("Search invoices")}</label><input id="ledger-search" name="invoice-search" autoComplete="off" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={t("Search vendor or invoice…")} /></div>{tab !== 'review' && <><label htmlFor="ledger-status" className="sr-only">{t("Filter by status")}</label><select id="ledger-status" className="ws-select" value={status} onChange={event => setStatus(event.target.value)}><option value="all">{t("All statuses")}</option><option value="review">{t("Needs review")}</option>{(['Pending Audit','Flagged','Approved','Rejected'] as const).map(value => <option key={value} value={value}>{value === 'Pending Audit' ? t('Not yet reviewed') : t(statusLabels[value])}</option>)}</select></>}<button className="ws-button ws-secondary ws-export" disabled={!visible.length} onClick={() => downloadLedger(visible, language)}><Download size={15} aria-hidden="true" />{t("Export")}<span className="sr-only">{t(" CSV")}</span></button></div>
            {!visible.length ? <div className="ws-no-results"><h2>{t(tab === 'review' && !queue.length ? 'You’re all caught up' : 'No invoices found')}</h2><p>{t(tab === 'review' && !queue.length ? 'Upload another invoice whenever you’re ready.' : 'Try another search or clear your filters.')}</p>{(tab !== 'review' || queue.length > 0) && <button className="ws-button ws-secondary" onClick={() => { setStatus('all'); setSearch('') }}>{t("Clear filters")}</button>}</div> : <><div className="ws-table-scroll"><table className="ws-table"><caption className="sr-only">{t("Your saved invoices. Select Review to check details and make a decision.")}</caption><thead><tr>{['Invoice','Vendor','Amount','Status',''].map((label,index) => <th scope="col" key={index}>{t(label) || <span className="sr-only">{t("Review")}</span>}</th>)}</tr></thead><tbody>{visible.map(invoice => <tr key={invoice.id}><td><span className="ws-invoice-id">{invoice.invoiceNumber}</span><small>{date(invoice.issueDate)}</small></td><td>{invoice.vendor}</td><td className="ws-amount">{money(invoice.total,invoice.currency)}</td><td><StatusBadge status={invoice.status} /></td><td><button className="ws-review-link" onClick={() => setSelected(invoice)} aria-label={`${t("Review invoice")} ${invoice.invoiceNumber}`}>{t("Review")}<ArrowRight size={14} aria-hidden="true" /></button></td></tr>)}</tbody></table></div><div className="ws-mobile-invoices">{visible.map(invoice => <article key={invoice.id}><div className="ws-mobile-invoice-heading"><h2>{invoice.vendor}</h2><strong>{money(invoice.total,invoice.currency)}</strong></div><p>{invoice.invoiceNumber} · {date(invoice.issueDate)}</p><div className="ws-mobile-invoice-bottom"><StatusBadge status={invoice.status} /><button className="ws-review-link" onClick={() => setSelected(invoice)} aria-label={`${t("Review invoice")} ${invoice.invoiceNumber}`}>{t("Review")}<ArrowRight size={14} aria-hidden="true" /></button></div></article>)}</div></>}
            <div className="ws-table-footer">{t('Invoices shown: {visible} / {total}', { visible: visible.length, total: tab === 'review' ? queue.length : invoices.length })}<span>{t('Saved to your account')}</span></div>
          </section>}
        </>}
        {tab === 'upload' && <InvoiceUpload inputRef={fileInput} busy={busy} onUpload={upload} />}
        {tab === 'analytics' && <div className="ws-analytics">{!invoices.length ? <section className="ws-empty"><div className="ws-empty-icon"><BarChart3 size={26} strokeWidth={1.5} aria-hidden="true" /></div><h2>{t("Your spending starts with an invoice.")}</h2><p>{t("Upload your first invoice to see totals and categories here.")}</p><button className="ws-button ws-primary" onClick={() => go('upload')}>{t("Upload invoice")}<ArrowRight size={15} aria-hidden="true" /></button></section> : <><p className="ws-section-note">{t("Each currency is shown separately. Category totals exclude rejected invoices.")}</p>{summaries.map(summary => {
          const categories = Object.entries(summary.categories).sort((a,b) => b[1]-a[1])
          const largest = Math.max(0,...categories.map(([,amount]) => amount))
          return <section className="ws-spending-card" key={summary.currency}><div className="ws-section-heading"><h2>{summary.currency}{t(" spending")}</h2><span>{summary.count} {summary.count === 1 ? t('invoice') : t('invoices')}</span></div><div className="ws-spending-totals">{[['Approved',summary.approved],['Needs review',summary.pending+summary.flagged],['Rejected',summary.rejected]].map(([label,amount]) => <div key={label}><span>{t(String(label))}</span><strong>{money(Number(amount),summary.currency)}</strong></div>)}</div><h3>{t("By category")}</h3>{categories.length ? categories.map(([category,amount]) => <div key={category} className="ws-category"><div><span>{t(category)}</span><strong>{money(amount,summary.currency)}</strong></div><div className="ws-bar" aria-hidden="true"><span style={{width:`${largest > 0 ? amount/largest*100 : 0}%`}} /></div></div>) : <p className="ws-section-note">{t("No spending to show after excluding rejected invoices.")}</p>}</section>
        })}</>}</div>}
        {tab === 'assistant' && <section className="ws-assistant"><div className="ws-conversation" role="log" aria-label={t("Invoice assistant conversation")} aria-live="polite">{!messages.length ? <div className="ws-assistant-welcome"><div className="ws-empty-icon"><MessageSquare size={26} strokeWidth={1.5} aria-hidden="true" /></div><h2>{t("What would you like to know?")}</h2><p>{t("Ask a question about your invoices or spending.")}</p><div className="ws-prompts">{['Which invoices need my review?', 'Summarize my spending by currency.', 'What issues were found in my invoices?'].map(prompt => <button key={prompt} onClick={() => { setQuestion(t(prompt)); questionInput.current?.focus() }}>{t(prompt)}<ArrowRight size={14} aria-hidden="true" /></button>)}</div></div> : messages.map(message => <div key={message.id} className={`ws-message ws-message-${message.sender}`}><span>{message.sender === 'user' ? t('You') : t('Veyra')}</span><p>{message.text}</p></div>)}{busy && <p role="status" className="ws-thinking">{t("Looking through your invoices…")}</p>}</div><form onSubmit={ask} className="ws-compose"><label htmlFor="assistant-question" className="sr-only">{t("Ask about your invoices")}</label><textarea ref={questionInput} id="assistant-question" name="question" autoComplete="off" placeholder={t("Ask about your invoices…")} rows={2} maxLength={2000} value={question} onChange={event => setQuestion(event.target.value)} required /><button className="ws-button ws-primary" disabled={busy || !question.trim()} type="submit" aria-label={t("Send question")}><ArrowRight size={18} aria-hidden="true" /></button></form><p className="ws-assistant-note">{t("AI can make mistakes. Check the invoice before making a decision.")}</p></section>}
      </>}
    </main></div>
    {selected && <ReviewDialog invoice={selected} onClose={() => setSelected(null)} onSave={replaceInvoice} />}
  </div>
}

function ReviewDialog({ invoice, onClose, onSave }: {invoice: InvoiceRecord; onClose:()=>void; onSave:(record:InvoiceRecord)=>void}) {
  const { t, locale, language } = useLanguage()
  const money = (value: number, currency: string) => formatMoney(value, currency, locale)
  const date = (value: string) => displayDate(value, locale)

  const dialog = useRef<HTMLDialogElement>(null)
  const [action,setAction] = useState<'approve'|'reject'|'flag'>('approve')
  const [note,setNote] = useState('')
  const [pending,setPending] = useState(false)
  const [error,setError] = useState('')
  const [editing,setEditing] = useState(false)
  const [draft,setDraft] = useState(invoice)
  useEffect(() => { dialog.current?.showModal(); return () => dialog.current?.close() }, [])
  useEffect(() => { setDraft(invoice); setNote(''); setEditing(false) }, [invoice])
  const submit = async (event:FormEvent) => {
    event.preventDefault(); if(pending)return
    setPending(true);setError('')
    try {
      if (editing) {
        const {invoiceNumber,vendor,vendorCategory,issueDate,dueDate,subtotal,taxRate,taxAmount,total,currency,lineItems} = draft
        onSave(await invoiceService.update(invoice.id,{invoiceNumber,vendor,vendorCategory,issueDate,dueDate,subtotal,taxRate,taxAmount,total,currency,lineItems}))
      } else { onSave(await invoiceService.action(invoice.id,action,note)); onClose() }
    } catch(e) { setError(e instanceof Error ? e.message : 'Could not save this review.') }
    finally { setPending(false) }
  }
  return <dialog ref={dialog} onCancel={event => { if(pending)event.preventDefault(); else onClose() }} aria-labelledby="invoice-review-title" className="ws-dialog ws-dialog-compare">
    <div className="flex items-start justify-between gap-4 mb-5"><h2 id="invoice-review-title" className="text-2xl">{t("Review invoice")}</h2><button type="button" className="action-button" disabled={pending} onClick={onClose}>{t("Close")}</button></div>
    <div className="ws-comparison"><OriginalDocument key={invoice.id} id={invoice.id} fileName={invoice.fileName} /><section className="ws-extracted" aria-label={t('Extracted details')}><h3>{t('Extracted details')}</h3>
    <p className="text-neutral-400 mb-5">{invoice.vendor} · {invoice.invoiceNumber} · {money(invoice.total,invoice.currency)}</p>
    <div className="ws-review-summary"><StatusBadge status={invoice.status} /><span>{invoice.flags.length ? `${invoice.flags.length} ${invoice.flags.length === 1 ? t('issue') : t('issues')} ${t('to check below')}` : t('Check the extracted details before approving.')}</span></div>
    {invoice.flags.map(f => <p key={f.id} className="text-amber-200 border border-amber-400/20 rounded-lg p-3 mb-3">{t(f.message)}</p>)}
    <form onSubmit={submit} aria-busy={pending}>
      {editing ? <><p className="text-sm text-neutral-400 mb-4">{t("Corrections re-run validation and reset approval.")}</p><div className="grid sm:grid-cols-2 gap-4">{(['vendor','invoiceNumber','issueDate','dueDate','currency','subtotal','taxRate','taxAmount','total'] as const).map(field => <div key={field}><label htmlFor={`edit-${field}`}>{t(({vendor:'Vendor',invoiceNumber:'Invoice Number',issueDate:'Issue Date',dueDate:'Due Date',currency:'Currency',subtotal:'Subtotal',taxRate:'Tax Rate (Fraction)',taxAmount:'Tax Amount',total:'Total'})[field])}</label><input id={`edit-${field}`} className="form-input" type={typeof draft[field]==='number' ? 'number' : field.endsWith('Date') ? 'date' : 'text'} step="any" min={typeof draft[field]==='number' ? 0 : undefined} required value={draft[field]} onChange={e=>setDraft({...draft,[field]:typeof draft[field]==='number' ? Number(e.target.value) : e.target.value})}/></div>)}</div><h3 className="text-lg mt-6 mb-3">{t("Line Items")}</h3>{draft.lineItems.map((line,index) => <fieldset key={index} className="border border-white/10 p-3 rounded-xl mb-3"><legend className="text-sm">{t("Item ")}{index+1}</legend>{(['description','quantity','unitPrice','total'] as const).map(field => <div key={field}><label htmlFor={`line-${index}-${field}`}>{t(({description:'Description',quantity:'Quantity',unitPrice:'Unit Price',total:'Line Total'})[field])}</label><input id={`line-${index}-${field}`} className="form-input" type={field==='description' ? 'text' : 'number'} step="any" required min={field==='quantity' ? 0.000001 : field==='description' ? undefined : 0} value={line[field]} onChange={e=>setDraft({...draft,lineItems:draft.lineItems.map((l,j)=>j===index ? {...l,[field]:field==='description' ? e.target.value : Number(e.target.value)} : l)})} /></div>)}</fieldset>)}</> : <>
        <dl className="grid grid-cols-2 gap-3 mb-5"><dt>{t("Issue Date")}</dt><dd>{date(invoice.issueDate)}</dd><dt>{t("Due Date")}</dt><dd>{date(invoice.dueDate)}</dd><dt>{t("Subtotal")}</dt><dd>{money(invoice.subtotal,invoice.currency)}</dd><dt>{t("Tax")}</dt><dd>{money(invoice.taxAmount,invoice.currency)} ({new Intl.NumberFormat(locale,{style:'percent',maximumFractionDigits:2}).format(invoice.taxRate)})</dd></dl>
        <div className="overflow-x-auto"><table className="w-full text-sm mb-6"><caption className="sr-only">{t("Invoice line items")}</caption><thead><tr><th scope="col" className="text-left p-2">{t("Description")}</th><th scope="col" className="p-2">{t("Quantity")}</th><th scope="col" className="p-2">{t("Unit Price")}</th><th scope="col" className="p-2">{t("Total")}</th></tr></thead><tbody>{invoice.lineItems.map(l=><tr key={l.id} className="border-t border-white/10"><td className="p-2">{l.description}</td><td className="p-2 text-right">{l.quantity}</td><td className="p-2 text-right">{money(l.unitPrice,invoice.currency)}</td><td className="p-2 text-right">{money(l.total,invoice.currency)}</td></tr>)}</tbody></table></div>
        <label htmlFor="review-action">{t("Review decision")}</label><select id="review-action" className="form-input" value={action} onChange={e=>setAction(e.target.value as typeof action)}><option value="approve">{t("Approve")}</option><option value="reject">{t("Reject")}</option><option value="flag">{t("Flag for Review")}</option></select>
        <label htmlFor="review-note" className="block mt-4">{t("Review note ")}{action==='approve' && !invoice.flags.length ? t('(optional)') : t('(required)')}</label><textarea id="review-note" className="form-input" rows={3} maxLength={2000} required={action!=='approve'||invoice.flags.length>0} minLength={action==='approve'&&invoice.flags.length>0 ? 10 : 1} value={note} onChange={e=>setNote(e.target.value)} />
      </>}
      {error && <p role="alert" className="text-rose-300 mt-4">{t(error)}</p>}
      <div className="flex flex-wrap gap-3 mt-5"><button type="submit" className="action-button !text-cyan-300" disabled={pending}>{pending ? t('Saving…') : editing ? t('Save Corrections') : t('Save decision')}</button><button type="button" className="action-button" disabled={pending} onClick={()=>setEditing(!editing)}>{editing ? t('Cancel Editing') : t('Edit invoice details')}</button></div>
    </form>
    <details className="ws-history"><summary>{t("Review history")}</summary><ol className="space-y-3">{invoice.auditHistory.map(h=><li key={h.id} className="border-t border-white/10 pt-3 text-sm"><p>{t(h.action)}</p><p className="text-neutral-400">{h.actor === 'Audit engine' ? t('Audit engine') : h.actor} · {new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(new Date(h.timestamp))}</p>{h.note && <p className="mt-1 break-words">{h.note}</p>}</li>)}</ol></details>
    </section></div>
  </dialog>
}

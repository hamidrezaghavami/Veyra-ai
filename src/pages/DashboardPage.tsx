import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useSession } from '../services/authService'
import { UserButton, useClerk } from '@clerk/react'
import { invoiceService } from '../services/invoiceService'
import type { InvoiceRecord, ChatMessage } from '../backend/types'
import { aiAssistantService } from '../services/aiAssistantService'
import { useRouter } from '../context/RouterContext'
import { formatMoney, downloadLedger } from '../shared/export'

type Tab = 'invoices'|'upload'|'analytics'|'assistant'
const tabs: [Tab,string][] = [['invoices','Audit Ledger'],['upload','Upload Document'],['analytics','Spend Analytics'],['assistant','AI Assistant']]
const query = () => new URLSearchParams(window.location.search)
export function DashboardPage() {
  const { data: session, isPending: checkingSession } = useSession()
  const { signOut } = useClerk()
  const { navigate } = useRouter()
  const [tab, setTab] = useState<Tab>((query().get('tab') as Tab) || 'invoices')
  const [status, setStatus] = useState(query().get('status') || 'all')
  const [search, setSearch] = useState(query().get('search') || '')
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selected, setSelected] = useState<InvoiceRecord|null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [question, setQuestion] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

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

  const visible = useMemo(() => invoices.filter(i => (status === 'all' || i.status === status) && `${i.vendor} ${i.invoiceNumber}`.toLowerCase().includes(search.toLowerCase())), [invoices,status,search])
  const currencies = [...new Set(invoices.map(i => i.currency))].sort()
  const replaceInvoice = (record: InvoiceRecord) => {
    setInvoices(list => list.map(i => i.id === record.id ? record : i))
    setSelected(record)
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
    try { const answer = await aiAssistantService.processQuestion(text); setMessages(list => [...list,answer]) }
    catch (e) { setError(e instanceof Error ? e.message : 'Assistant unavailable. Please try again.') }
    finally { setBusy(false) }
  }
  if (checkingSession || !session) return <main className="p-12 text-center" role="status">Checking your account…</main>

  return <div className="min-h-screen bg-[#080c15] text-white">
    <header className="border-b border-white/10 bg-[#0d1220] p-4 sm:px-8 flex flex-wrap items-center justify-between gap-4">
      <a href="/" className="text-xl font-semibold">Veyra AI</a>
      <div className="flex items-center gap-4"><span className="text-sm text-neutral-300">{session.user.name}</span><UserButton /><button className="action-button" onClick={async () => {
        try { await signOut({ redirectUrl: '/sign-in' }); setInvoices([]); setSelected(null) }
        catch { setError('Could not sign out. Please try again.') }
      }}>Sign Out</button></div>
    </header>
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <nav aria-label="Workspace" className="flex flex-wrap gap-2 mb-8">{tabs.map(([key,label]) => <button key={key} aria-current={tab===key ? 'page' : undefined} onClick={() => { setTab(key); setError('') }} className={`action-button ${tab===key ? '!border-cyan-400 !text-cyan-300' : ''}`}>{label}</button>)}</nav>
      <h1 className="text-3xl mb-3">{tabs.find(([key]) => key===tab)?.[1] || 'Audit Ledger'}</h1>
      <p className="text-neutral-400 mb-6">Your documents, findings, and review history are saved to your account.</p>
      {error && <div role="alert" className="rounded-xl border border-rose-400/40 bg-rose-400/10 text-rose-200 p-4 mb-5">{error}</div>}
      <p role="status" className="text-emerald-300 mb-4">{notice}</p>
      {loading ? <p role="status">Loading invoices…</p> : <>
        {tab === 'invoices' && <>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-48"><label htmlFor="ledger-search">Search invoices</label><input id="ledger-search" className="form-input" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Vendor or invoice number…" /></div>
            <div><label htmlFor="ledger-status">Status</label><select id="ledger-status" className="form-input" value={status} onChange={e => setStatus(e.target.value)}>{['all','Pending Audit','Flagged','Approved','Rejected'].map(s => <option key={s} value={s}>{s==='all' ? 'All Statuses' : s}</option>)}</select></div>
            <button className="action-button self-end" disabled={!visible.length} onClick={() => downloadLedger(visible)}>Export CSV</button>
          </div>
          {!visible.length ? <div className="surface-card p-8 text-center"><h2 className="text-xl mb-3">{invoices.length ? 'No matching invoices' : 'Your ledger is empty'}</h2><p className="text-neutral-400 mb-5">{invoices.length ? 'Try a different search or status.' : 'Upload an invoice to begin your first review.'}</p><button className="action-button" onClick={() => setTab('upload')}>Upload Document</button></div> : <div className="overflow-x-auto surface-card"><table className="w-full min-w-[680px] text-left text-sm"><caption className="sr-only">Your invoice ledger</caption><thead className="bg-white/5"><tr>{['Invoice','Vendor','Amount','Status','Review'].map(title => <th scope="col" className="p-4" key={title}>{title}</th>)}</tr></thead><tbody>{visible.map(i => <tr key={i.id} className="border-t border-white/10"><td className="p-4 break-words max-w-56">{i.invoiceNumber}<span className="block text-xs text-neutral-400">{i.issueDate}</span></td><td className="p-4 break-words max-w-64">{i.vendor}</td><td className="p-4 tabular-nums whitespace-nowrap">{formatMoney(i.total,i.currency)}</td><td className="p-4">{i.status}{i.flags.length > 0 && <span className="block text-amber-300 text-xs">{i.flags.length} finding(s) retained</span>}</td><td className="p-4"><button className="action-button" onClick={() => setSelected(i)} aria-label={`Review invoice ${i.invoiceNumber}`}>Review</button></td></tr>)}</tbody></table></div>}
        </>}
        {tab === 'upload' && <section className="surface-card max-w-2xl p-6 sm:p-10">
          <h2 className="text-xl mb-4">Upload an invoice or receipt</h2><p className="text-neutral-400 mb-6">PDF, PNG, JPEG, WebP, or structured invoice JSON. Maximum 2.8 MB. AI reads the document contents; you review every result.</p>
          <label htmlFor="invoice-file" className="block mb-3">Choose document</label><input ref={fileInput} id="invoice-file" name="document" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.json" disabled={busy} onChange={e => upload(e.target.files?.[0])} className="block max-w-full" />
          {busy && <p role="status" className="text-cyan-300 mt-5">Reading document and checking calculations…</p>}
          <p className="text-sm text-neutral-400 mt-6">Document contents are sent to Google Gemini for extraction. Google’s free-tier terms permit use of submitted content to improve its products. Use non-sensitive documents. The original file is not retained; extracted fields and audit history are saved.</p>
        </section>}
        {tab === 'analytics' && <div className="space-y-6">{!invoices.length && <p>Upload invoices to see your spending.</p>}{currencies.map(currency => {
          const group = invoices.filter(i => i.currency===currency)
          const approved = group.filter(i => i.status==='Approved').reduce((sum,i) => sum+i.total,0)
          const pending = group.filter(i => !['Approved','Rejected'].includes(i.status)).reduce((sum,i) => sum+i.total,0)
          const categories = group.filter(i => i.status !== 'Rejected').reduce((out,i) => {out[i.vendorCategory]=(out[i.vendorCategory]||0)+i.total;return out},{} as Record<string,number>)
          return <section className="surface-card p-6" key={currency}><h2 className="text-xl mb-5">{currency} Ledger</h2><div className="grid sm:grid-cols-3 gap-5 mb-8">{[['Approved',approved],['Awaiting Review',pending],['Rejected',group.filter(i => i.status==='Rejected').reduce((sum,i)=>sum+i.total,0)]].map(([label,amount]) => <div key={label}><p className="text-neutral-400 text-sm">{label}</p><p className="text-2xl tabular-nums mt-2">{formatMoney(Number(amount),currency)}</p></div>)}</div><h3 className="text-lg mb-4">By Category (Excluding Rejected)</h3>{Object.entries(categories).sort((a,b)=>b[1]-a[1]).map(([category,amount]) => <div key={category} className="flex justify-between gap-4 border-t border-white/10 py-3"><span>{category}</span><span className="tabular-nums">{formatMoney(amount,currency)}</span></div>)}</section>
        })}</div>}
        {tab === 'assistant' && <section className="surface-card max-w-3xl p-6"><p className="text-neutral-400 mb-5">Ask about your saved ledger. Answers may contain mistakes; review invoice records before making decisions.</p><div className="max-h-[50vh] overflow-y-auto space-y-4 mb-6" role="log" aria-label="Financial assistant conversation" aria-live="polite">{messages.map(m => <div key={m.id} className={`rounded-xl p-4 whitespace-pre-wrap break-words ${m.sender==='user' ? 'bg-cyan-400/10' : 'bg-white/5'}`}><p className="text-xs text-neutral-400 mb-2">{m.sender==='user' ? 'You' : 'Veyra Assistant'}</p>{m.text}</div>)}</div><form onSubmit={ask}><label htmlFor="assistant-question">Your question</label><textarea id="assistant-question" className="form-input" rows={3} maxLength={2000} value={question} onChange={e=>setQuestion(e.target.value)} required /><button className="action-button mt-4" disabled={busy}>{busy ? 'Thinking…' : 'Ask Assistant'}</button></form></section>}
      </>}
    </div>
    {selected && <ReviewDialog invoice={selected} onClose={() => setSelected(null)} onSave={replaceInvoice} />}
  </div>
}

function ReviewDialog({ invoice, onClose, onSave }: {invoice: InvoiceRecord; onClose:()=>void; onSave:(record:InvoiceRecord)=>void}) {
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
  return <dialog ref={dialog} onCancel={event => { if(pending)event.preventDefault(); else onClose() }} aria-labelledby="invoice-review-title" className="w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain rounded-2xl bg-[#111827] border border-white/15 text-white p-6 sm:p-8 backdrop:bg-black/75">
    <div className="flex items-start justify-between gap-4 mb-5"><h2 id="invoice-review-title" className="text-2xl">Review {invoice.invoiceNumber}</h2><button type="button" className="action-button" disabled={pending} onClick={onClose}>Close</button></div>
    <p className="text-neutral-400 mb-5">{invoice.vendor} · {invoice.status} · {formatMoney(invoice.total,invoice.currency)}</p>
    {invoice.flags.map(f => <p key={f.id} className="text-amber-200 border border-amber-400/20 rounded-lg p-3 mb-3">{f.message}</p>)}
    <form onSubmit={submit} aria-busy={pending}>
      {editing ? <><p className="text-sm text-neutral-400 mb-4">Corrections re-run validation and reset approval.</p><div className="grid sm:grid-cols-2 gap-4">{(['vendor','invoiceNumber','issueDate','dueDate','currency','subtotal','taxRate','taxAmount','total'] as const).map(field => <div key={field}><label htmlFor={`edit-${field}`}>{({vendor:'Vendor',invoiceNumber:'Invoice Number',issueDate:'Issue Date',dueDate:'Due Date',currency:'Currency',subtotal:'Subtotal',taxRate:'Tax Rate (Fraction)',taxAmount:'Tax Amount',total:'Total'})[field]}</label><input id={`edit-${field}`} className="form-input" type={typeof draft[field]==='number' ? 'number' : field.endsWith('Date') ? 'date' : 'text'} step="any" min={typeof draft[field]==='number' ? 0 : undefined} required value={draft[field]} onChange={e=>setDraft({...draft,[field]:typeof draft[field]==='number' ? Number(e.target.value) : e.target.value})}/></div>)}</div><h3 className="text-lg mt-6 mb-3">Line Items</h3>{draft.lineItems.map((line,index) => <fieldset key={index} className="border border-white/10 p-3 rounded-xl mb-3"><legend className="text-sm">Item {index+1}</legend>{(['description','quantity','unitPrice','total'] as const).map(field => <div key={field}><label htmlFor={`line-${index}-${field}`}>{({description:'Description',quantity:'Quantity',unitPrice:'Unit Price',total:'Line Total'})[field]}</label><input id={`line-${index}-${field}`} className="form-input" type={field==='description' ? 'text' : 'number'} step="any" required min={field==='quantity' ? 0.000001 : field==='description' ? undefined : 0} value={line[field]} onChange={e=>setDraft({...draft,lineItems:draft.lineItems.map((l,j)=>j===index ? {...l,[field]:field==='description' ? e.target.value : Number(e.target.value)} : l)})} /></div>)}</fieldset>)}</> : <>
        <dl className="grid grid-cols-2 gap-3 mb-5"><dt>Issue Date</dt><dd>{invoice.issueDate}</dd><dt>Due Date</dt><dd>{invoice.dueDate}</dd><dt>Subtotal</dt><dd>{formatMoney(invoice.subtotal,invoice.currency)}</dd><dt>Tax</dt><dd>{formatMoney(invoice.taxAmount,invoice.currency)} ({invoice.taxRate*100}%)</dd></dl>
        <div className="overflow-x-auto"><table className="w-full text-sm mb-6"><caption className="sr-only">Invoice line items</caption><thead><tr><th scope="col" className="text-left p-2">Description</th><th scope="col" className="p-2">Quantity</th><th scope="col" className="p-2">Unit Price</th><th scope="col" className="p-2">Total</th></tr></thead><tbody>{invoice.lineItems.map(l=><tr key={l.id} className="border-t border-white/10"><td className="p-2">{l.description}</td><td className="p-2 text-right">{l.quantity}</td><td className="p-2 text-right">{formatMoney(l.unitPrice,invoice.currency)}</td><td className="p-2 text-right">{formatMoney(l.total,invoice.currency)}</td></tr>)}</tbody></table></div>
        <label htmlFor="review-action">Review decision</label><select id="review-action" className="form-input" value={action} onChange={e=>setAction(e.target.value as typeof action)}><option value="approve">Approve</option><option value="reject">Reject</option><option value="flag">Flag for Review</option></select>
        <label htmlFor="review-note" className="block mt-4">Review note {action==='approve' && !invoice.flags.length ? '(optional)' : '(required)'}</label><textarea id="review-note" className="form-input" rows={3} maxLength={2000} required={action!=='approve'||invoice.flags.length>0} minLength={action==='approve'&&invoice.flags.length>0 ? 10 : 1} value={note} onChange={e=>setNote(e.target.value)} />
      </>}
      {error && <p role="alert" className="text-rose-300 mt-4">{error}</p>}
      <div className="flex flex-wrap gap-3 mt-5"><button type="submit" className="action-button !text-cyan-300" disabled={pending}>{pending ? 'Saving…' : editing ? 'Save Corrections' : 'Confirm Decision'}</button><button type="button" className="action-button" disabled={pending} onClick={()=>setEditing(!editing)}>{editing ? 'Cancel Editing' : 'Correct Fields'}</button></div>
    </form>
    <h3 className="text-lg mt-8 mb-3">Audit History</h3><ol className="space-y-3">{invoice.auditHistory.map(h=><li key={h.id} className="border-t border-white/10 pt-3 text-sm"><p>{h.action}</p><p className="text-neutral-400">{h.actor} · {new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(h.timestamp))}</p>{h.note && <p className="mt-1 break-words">{h.note}</p>}</li>)}</ol>
  </dialog>
}

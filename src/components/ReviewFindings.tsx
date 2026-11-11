import { AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import type { InvoiceRecord } from '../shared/types'

const fieldLabels: Record<string, string> = {
  total: 'Total', subtotal: 'Subtotal', taxAmount: 'Tax', invoiceNumber: 'Invoice Number', lineItems: 'Line Items',
}

export function ReviewFindings({ invoice, selected, onSelect }: {
  invoice: InvoiceRecord
  selected: number
  onSelect: (index: number) => void
}) {
  const { t } = useLanguage()
  return <section className="ws-findings" aria-label={t('Review findings')}>
    <div className="ws-section-heading">
      <h3>{t('Review findings')}</h3>
      <span>{invoice.flags.length ? t('{count} to check', { count: invoice.flags.length }) : t('Checks passed')}</span>
    </div>
    {invoice.flags.length ? invoice.flags.map((flag, index) => (
      <button key={`${flag.id}-${index}`} type="button" className="ws-finding" aria-pressed={selected === index} onClick={() => onSelect(index)}>
        <span className="ws-finding-icon"><AlertTriangle size={16} aria-hidden="true" /></span>
        <span>
          <strong>{t(fieldLabels[flag.field || ''] || 'Review')}</strong>
          <span>{t(flag.message)}</span>
        </span>
        <ArrowUpRight size={15} aria-hidden="true" />
      </button>
    )) : <p className="ws-checks-passed">
      <CheckCircle2 size={17} aria-hidden="true" />{t('The numbers reconcile. Compare the document before approving.')}
    </p>}
  </section>
}

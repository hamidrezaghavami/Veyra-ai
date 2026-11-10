import { translate } from '../i18n/translate'
import type { InvoiceRecord } from './types'
export const formatMoney = (value: number, currency: string, locale?: string) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value)
export function csvCell(value: unknown) {
  let text = String(value ?? '')
  if (/^[\s]*[=+@\-\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}
export function downloadLedger(invoices: InvoiceRecord[], language: 'en'|'tr' = 'en') {
  const rows = [['Invoice','Vendor','Date','Currency','Subtotal','Tax','Total','Status','Findings'].map(label => translate(label, language)), ...invoices.map(i => [i.invoiceNumber,i.vendor,i.issueDate,i.currency,i.subtotal,i.taxAmount,i.total,translate(i.status,language),i.flags.map(f=>translate(f.message,language)).join('; ')])]
  const url = URL.createObjectURL(new Blob(['\uFEFF'+rows.map(row => row.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}))
  const link = document.createElement('a');link.href=url;link.download='veyra-ledger.csv';link.click();URL.revokeObjectURL(url)
}

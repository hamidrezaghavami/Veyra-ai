import type { InvoiceRecord } from './types'
export function reviewQueue(invoices: InvoiceRecord[]) {
  return invoices.filter(i => i.status === 'Pending Audit' || i.status === 'Flagged').sort((a,b) =>
    Number(b.status === 'Flagged') - Number(a.status === 'Flagged') || Number(b.flags?.some(f => f.severity === 'critical') || false) - Number(a.flags?.some(f => f.severity === 'critical') || false) || a.dueDate.localeCompare(b.dueDate) || a.id.localeCompare(b.id))
}

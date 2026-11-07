import { auditInvoice } from '../../shared/audit.ts'
import type { InvoiceRecord } from '../types.ts'
export class AuditEngine {
  static runAudit(invoice: InvoiceRecord, existing: InvoiceRecord[]) {
    const flags = auditInvoice(invoice, existing)
    return { flags, status: flags.length ? 'Flagged' as const : 'Pending Audit' as const }
  }
}

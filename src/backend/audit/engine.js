import { auditInvoice } from '../../shared/audit.js'

export class AuditEngine {
  static runAudit(invoice, existing) {
    const flags = auditInvoice(invoice, existing)
    return { flags, status: flags.length ? 'Flagged' : 'Pending Audit' }
  }
}

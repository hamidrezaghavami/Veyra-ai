import { randomUUID } from 'node:crypto'
import { db } from '../db/store.ts'
import { AuditEngine } from '../audit/engine.ts'
import { GeminiClient } from '../gemini/client.ts'
import { invoiceFields, uploadSchema } from '../validation.ts'
import type { InvoiceRecord, AuditAction } from '../types.ts'
import type { z } from 'zod'

const history = (actor: string, action: string, note?: string): AuditAction => ({ id: randomUUID(), actor, action, note, timestamp: new Date().toISOString() })
export const InvoiceService = {
  getAll: (ownerId: string) => db.getInvoices(ownerId),
  async ingestAndAudit(ownerId: string, actor: string, input: z.infer<typeof uploadSchema>) {
    const extracted = await GeminiClient.extractInvoiceData(input)
    const record: InvoiceRecord = {
      ...extracted.fields,
      lineItems: extracted.fields.lineItems.map(item => ({ ...item, id: randomUUID() })),
      id: randomUUID(), status: 'Pending Audit', flags: [], confidenceScore: 0,
      fileName: input.fileName, extractedByAI: extracted.extractedByAI,
      auditHistory: [history(actor, extracted.extractedByAI ? 'Document extracted by AI; review required' : 'Structured invoice imported')],
    }
    return db.addInvoice(ownerId, record, (candidate, existing) => {
      const audit = AuditEngine.runAudit(candidate, existing)
      Object.assign(candidate, audit)
      candidate.auditHistory.push(history('Audit engine', 'Validation completed', audit.flags.map(f=>f.message).join(' ') || 'Arithmetic and duplicate checks passed. Human approval is required.'))
      return candidate
    })
  },
  async approve(ownerId: string, id: string, actor: string, note: string) {
    return db.updateInvoice(ownerId, id, item => {
      if (item.status === 'Approved') throw Object.assign(new Error('This invoice is already approved.'), { status: 409 })
      if (item.flags.length && note.trim().length < 10) throw Object.assign(new Error('Explain why you are approving the flagged invoice (at least 10 characters).'), { status: 400 })
      item.status = 'Approved'
      // Preserve findings and the reviewer explanation for the audit trail.
      item.auditHistory.unshift(history(actor, 'Invoice approved', note))
      return item
    })
  },
  async reject(ownerId: string, id: string, actor: string, note: string) {
    return db.updateInvoice(ownerId, id, item => {
      item.status = 'Rejected'
      item.auditHistory.unshift(history(actor, 'Invoice rejected', note))
      return item
    })
  },
  async flag(ownerId: string, id: string, actor: string, note: string) {
    return db.updateInvoice(ownerId, id, item => {
      item.status = 'Flagged'
      item.auditHistory.unshift(history(actor, 'Flagged for review', note))
      return item
    })
  },
  async update(ownerId: string, id: string, actor: string, fields: z.infer<typeof invoiceFields>) {
    return db.updateInvoice(ownerId, id, (item, existing) => {
      const updated: InvoiceRecord = { ...item, ...fields, lineItems: fields.lineItems.map(line => ({ ...line, id: line.id || randomUUID() })) }
      Object.assign(updated, AuditEngine.runAudit(updated, existing))
      updated.auditHistory.unshift(history(actor, 'Invoice corrected and approval reset', 'Edited records require a fresh review.'))
      return updated
    })
  },
}

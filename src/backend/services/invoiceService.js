import { randomUUID } from 'node:crypto'
import { db } from '../db/store.js'
import { AuditEngine } from '../audit/engine.js'
import { GeminiClient } from '../gemini/client.js'

const history = (actor, action, note) => ({
  id: randomUUID(),
  actor,
  action,
  note,
  timestamp: new Date().toISOString(),
})
export const InvoiceService = {
  getAll: (ownerId) => db.getInvoices(ownerId),
  async ingestAndAudit(ownerId, actor, input) {
    const bytes = Buffer.from(input.data, 'base64')
    if (!bytes.length || bytes.length > 2_800_000) throw Object.assign(new Error('Choose a document smaller than 2.8 MB.'), { status: 400 })
    const extracted = await GeminiClient.extractInvoiceData(input)
    const record = {
      ...extracted.fields,
      lineItems: extracted.fields.lineItems.map((item) => ({
        ...item,
        id: randomUUID(),
      })),
      id: randomUUID(),
      status: 'Pending Audit',
      flags: [],
      confidenceScore: 0,
      fileName: input.fileName,
      extractedByAI: extracted.extractedByAI,
      auditHistory: [
        history(
          actor,
          extracted.extractedByAI
            ? 'Document extracted by AI; review required'
            : 'Structured invoice imported'
        ),
      ],
    }
    return db.addInvoice(ownerId, record, (candidate, existing) => {
      const audit = AuditEngine.runAudit(candidate, existing)
      Object.assign(candidate, audit)
      candidate.auditHistory.push(
        history(
          'Audit engine',
          'Validation completed',
          audit.flags.map((f) => f.message).join(' ') ||
            'Arithmetic and duplicate checks passed. Human approval is required.'
        )
      )
      return candidate
    }, { fileName: input.fileName, fileType: input.fileType, bytes })
  },
  async approve(ownerId, id, actor, note) {
    return db.updateInvoice(ownerId, id, (item) => {
      if (item.status === 'Approved')
        throw Object.assign(new Error('This invoice is already approved.'), {
          status: 409,
        })
      if (item.flags.length && note.trim().length < 10)
        throw Object.assign(
          new Error(
            'Explain why you are approving the flagged invoice (at least 10 characters).'
          ),
          { status: 400 }
        )
      item.status = 'Approved'
      // Preserve findings and the reviewer explanation for the audit trail.
      item.auditHistory.unshift(history(actor, 'Invoice approved', note))
      return item
    })
  },
  async reject(ownerId, id, actor, note) {
    return db.updateInvoice(ownerId, id, (item) => {
      item.status = 'Rejected'
      item.auditHistory.unshift(history(actor, 'Invoice rejected', note))
      return item
    })
  },
  async flag(ownerId, id, actor, note) {
    return db.updateInvoice(ownerId, id, (item) => {
      item.status = 'Flagged'
      item.auditHistory.unshift(history(actor, 'Flagged for review', note))
      return item
    })
  },
  async update(ownerId, id, actor, fields) {
    return db.updateInvoice(ownerId, id, (item, existing) => {
      const updated = {
        ...item,
        ...fields,
        lineItems: fields.lineItems.map((line) => ({
          ...line,
          id: line.id || randomUUID(),
        })),
      }
      Object.assign(updated, AuditEngine.runAudit(updated, existing))
      updated.auditHistory.unshift(
        history(
          actor,
          'Invoice corrected and approval reset',
          'Edited records require a fresh review.'
        )
      )
      return updated
    })
  },
}

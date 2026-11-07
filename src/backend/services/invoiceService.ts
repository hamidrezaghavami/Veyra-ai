import { db } from '../db/store.ts'
import { AuditEngine } from '../audit/engine.ts'
import { GeminiClient } from '../gemini/client.ts'
import { InvoiceRecord, LineItem, VendorCategory } from '../types.ts'

export class InvoiceService {
  static getAll(filters?: { status?: string; search?: string; category?: string }): InvoiceRecord[] {
    let list = db.getInvoices()

    if (filters?.status && filters.status !== 'all') {
      const s = filters.status.toLowerCase()
      list = list.filter((i) => i.status.toLowerCase() === s || (s === 'flagged' && i.flags.length > 0))
    }

    if (filters?.category && filters.category !== 'all') {
      list = list.filter((i) => i.vendorCategory.toLowerCase() === filters.category!.toLowerCase())
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(
        (i) =>
          i.vendor.toLowerCase().includes(q) ||
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.lineItems.some((li) => li.description.toLowerCase().includes(q))
      )
    }

    return list
  }

  static getById(id: string): InvoiceRecord | null {
    return db.getInvoiceById(id) || null
  }

  /**
   * Upload & Ingest invoice with Gemini OCR + Deterministic Audit Rule Engine
   */
  static async ingestAndAudit(payload: {
    fileName?: string
    fileType?: string
    textSnippet?: string
    mockScenario?: string
    actor?: string
  }): Promise<InvoiceRecord> {
    const existing = db.getInvoices()

    // Step 1: Extract data using Gemini Vision / AI
    const extracted = await GeminiClient.extractInvoiceData({
      fileName: payload.fileName,
      fileType: payload.fileType,
      text: payload.textSnippet,
      mockScenario: payload.mockScenario,
    })

    const newId = `inv-${Date.now().toString(36)}`

    // Step 2: Build record candidate
    const candidate: InvoiceRecord = {
      id: newId,
      invoiceNumber: extracted.invoiceNumber,
      vendor: extracted.vendor,
      vendorCategory: extracted.vendorCategory,
      issueDate: extracted.issueDate,
      dueDate: extracted.dueDate,
      subtotal: extracted.subtotal,
      taxRate: extracted.taxRate,
      taxAmount: extracted.taxAmount,
      total: extracted.total,
      currency: extracted.currency,
      status: 'Pending Audit',
      confidenceScore: extracted.confidenceScore,
      fileName: payload.fileName || 'uploaded-invoice.pdf',
      aiAnalysisSummary: extracted.aiSummary,
      lineItems: extracted.lineItems,
      flags: [],
      auditHistory: [
        {
          id: `ah-${Date.now()}-1`,
          action: 'Document Ingestion & Gemini Vision OCR Complete',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          actor: 'Veyra Gemini OCR Agent',
          note: `Extracted ${extracted.lineItems.length} line items with ${(extracted.confidenceScore * 100).toFixed(1)}% confidence.`,
        },
      ],
    }

    // Step 3: Run deterministic audit validation engine
    const auditResult = AuditEngine.runAudit(candidate, existing)
    candidate.flags = auditResult.flags
    candidate.status = auditResult.status

    if (candidate.flags.length > 0) {
      candidate.auditHistory.unshift({
        id: `ah-${Date.now()}-2`,
        action: `Audit Completed: ${candidate.flags.length} Flag(s) Raised`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actor: 'Automated Audit Engine',
        note: candidate.flags.map((f) => f.message).join(' '),
      })
    } else {
      candidate.auditHistory.unshift({
        id: `ah-${Date.now()}-2`,
        action: 'Audit Completed: Calculations & Duplicates Cleared',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actor: 'Automated Audit Engine',
        note: 'All mathematical and compliance checks passed without discrepancies.',
      })
    }

    db.addInvoice(candidate)
    return candidate
  }

  static approve(id: string, actor: string = 'Finance Controller'): InvoiceRecord {
    const inv = db.getInvoiceById(id)
    if (!inv) throw new Error(`Invoice with id "${id}" not found.`)

    const updated = db.updateInvoice(id, (item) => {
      item.status = 'Approved'
      item.flags = []
      item.auditHistory.unshift({
        id: `ah-${Date.now()}`,
        action: 'Invoice Approved for Disbursement',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actor,
        note: 'Verified and authorized for Accounts Payable disbursement ledger.',
      })
      return item
    })

    return updated!
  }

  static reject(id: string, reason: string, actor: string = 'Finance Controller'): InvoiceRecord {
    const inv = db.getInvoiceById(id)
    if (!inv) throw new Error(`Invoice with id "${id}" not found.`)

    const updated = db.updateInvoice(id, (item) => {
      item.status = 'Rejected'
      item.auditHistory.unshift({
        id: `ah-${Date.now()}`,
        action: 'Invoice Rejected',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actor,
        note: reason || 'Rejected by finance reviewer.',
      })
      return item
    })

    return updated!
  }

  static flagForReview(id: string, comment: string, actor: string = 'Auditor'): InvoiceRecord {
    const inv = db.getInvoiceById(id)
    if (!inv) throw new Error(`Invoice with id "${id}" not found.`)

    const updated = db.updateInvoice(id, (item) => {
      item.status = 'Flagged'
      item.auditHistory.unshift({
        id: `ah-${Date.now()}`,
        action: 'Flagged for Human Review',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actor,
        note: comment,
      })
      return item
    })

    return updated!
  }

  static updateInvoice(id: string, updates: Partial<InvoiceRecord>, actor: string = 'Current User'): InvoiceRecord {
    const inv = db.getInvoiceById(id)
    if (!inv) throw new Error(`Invoice with id "${id}" not found.`)

    const existing = db.getInvoices().filter((i) => i.id !== id)

    const updated = db.updateInvoice(id, (item) => {
      const merged = { ...item, ...updates }
      // Re-run audit checks on updated fields
      const audit = AuditEngine.runAudit(merged, existing)
      merged.flags = audit.flags
      if (audit.flags.length > 0 && merged.status !== 'Rejected') {
        merged.status = 'Flagged'
      } else if (audit.flags.length === 0 && merged.status === 'Flagged') {
        merged.status = 'Pending Audit'
      }

      merged.auditHistory.unshift({
        id: `ah-${Date.now()}`,
        action: 'Manual Correction Applied',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actor,
        note: 'Fields corrected and re-checked by automated verification rules.',
      })

      return merged
    })

    return updated!
  }

  static deleteInvoice(id: string): boolean {
    return db.deleteInvoice(id)
  }

  static resetDefaults(): InvoiceRecord[] {
    return db.resetInvoices()
  }
}

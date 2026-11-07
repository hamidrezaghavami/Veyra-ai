import { Router, Request, Response } from 'express'
import { InvoiceService } from '../services/invoiceService.ts'

export const invoiceRouter = Router()

// List all invoices with optional query filters
invoiceRouter.get('/', (req: Request, res: Response) => {
  try {
    const { status, category, search } = req.query
    const invoices = InvoiceService.getAll({
      status: status as string,
      category: category as string,
      search: search as string,
    })
    res.json({ success: true, count: invoices.length, data: invoices })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Get invoice by ID
invoiceRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const invoice = InvoiceService.getById(req.params.id)
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' })
    }
    res.json({ success: true, data: invoice })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Ingest & Audit document via Gemini AI
invoiceRouter.post('/upload-and-audit', async (req: Request, res: Response) => {
  try {
    const { fileName, fileType, textSnippet, mockScenario, actor } = req.body
    const audited = await InvoiceService.ingestAndAudit({
      fileName,
      fileType,
      textSnippet,
      mockScenario,
      actor,
    })
    res.status(201).json({ success: true, data: audited })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Approve invoice
invoiceRouter.patch('/:id/approve', (req: Request, res: Response) => {
  try {
    const { actor } = req.body
    const approved = InvoiceService.approve(req.params.id, actor)
    res.json({ success: true, data: approved })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// Reject invoice
invoiceRouter.patch('/:id/reject', (req: Request, res: Response) => {
  try {
    const { reason, actor } = req.body
    const rejected = InvoiceService.reject(req.params.id, reason, actor)
    res.json({ success: true, data: rejected })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// Flag invoice for human review
invoiceRouter.patch('/:id/flag', (req: Request, res: Response) => {
  try {
    const { comment, actor } = req.body
    const flagged = InvoiceService.flagForReview(req.params.id, comment, actor)
    res.json({ success: true, data: flagged })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// Update invoice fields & re-audit
invoiceRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const { updates, actor } = req.body
    const updated = InvoiceService.updateInvoice(req.params.id, updates || req.body, actor)
    res.json({ success: true, data: updated })
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// Delete invoice
invoiceRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const ok = InvoiceService.deleteInvoice(req.params.id)
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' })
    }
    res.json({ success: true, message: 'Invoice deleted successfully.' })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Reset to seed defaults
invoiceRouter.post('/reset', (_req: Request, res: Response) => {
  try {
    const reset = InvoiceService.resetDefaults()
    res.json({ success: true, message: 'Database reset to default seeds.', data: reset })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

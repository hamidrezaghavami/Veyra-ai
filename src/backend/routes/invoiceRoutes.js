import { Router } from 'express'
import { z } from 'zod'
import { InvoiceService } from '../services/invoiceService.js'
import { invoiceFields, uploadSchema } from '../validation.js'
export const invoiceRouter = Router()
invoiceRouter.get('/', async (_req, res) => {
  const data = await InvoiceService.getAll(res.locals.user.id)
  res.json({ success: true, data })
})
invoiceRouter.post('/upload-and-audit', async (req, res) => {
  const data = await InvoiceService.ingestAndAudit(
    res.locals.user.id,
    res.locals.user.email,
    uploadSchema.parse(req.body)
  )
  res.status(201).json({ success: true, data })
})
for (const action of ['approve', 'reject', 'flag']) {
  invoiceRouter.patch(`/:id/${action}`, async (req, res) => {
    const id = z.uuid().parse(req.params.id)
    const { note } = z
      .object({
        note: z
          .string()
          .trim()
          .min(action === 'approve' ? 0 : 1)
          .max(2000),
      })
      .strict()
      .parse(req.body)
    const data = await InvoiceService[action](
      res.locals.user.id,
      id,
      res.locals.user.email,
      note
    )
    res.json({ success: true, data })
  })
}
invoiceRouter.put('/:id', async (req, res) => {
  const data = await InvoiceService.update(
    res.locals.user.id,
    z.uuid().parse(req.params.id),
    res.locals.user.email,
    invoiceFields.parse(req.body)
  )
  res.json({ success: true, data })
})

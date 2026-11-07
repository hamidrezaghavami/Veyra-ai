import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db/store.ts'
import { contactSchema } from '../validation.ts'
export const formRouter = Router()
formRouter.post('/waitlist', async (req, res) => {
  const { email } = z.object({ email: z.email().max(254).transform(s => s.toLowerCase()) }).strict().parse(req.body)
  const data = await db.addWaitlist(email)
  res.status(201).json({ success: true, data })
})
formRouter.post('/contact', async (req, res) => {
  const data = await db.addContact(contactSchema.parse(req.body))
  res.status(201).json({ success: true, data })
})

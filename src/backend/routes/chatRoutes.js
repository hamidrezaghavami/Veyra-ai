import { Router } from 'express'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { db } from '../db/store.js'
import { GeminiClient } from '../gemini/client.js'
export const chatRouter = Router()
chatRouter.post('/', async (req, res) => {
  const { message } = z
    .object({ message: z.string().trim().min(1).max(2000) })
    .strict()
    .parse(req.body)
  const result = await GeminiClient.answerFinancialQuery(
    message,
    await db.getInvoices(res.locals.user.id)
  )
  res.json({
    success: true,
    data: {
      id: randomUUID(),
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      ...result,
    },
  })
})

import { Router, Request, Response } from 'express'
import { ChatService } from '../services/chatService.ts'

export const chatRouter = Router()

chatRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { message } = req.body
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Query message is required.' })
    }

    const response = await ChatService.handleUserQuery(message)
    res.json({ success: true, data: response })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

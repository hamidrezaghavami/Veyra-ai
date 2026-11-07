import { Router, Request, Response } from 'express'
import { FormService } from '../services/formService.ts'

export const formRouter = Router()

formRouter.post('/waitlist', (req: Request, res: Response) => {
  try {
    const { email, teamSize, useCase } = req.body
    const result = FormService.joinWaitlist(email, teamSize, useCase)
    res.status(201).json(result)
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

formRouter.post('/contact', (req: Request, res: Response) => {
  try {
    const { name, email, company, inquiryType, message } = req.body
    const result = FormService.submitContact(name, email, company, inquiryType, message)
    res.status(201).json(result)
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message })
  }
})

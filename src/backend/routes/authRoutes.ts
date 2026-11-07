import { Router, Request, Response } from 'express'
import { AuthService } from '../services/authService.ts'

export const authRouter = Router()

authRouter.post('/send-otp', (req: Request, res: Response) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' })
    }
    const result = AuthService.requestOtp(email)
    res.json(result)
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

authRouter.post('/verify-otp', (req: Request, res: Response) => {
  try {
    const { email, code } = req.body
    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Email and verification code are required.' })
    }
    const result = AuthService.verifyOtp(email, code)
    if (!result.success) {
      return res.status(400).json(result)
    }
    res.json(result)
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

authRouter.get('/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.replace(/^Bearer\s+/i, '')
    if (!token) {
      return res.status(401).json({ success: false, error: 'Not authenticated.' })
    }

    const session = AuthService.validateSession(token)
    if (!session) {
      return res.status(401).json({ success: false, error: 'Session expired.' })
    }

    res.json({ success: true, user: session })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

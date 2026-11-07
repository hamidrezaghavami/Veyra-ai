import { Router, Request, Response } from 'express'
import { AnalyticsService } from '../services/analyticsService.ts'

export const analyticsRouter = Router()

analyticsRouter.get('/', (_req: Request, res: Response) => {
  try {
    const metrics = AnalyticsService.getMetrics()
    res.json({ success: true, data: metrics })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

import express from 'express'
import cors from 'cors'
import { invoiceRouter } from './routes/invoiceRoutes.ts'
import { chatRouter } from './routes/chatRoutes.ts'
import { analyticsRouter } from './routes/analyticsRoutes.ts'
import { authRouter } from './routes/authRoutes.ts'
import { formRouter } from './routes/formRoutes.ts'
import { getNeonDbStatus, initNeonDb } from './db/neon.ts'

export function createBackendApp() {
  const app = express()

  // Initialize Neon DB if configured
  initNeonDb().catch(console.error)

  // Middleware
  app.use(cors({ origin: true, credentials: true }))
  app.use(express.json({ limit: '15mb' }))
  app.use(express.urlencoded({ extended: true, limit: '15mb' }))

  // Health check endpoint
  app.get('/api/health', async (_req, res) => {
    const dbStatus = await getNeonDbStatus()
    res.json({
      status: 'healthy',
      platform: 'Veyra AI Enterprise Backend',
      geminiEngine: 'Active',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    })
  })

  // Routes
  app.use('/api/invoices', invoiceRouter)
  app.use('/api/chat', chatRouter)
  app.use('/api/analytics', analyticsRouter)
  app.use('/api/auth', authRouter)
  app.use('/api', formRouter)

  // 404 Handler for API
  app.use('/api', (req, res) => {
    res.status(404).json({ success: false, error: `API route [${req.method}] ${req.originalUrl} not found.` })
  })

  return app
}

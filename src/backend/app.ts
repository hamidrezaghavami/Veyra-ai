import express from 'express'
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node'
import { createHash } from 'node:crypto'
import { ZodError } from 'zod'
import { auth } from './auth.ts'
import { pool, checkDatabase } from './db/neon.ts'
import { invoiceRouter } from './routes/invoiceRoutes.ts'
import { chatRouter } from './routes/chatRoutes.ts'
import { formRouter } from './routes/formRoutes.ts'
import { summarizeLedger } from '../shared/analytics.ts'
import { db } from './db/store.ts'

export function createBackendApp() {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', 1)
  app.use('/api', (_req, res, next) => {
    res.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
    next()
  })
  app.get('/api/health', async (_req, res) => {
    try {
      await checkDatabase()
      res.json({ status: 'healthy', application: 'veyra-ai', database: 'connected', documentAI: Boolean(process.env.GEMINI_API_KEY) })
    } catch {
      res.status(503).json({ status: 'unavailable', application: 'veyra-ai', error: 'The database is unavailable.' })
    }
  })
  app.all('/api/auth/*splat', toNodeHandler(auth))
  app.use(express.json({ limit: '4mb' }))
  app.use('/api', (req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const allowed = (process.env.TRUSTED_ORIGINS || process.env.BETTER_AUTH_URL || 'http://localhost:3000').split(',').map(s => s.trim())
      if (req.get('x-veyra-request') !== '1' || (req.get('origin') && !allowed.includes(req.get('origin')!))) {
        res.status(403).json({ success: false, error: 'Request origin could not be verified.' })
        return
      }
    }
    next()
  })
  // Shared database buckets work across serverless instances; never trust a client-supplied user ID.
  const limit = (scope: string, max: number) => async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const identity = res.locals.user?.id || req.ip || 'unknown'
      const bucket = createHash('sha256').update(`${scope}:${identity}:${Math.floor(Date.now() / 60_000)}`).digest('hex')
      const { rows } = await pool.query(`INSERT INTO veyra_request_limits(bucket, count) VALUES($1,1)
        ON CONFLICT(bucket) DO UPDATE SET count=veyra_request_limits.count+1 RETURNING count`, [bucket])
      if (rows[0].count > max) {
        res.setHeader('Retry-After', '60')
        res.status(429).json({ success: false, error: 'Too many requests. Please wait a minute and try again.' })
        return
      }
      next()
    } catch (error) { next(error) }
  }
  app.use('/api', limit('public', 100), formRouter)
  app.use(['/api/invoices', '/api/chat', '/api/analytics'], async (req, res, next) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
    if (!session) {
      res.status(401).json({ success: false, error: 'Please sign in to access your records.' })
      return
    }
    res.locals.user = session.user
    next()
  })
  app.use('/api/invoices/upload-and-audit', limit('upload', 10))
  app.use('/api/invoices', invoiceRouter)
  app.use('/api/chat', limit('chat', 15), chatRouter)
  app.get('/api/analytics', async (_req, res) => res.json({ success: true, data: summarizeLedger(await db.getInvoices(res.locals.user.id)) }))
  app.use('/api', (_req, res) => res.status(404).json({ success: false, error: 'API route not found.' }))
  app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof ZodError) {
      res.status(400).json({ success: false, error: 'Check the submitted fields.', details: error.issues.map(i => `${i.path.join('.')}: ${i.message}`) })
      return
    }
    const status = Number(error.status) || 500
    if (status >= 500) console.error('API request failed:', error.name || 'Error')
    res.status(status).json({ success: false, error: status === 500 ? 'The request could not be saved. Please try again.' : error.message })
  })
  return app
}

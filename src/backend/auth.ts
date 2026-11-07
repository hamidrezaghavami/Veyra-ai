import { betterAuth } from 'better-auth'
import { pool } from './db/neon.ts'

export const auth = betterAuth({
  appName: 'Veyra AI',
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128 },
  advanced: { ipAddress: { ipAddressHeaders: process.env.VERCEL ? ['x-vercel-forwarded-for'] : ['x-forwarded-for'] } },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  rateLimit: { enabled: true, storage: 'database', window: 60, max: 30 },
  trustedOrigins: (process.env.TRUSTED_ORIGINS || process.env.BETTER_AUTH_URL || 'http://localhost:3000').split(',').map(x => x.trim()),
})

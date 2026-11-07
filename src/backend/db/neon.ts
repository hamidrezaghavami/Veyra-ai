import { config } from '../config.ts'

export interface NeonDbStatus {
  connected: boolean
  provider: 'neon' | 'in-memory'
  message?: string
}

let isInitialized = false
let dbStatus: NeonDbStatus = {
  connected: false,
  provider: 'in-memory',
  message: 'In-memory persistent store active',
}

export async function getNeonDbStatus(): Promise<NeonDbStatus> {
  if (isInitialized) return dbStatus
  await initNeonDb()
  return dbStatus
}

export async function initNeonDb(): Promise<void> {
  if (isInitialized) return
  isInitialized = true

  const dbUrl = (config.databaseUrl || '').trim()
  if (!dbUrl) {
    console.log('📦 Neon DB: DATABASE_URL not configured. Running in-memory store.')
    dbStatus = {
      connected: false,
      provider: 'in-memory',
      message: 'Running high-performance in-memory store (zero external dependencies)',
    }
    return
  }

  try {
    // Parse connection string to extract Neon host and password
    // postgresql://[user]:[password]@[host]/[database]?sslmode=require
    const parsed = new URL(dbUrl)
    const host = parsed.hostname
    const password = decodeURIComponent(parsed.password)

    if (host.includes('neon.tech')) {
      const endpoint = `https://${host}/sql`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
          'Neon-Connection-String': dbUrl,
        },
        body: JSON.stringify({
          query: `
            CREATE TABLE IF NOT EXISTS veyra_invoices (
              id VARCHAR(64) PRIMARY KEY,
              data JSONB NOT NULL,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS veyra_waitlist (
              id VARCHAR(64) PRIMARY KEY,
              email VARCHAR(255) NOT NULL UNIQUE,
              team_size VARCHAR(64),
              use_case TEXT,
              queue_position INT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS veyra_contacts (
              id VARCHAR(64) PRIMARY KEY,
              name VARCHAR(255),
              email VARCHAR(255),
              company VARCHAR(255),
              inquiry_type VARCHAR(64),
              message TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `,
        }),
      })

      if (res.ok) {
        console.log('🐘 Neon PostgreSQL connected & tables verified via HTTP API.')
        dbStatus = {
          connected: true,
          provider: 'neon',
          message: 'Connected to Neon Serverless PostgreSQL',
        }
        return
      }
    }

    dbStatus = {
      connected: false,
      provider: 'in-memory',
      message: 'DATABASE_URL format not matched to Neon HTTP endpoint. Running in-memory.',
    }
  } catch (err: any) {
    console.warn('⚠️ Neon HTTP check failed, fallback to in-memory store:', err?.message || err)
    dbStatus = {
      connected: false,
      provider: 'in-memory',
      message: `Fallback to in-memory: ${err?.message || 'Connection error'}`,
    }
  }
}

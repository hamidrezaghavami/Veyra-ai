import 'dotenv/config'
import pg from 'pg'

// Missing production configuration must never silently use temporary storage.
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL?.replace(/sslmode=require(?=&|$)/, 'sslmode=verify-full'),
  max: 3,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
})
pool.on('error', () => console.error('Database connection lost.'))

export async function checkDatabase() {
  if (!process.env.DATABASE_URL) throw new Error('Database is not configured.')
  await pool.query('SELECT 1')
}

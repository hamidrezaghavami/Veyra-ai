import { readFile } from 'node:fs/promises'
import { pool, checkDatabase } from '../src/backend/db/neon.js'

try {
  await checkDatabase()
  await pool.query(await readFile(new URL('../migrations/001_application.sql', import.meta.url), 'utf8'))
  await pool.query(await readFile(new URL('../migrations/002_clerk_owners.sql', import.meta.url), 'utf8'))
  console.log('Application database migrations complete. Existing ledger owners preserved.')
} finally { await pool.end() }

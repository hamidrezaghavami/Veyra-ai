import { readFile } from 'node:fs/promises'
import { auth } from '../src/backend/auth.ts'
import { pool, checkDatabase } from '../src/backend/db/neon.ts'

try {
  await checkDatabase()
  const context = await auth.$context
  await context.runMigrations()
  await pool.query(await readFile(new URL('../migrations/001_application.sql', import.meta.url), 'utf8'))
  console.log('Account and application database migrations complete.')
} finally { await pool.end() }

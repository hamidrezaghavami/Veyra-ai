import { createBackendApp } from './app.ts'
import { config } from './config.ts'
import { pool } from './db/neon.ts'
const server = createBackendApp().listen(config.port, () => console.log(`Veyra API listening on port ${config.port}`))
process.on('SIGTERM', () => server.close(async () => { await pool.end() }))

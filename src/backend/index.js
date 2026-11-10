import { createBackendApp } from './app.js'
import { config } from './config.js'
import { pool } from './db/neon.js'
const server = createBackendApp().listen(config.port, () =>
  console.log(`Veyra API listening on port ${config.port}`)
)
process.on('SIGTERM', () =>
  server.close(async () => {
    await pool.end()
  })
)

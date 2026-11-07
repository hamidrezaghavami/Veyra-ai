import { createBackendApp } from './app.ts'
import { config } from './config.ts'

const app = createBackendApp()

const server = app.listen(config.port, () => {
  console.log(`=========================================`)
  console.log(`🚀 Veyra AI Backend Server Online`)
  console.log(`📡 URL: http://localhost:${config.port}`)
  console.log(`🤖 Gemini Model: ${config.geminiModel}`)
  console.log(`🛡️  Audit Engine: Active`)
  console.log(`=========================================`)
})

process.on('SIGTERM', () => {
  server.close(() => console.log('Backend server stopped.'))
})

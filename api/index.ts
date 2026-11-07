import { createBackendApp } from '../src/backend/app.ts'
export const config = { api: { bodyParser: false } }
export default createBackendApp()

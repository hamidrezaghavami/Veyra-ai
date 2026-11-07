import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  googleProject: process.env.GOOGLE_CLOUD_PROJECT || '870760192611',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  geminiFallbackModel: process.env.GEMINI_FALLBACK_MODEL || 'gemini-flash-latest',
  databaseUrl: process.env.DATABASE_URL || '',
  isDev: process.env.NODE_ENV !== 'production',
}

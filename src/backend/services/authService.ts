import { db } from '../db/store.ts'
import { UserSession } from '../types.ts'

export class AuthService {
  static requestOtp(email: string): { success: boolean; code: string; message: string } {
    const cleanEmail = email.trim().toLowerCase()
    // Generate secure 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    db.setOtp(cleanEmail, code)
    console.log(`[AuthService] Dispatched OTP code [${code}] for email: ${cleanEmail}`)

    return {
      success: true,
      code,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}. (Demo code: ${code})`,
    }
  }

  static verifyOtp(email: string, code: string): { success: boolean; error?: string; user?: UserSession } {
    const cleanEmail = email.trim().toLowerCase()
    const stored = db.getOtp(cleanEmail)

    if (!stored) {
      return { success: false, error: 'No verification code requested for this email. Please request a new code.' }
    }

    // Check expiry (15 mins)
    if (Date.now() - stored.timestamp > 15 * 60 * 1000) {
      db.deleteOtp(cleanEmail)
      return { success: false, error: 'Verification code has expired. Please request a new code.' }
    }

    if (stored.code !== code.trim()) {
      return { success: false, error: 'Invalid verification code. Please check your digits.' }
    }

    // Code matches! Clear OTP and generate session
    db.deleteOtp(cleanEmail)

    const nameFromEmail = cleanEmail.split('@')[0]
    const formattedName = nameFromEmail
      .split(/[._-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')

    const user: UserSession = {
      email: cleanEmail,
      name: formattedName || 'Finance Controller',
      role: 'Finance Controller',
      company: cleanEmail.includes('@') ? cleanEmail.split('@')[1].split('.')[0].toUpperCase() : 'Veyra Org',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}`,
      token: `sess_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`,
    }

    db.setSession(user.token, user)
    return { success: true, user }
  }

  static validateSession(token: string): UserSession | null {
    return db.getSession(token) || null
  }
}

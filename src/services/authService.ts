export interface UserSession {
  email: string
  name: string
  role: string
  company: string
  avatarUrl: string
  token: string
}

const AUTH_USER_KEY = 'veyra_auth_user'
const PENDING_OTP_KEY = 'veyra_pending_otp'

export const authService = {
  // Check if a user is currently signed in
  isAuthenticated(): boolean {
    return Boolean(this.getCurrentUser())
  },

  // Direct login or account creation
  createUserSession(email: string, name?: string): UserSession {
    const cleanEmail = email.trim().toLowerCase()
    const derivedName = name?.trim() || cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

    const user: UserSession = {
      email: cleanEmail,
      name: derivedName,
      role: 'Finance Controller',
      company: 'Veyra Org',
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`,
      token: `vyra_tk_${Date.now()}`,
    }

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
    return user
  },

  // Step 1: Request 6-digit code for email
  requestOtp(email: string, name?: string): { success: boolean; code: string } {
    const cleanEmail = email.trim().toLowerCase()
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    localStorage.setItem(
      PENDING_OTP_KEY,
      JSON.stringify({
        email: cleanEmail,
        name: name?.trim() || '',
        code,
        timestamp: Date.now(),
      })
    )

    // Notify backend
    fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    }).catch(() => {})

    return { success: true, code }
  },

  getPendingEmail(): string | null {
    try {
      const data = localStorage.getItem(PENDING_OTP_KEY)
      if (!data) return null
      return JSON.parse(data).email
    } catch {
      return null
    }
  },

  getPendingCode(): string | null {
    try {
      const data = localStorage.getItem(PENDING_OTP_KEY)
      if (!data) return null
      return JSON.parse(data).code
    } catch {
      return null
    }
  },

  // Step 2: Verify 6-digit code
  verifyOtp(code: string): { success: boolean; error?: string; user?: UserSession } {
    try {
      const data = localStorage.getItem(PENDING_OTP_KEY)
      if (!data) {
        return { success: false, error: 'No verification code requested. Please request a new code.' }
      }

      const pending = JSON.parse(data)
      if (code !== pending.code && code !== '123456') {
        return { success: false, error: 'Invalid verification code. Please check your code or enter 123456.' }
      }

      const user = this.createUserSession(pending.email, pending.name)
      localStorage.removeItem(PENDING_OTP_KEY)

      return { success: true, user }
    } catch {
      return { success: false, error: 'Failed to verify code' }
    }
  },

  getCurrentUser(): UserSession | null {
    try {
      const data = localStorage.getItem(AUTH_USER_KEY)
      if (!data) return null
      const parsed = JSON.parse(data) as UserSession

      // Automatic migration: cleanse any legacy personal developer sessions cached in localStorage
      const nameLower = (parsed.name || '').toLowerCase()
      const emailLower = (parsed.email || '').toLowerCase()
      if (
        nameLower.includes('hamid') ||
        nameLower.includes('reza') ||
        nameLower.includes('ghavami') ||
        emailLower.includes('hamid') ||
        emailLower.includes('ghavami')
      ) {
        const sanitized: UserSession = {
          ...parsed,
          name: 'Alex Morgan',
          email: 'controller@veyra.ai',
          role: 'Finance Controller',
          company: 'Veyra Org',
        }
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sanitized))
        return sanitized
      }

      return parsed
    } catch {
      return null
    }
  },

  logout() {
    localStorage.removeItem(AUTH_USER_KEY)
    localStorage.removeItem(PENDING_OTP_KEY)
  },
}

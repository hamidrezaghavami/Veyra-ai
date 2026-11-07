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
  // Step 1: Request 6-digit code for email
  requestOtp(email: string): { success: boolean; code: string } {
    const cleanEmail = email.trim().toLowerCase()
    // Generate deterministic or random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    localStorage.setItem(
      PENDING_OTP_KEY,
      JSON.stringify({
        email: cleanEmail,
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
      // Allow the actual generated code OR standard demo code '123456'
      if (code !== pending.code && code !== '123456') {
        return { success: false, error: 'Invalid verification code. Please check your email or use 123456.' }
      }

      const user: UserSession = {
        email: pending.email,
        name: pending.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        role: 'Finance Controller',
        company: 'Veyra Org',
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`,
        token: `vyra_tk_${Date.now()}`,
      }

      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
      localStorage.removeItem(PENDING_OTP_KEY)

      return { success: true, user }
    } catch {
      return { success: false, error: 'Failed to verify code' }
    }
  },

  getCurrentUser(): UserSession | null {
    try {
      const data = localStorage.getItem(AUTH_USER_KEY)
      if (!data) {
        // Return default authenticated demo user so user can test the app immediately if they want
        return {
          email: 'kadir@veyra.ai',
          name: 'Kadir Calik',
          role: 'Head of Finance',
          company: 'Veyra AI Labs',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          token: 'vyra_default_tk',
        }
      }
      return JSON.parse(data)
    } catch {
      return null
    }
  },

  logout() {
    localStorage.removeItem(AUTH_USER_KEY)
    localStorage.removeItem(PENDING_OTP_KEY)
  },
}

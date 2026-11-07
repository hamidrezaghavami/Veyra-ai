export interface WaitlistEntry {
  email: string
  position: number
  submittedAt: string
}

const WAITLIST_KEY = 'veyra_waitlist_v1'

export const waitlistService = {
  getEntries(): WaitlistEntry[] {
    try {
      const data = localStorage.getItem(WAITLIST_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  join(email: string): { position: number; alreadyJoined: boolean } {
    const cleanEmail = email.trim().toLowerCase()
    const entries = this.getEntries()
    const existing = entries.find((e) => e.email === cleanEmail)
    if (existing) {
      return { position: existing.position, alreadyJoined: true }
    }

    const position = 412 + entries.length
    entries.push({
      email: cleanEmail,
      position,
      submittedAt: new Date().toISOString(),
    })
    localStorage.setItem(WAITLIST_KEY, JSON.stringify(entries))
    return { position, alreadyJoined: false }
  },
}

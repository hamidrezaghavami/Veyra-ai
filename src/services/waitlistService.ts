import { api } from './api'
export const waitlistService = {
  join: (email: string) => api<{position: number}>('/waitlist', { method: 'POST', body: JSON.stringify({ email: email.trim() }) }),
}

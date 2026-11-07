export interface ContactMessage {
  id: string
  firstName: string
  lastName: string
  email: string
  company?: string
  subject: string
  message: string
  submittedAt: string
}

const CONTACT_KEY = 'veyra_contact_inquiries'

export const contactService = {
  getMessages(): ContactMessage[] {
    try {
      const data = localStorage.getItem(CONTACT_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  submit(data: Omit<ContactMessage, 'id' | 'submittedAt'>): ContactMessage {
    const list = this.getMessages()
    const record: ContactMessage = {
      ...data,
      id: `msg-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    }
    list.unshift(record)
    localStorage.setItem(CONTACT_KEY, JSON.stringify(list))

    // Notify backend
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        company: data.company || '',
        inquiryType: data.subject,
        message: data.message,
      }),
    }).catch(() => {})

    return record
  },
}

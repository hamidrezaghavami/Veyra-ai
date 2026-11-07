import { db, WaitlistEntry, ContactEntry } from '../db/store.ts'

export class FormService {
  static joinWaitlist(email: string, teamSize?: string, useCase?: string): { success: boolean; entry: WaitlistEntry } {
    if (!email || !email.includes('@')) {
      throw new Error('A valid email address is required.')
    }
    const entry = db.addWaitlist(email, teamSize || '1-10', useCase || 'Invoice Auditing')
    return { success: true, entry }
  }

  static submitContact(
    name: string,
    email: string,
    company: string,
    inquiryType: string,
    message: string
  ): { success: boolean; entry: ContactEntry } {
    if (!email || !email.includes('@')) {
      throw new Error('A valid email address is required.')
    }
    const entry = db.addContact(name, email, company, inquiryType, message)
    return { success: true, entry }
  }
}

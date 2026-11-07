import { api } from './api'
export const contactService = {
  submit: (data: { firstName: string; lastName: string; email: string; company: string; subject: string; message: string }) =>
    api<{id: string}>('/contact', { method: 'POST', body: JSON.stringify({ name: `${data.firstName} ${data.lastName}`.trim(), email: data.email, company: data.company, inquiryType: data.subject, message: data.message }) }),
}

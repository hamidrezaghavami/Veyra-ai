import { api } from './api'
export type { InvoiceRecord, AuditFlag, AuditAction, LineItem } from '../backend/types'
import type { InvoiceRecord } from '../backend/types'
export const invoiceService = {
  getAll: () => api<InvoiceRecord[]>('/invoices'),
  async upload(file: File) {
    if (file.size > 2_800_000) throw new Error('Choose a document smaller than 2.8 MB.')
    const fileType = file.name.toLowerCase().endsWith('.json') ? 'application/json' : file.type
    if (!['application/pdf','image/png','image/jpeg','image/webp','application/json'].includes(fileType)) throw new Error('Choose a PDF, PNG, JPEG, WebP, or invoice JSON file.')
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result).split(',')[1])
      reader.onerror = () => reject(new Error('Could not read the selected file.'))
      reader.readAsDataURL(file)
    })
    return api<InvoiceRecord>('/invoices/upload-and-audit', { method: 'POST', body: JSON.stringify({ fileName: file.name, fileType, data }) })
  },
  action: (id: string, action: 'approve'|'reject'|'flag', note: string) => api<InvoiceRecord>(`/invoices/${encodeURIComponent(id)}/${action}`, { method: 'PATCH', body: JSON.stringify({ note }) }),
  update: (id: string, fields: unknown) => api<InvoiceRecord>(`/invoices/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(fields) }),
}

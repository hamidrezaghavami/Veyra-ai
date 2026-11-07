import { z } from 'zod'
const money = z.number().finite().nonnegative().max(1e12)
export const invoiceFields = z.object({
  invoiceNumber: z.string().trim().min(1).max(128),
  vendor: z.string().trim().min(1).max(200),
  vendorCategory: z.enum(['Cloud & Infra', 'Software / SaaS', 'Logistics', 'Professional Services', 'Office Supplies', 'Marketing & Ads', 'Hardware']),
  issueDate: z.iso.date(), dueDate: z.iso.date(),
  subtotal: money, taxRate: z.number().finite().min(0).max(1), taxAmount: money, total: money,
  currency: z.string().regex(/^[A-Z]{3}$/),
  lineItems: z.array(z.object({
    id: z.string().max(100).optional(), description: z.string().trim().min(1).max(500),
    quantity: z.number().finite().positive().max(1e9), unitPrice: money, total: money,
  }).strict()).min(1).max(500),
}).strict()
export const uploadSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  fileType: z.enum(['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'application/json']),
  data: z.string().min(4).max(4_000_000).regex(/^[A-Za-z0-9+/]*={0,2}$/),
}).strict()
export const contactSchema = z.object({
  name: z.string().trim().min(1).max(200), email: z.email().max(254).transform(s => s.toLowerCase()),
  company: z.string().trim().max(200).optional(), inquiryType: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
}).strict()

export type VendorCategory =
  | 'Cloud & Infra'
  | 'Software / SaaS'
  | 'Logistics'
  | 'Professional Services'
  | 'Office Supplies'
  | 'Marketing & Ads'
  | 'Hardware'

export type InvoiceStatus = 'Pending Audit' | 'Flagged' | 'Approved' | 'Rejected'

export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface AuditFlag {
  id: string
  type: 'duplicate' | 'calc_error' | 'tax_mismatch' | 'high_value' | 'missing_po' | 'vendor_anomaly'
  severity: 'warning' | 'critical'
  message: string
  field?: string
}

export interface AuditAction {
  id: string
  action: string
  timestamp: string
  actor: string
  note?: string
}

export interface InvoiceRecord {
  id: string
  invoiceNumber: string
  vendor: string
  vendorCategory: VendorCategory
  issueDate: string
  dueDate: string
  subtotal: number
  taxRate: number // e.g. 0.0825 (8.25%)
  taxAmount: number
  total: number
  currency: string
  status: InvoiceStatus
  flags: AuditFlag[]
  lineItems: LineItem[]
  auditHistory: AuditAction[]
  extractedByAI: boolean
  confidenceScore: number
  fileName?: string
  fileUrl?: string
  aiAnalysisSummary?: string
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
  suggestedActions?: { label: string; action: string }[]
  referencedInvoices?: InvoiceRecord[]
}

export interface SpendAnalytics {
  totalSpend: number
  totalInvoices: number
  approvedCount: number
  approvedAmount: number
  flaggedCount: number
  flaggedAmount: number
  pendingCount: number
  pendingAmount: number
  rejectedCount: number
  rejectedAmount: number
  averageConfidence: number
  spendByCategory: Record<string, number>
  spendByVendor: { vendor: string; amount: number; count: number; category: string }[]
  monthlyTrends: { month: string; amount: number; count: number }[]
  recentFlags: AuditFlag[]
}

export interface UserSession {
  email: string
  name: string
  role: string
  company: string
  avatarUrl: string
  token: string
}

export interface ClerkAccount {
  id: string
  firstName: string | null
  lastName: string | null
  primaryEmailAddressId: string | null
  emailAddresses: { id: string; emailAddress: string; verification: { status: string } | null }[]
}

export interface CurrencySummary {
  currency: string
  count: number
  totalTracked: number
  totalExcludingRejected: number
  approved: number
  pending: number
  flagged: number
  rejected: number
  categories: Record<string, number>
}

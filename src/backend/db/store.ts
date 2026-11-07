import { InvoiceRecord, UserSession } from '../types.ts'

export interface WaitlistEntry {
  id: string
  email: string
  teamSize: string
  useCase: string
  queuePosition: number
  createdAt: string
}

export interface ContactEntry {
  id: string
  name: string
  email: string
  company: string
  inquiryType: string
  message: string
  createdAt: string
}

export interface OtpRecord {
  email: string
  code: string
  timestamp: number
}

// Initial rich seed invoices matching the Framer platform
const SEED_INVOICES: InvoiceRecord[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2026-9812',
    vendor: 'Amazon Web Services (AWS)',
    vendorCategory: 'Cloud & Infra',
    issueDate: '2026-11-04',
    dueDate: '2026-11-25',
    subtotal: 4820.0,
    taxRate: 0.0825,
    taxAmount: 397.65,
    total: 5217.65,
    currency: 'USD',
    status: 'Approved',
    confidenceScore: 0.994,
    extractedByAI: true,
    fileName: 'aws-us-east-monthly-nov.pdf',
    aiAnalysisSummary: 'Cloud compute cluster and storage allocation. OCR confidence: 99.4%. Passed all mathematical reconciliation checks.',
    lineItems: [
      { id: 'li-1', description: 'EC2 Compute Elastic Nodes (c6i.4xlarge)', quantity: 4, unitPrice: 720.0, total: 2880.0 },
      { id: 'li-2', description: 'S3 Standard Storage (52 TB Multi-AZ)', quantity: 52, unitPrice: 23.0, total: 1196.0 },
      { id: 'li-3', description: 'CloudFront Regional Data Egress', quantity: 1, unitPrice: 744.0, total: 744.0 },
    ],
    flags: [],
    auditHistory: [
      { id: 'ah-1', action: 'Document Ingested & AI Extracted', timestamp: '2026-11-04 09:12:00', actor: 'Veyra OCR Agent' },
      { id: 'ah-2', action: 'Calculations Verified · Zero Anomalies', timestamp: '2026-11-04 09:12:04', actor: 'Automated Audit Engine' },
      { id: 'ah-3', action: 'Approved by Controller', timestamp: '2026-11-04 11:30:15', actor: 'Kadir Calik (Finance Lead)' },
    ],
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2026-4828',
    vendor: 'Northwind Global Freight LLC',
    vendorCategory: 'Logistics',
    issueDate: '2026-11-05',
    dueDate: '2026-11-20',
    subtotal: 6280.0,
    taxRate: 0.0,
    taxAmount: 0.0,
    total: 6280.0,
    currency: 'USD',
    status: 'Flagged',
    confidenceScore: 0.942,
    extractedByAI: true,
    fileName: 'northwind-drayage-fuel.pdf',
    aiAnalysisSummary: 'Potential duplicate submission: identical routing vendor and billing amount ($6,280.00) submitted 48 hours prior.',
    lineItems: [
      { id: 'li-4', description: 'Cross-Border Drayage & Container Handling', quantity: 2, unitPrice: 2800.0, total: 5600.0 },
      { id: 'li-5', description: 'Fuel Surcharge Peak Adjustment', quantity: 1, unitPrice: 680.0, total: 680.0 },
    ],
    flags: [
      {
        id: 'flg-1',
        type: 'duplicate',
        severity: 'critical',
        message: 'Duplicate detected: Matches prior disbursement #NW-9801 to Northwind Global Freight for $6,280.00.',
        field: 'total',
      },
      {
        id: 'flg-2',
        type: 'missing_po',
        severity: 'warning',
        message: 'Missing Purchase Order authorization code in document header.',
        field: 'invoiceNumber',
      },
    ],
    auditHistory: [
      { id: 'ah-4', action: 'Document Ingested & AI Extracted', timestamp: '2026-11-05 14:02:11', actor: 'Veyra OCR Agent' },
      { id: 'ah-5', action: 'Flagged by Duplicate Interception Engine', timestamp: '2026-11-05 14:02:14', actor: 'Automated Audit Engine' },
    ],
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-2026-1102',
    vendor: 'Figma Inc.',
    vendorCategory: 'Software / SaaS',
    issueDate: '2026-11-01',
    dueDate: '2026-11-30',
    subtotal: 1800.0,
    taxRate: 0.0825,
    taxAmount: 148.5,
    total: 1948.5,
    currency: 'USD',
    status: 'Approved',
    confidenceScore: 0.988,
    extractedByAI: true,
    fileName: 'figma-enterprise-seats.pdf',
    aiAnalysisSummary: 'Annual design tool organization licensing. Validated against active employee seat count.',
    lineItems: [
      { id: 'li-6', description: 'Figma Enterprise Full Editor Seats (x20)', quantity: 20, unitPrice: 75.0, total: 1500.0 },
      { id: 'li-7', description: 'FigJam Collaborative Ideation Addon (x20)', quantity: 20, unitPrice: 15.0, total: 300.0 },
    ],
    flags: [],
    auditHistory: [
      { id: 'ah-6', action: 'Document Ingested & AI Extracted', timestamp: '2026-11-01 08:00:22', actor: 'Veyra OCR Agent' },
      { id: 'ah-7', action: 'Auto-Matched to SaaS Budget Line #402', timestamp: '2026-11-01 08:00:25', actor: 'Automated Audit Engine' },
      { id: 'ah-8', action: 'Approved by Controller', timestamp: '2026-11-02 10:14:02', actor: 'Kadir Calik (Finance Lead)' },
    ],
  },
  {
    id: 'inv-004',
    invoiceNumber: 'INV-2026-3391',
    vendor: 'Lumen Labs Research Group',
    vendorCategory: 'Professional Services',
    issueDate: '2026-11-03',
    dueDate: '2026-11-17',
    subtotal: 12500.0,
    taxRate: 0.0,
    taxAmount: 0.0,
    total: 12500.0,
    currency: 'USD',
    status: 'Pending Audit',
    confidenceScore: 0.965,
    extractedByAI: true,
    fileName: 'lumen-security-audit-phase2.pdf',
    aiAnalysisSummary: 'Quarterly penetration testing & smart contract audit milestone. High-value spend threshold exceeded ($10k+).',
    lineItems: [
      { id: 'li-8', description: 'SOC 2 Type II Gap Assessment & Penetration Testing Phase 2', quantity: 1, unitPrice: 12500.0, total: 12500.0 },
    ],
    flags: [
      {
        id: 'flg-3',
        type: 'high_value',
        severity: 'warning',
        message: 'High-value threshold exceeded ($10,000+). Requires dual executive approval under Corporate Spend Policy.',
        field: 'total',
      },
    ],
    auditHistory: [
      { id: 'ah-9', action: 'Document Ingested & AI Extracted', timestamp: '2026-11-03 16:44:00', actor: 'Veyra OCR Agent' },
      { id: 'ah-10', action: 'Escalated to High-Value Review Queue', timestamp: '2026-11-03 16:44:02', actor: 'Automated Audit Engine' },
    ],
  },
  {
    id: 'inv-005',
    invoiceNumber: 'INV-2026-7719',
    vendor: 'Apex Hardware & Office Solutions',
    vendorCategory: 'Office Supplies',
    issueDate: '2026-11-06',
    dueDate: '2026-11-20',
    subtotal: 3450.0,
    taxRate: 0.0825,
    taxAmount: 384.63,
    total: 3834.63,
    currency: 'USD',
    status: 'Flagged',
    confidenceScore: 0.912,
    extractedByAI: true,
    fileName: 'apex-ergonomic-chairs.pdf',
    aiAnalysisSummary: 'Tax rate discrepancy flagged: calculated tax (8.25%) is $284.63, but invoice claims $384.63 (+$100.00 discrepancy).',
    lineItems: [
      { id: 'li-9', description: 'Ergonomic Mesh Task Chairs (Anthracite)', quantity: 6, unitPrice: 575.0, total: 3450.0 },
    ],
    flags: [
      {
        id: 'flg-4',
        type: 'tax_mismatch',
        severity: 'critical',
        message: 'Tax calculation mismatch: expected $284.63 (8.25% of $3,450.00), but invoice billed $384.63 (+$100.00 discrepancy).',
        field: 'taxAmount',
      },
    ],
    auditHistory: [
      { id: 'ah-11', action: 'Document Ingested & AI Extracted', timestamp: '2026-11-06 11:20:10', actor: 'Veyra OCR Agent' },
      { id: 'ah-12', action: 'Flagged for Tax Inconsistency', timestamp: '2026-11-06 11:20:12', actor: 'Automated Audit Engine' },
    ],
  },
]

class MemoryStore {
  private invoices: InvoiceRecord[] = [...SEED_INVOICES]
  private waitlist: WaitlistEntry[] = [
    { id: 'w-1', email: 'sarah.c@aerix.io', teamSize: '11-50', useCase: 'Accounts Payable', queuePosition: 412, createdAt: '2026-11-01' },
    { id: 'w-2', email: 'm.vance@lumina.finance', teamSize: '51-200', useCase: 'Expense Auditing', queuePosition: 413, createdAt: '2026-11-02' },
  ]
  private contacts: ContactEntry[] = []
  private otps: Map<string, OtpRecord> = new Map()
  private sessions: Map<string, UserSession> = new Map()

  // Invoices
  getInvoices(): InvoiceRecord[] {
    return [...this.invoices]
  }

  getInvoiceById(id: string): InvoiceRecord | undefined {
    return this.invoices.find((i) => i.id === id || i.invoiceNumber.toLowerCase() === id.toLowerCase())
  }

  addInvoice(invoice: InvoiceRecord): InvoiceRecord {
    this.invoices.unshift(invoice)
    return invoice
  }

  updateInvoice(id: string, updater: (inv: InvoiceRecord) => InvoiceRecord): InvoiceRecord | null {
    const idx = this.invoices.findIndex((i) => i.id === id)
    if (idx === -1) return null
    const updated = updater({ ...this.invoices[idx] })
    this.invoices[idx] = updated
    return updated
  }

  deleteInvoice(id: string): boolean {
    const lenBefore = this.invoices.length
    this.invoices = this.invoices.filter((i) => i.id !== id)
    return this.invoices.length < lenBefore
  }

  resetInvoices(): InvoiceRecord[] {
    this.invoices = [...SEED_INVOICES]
    return this.invoices
  }

  // Waitlist
  getWaitlist(): WaitlistEntry[] {
    return [...this.waitlist]
  }

  addWaitlist(email: string, teamSize: string = '1-10', useCase: string = 'Invoice Auditing'): WaitlistEntry {
    const existing = this.waitlist.find((w) => w.email.toLowerCase() === email.toLowerCase())
    if (existing) return existing

    const entry: WaitlistEntry = {
      id: `w-${Date.now().toString(36)}`,
      email,
      teamSize,
      useCase,
      queuePosition: 412 + this.waitlist.length,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    this.waitlist.push(entry)
    return entry
  }

  // Contacts
  addContact(name: string, email: string, company: string, inquiryType: string, message: string): ContactEntry {
    const entry: ContactEntry = {
      id: `c-${Date.now().toString(36)}`,
      name,
      email,
      company,
      inquiryType,
      message,
      createdAt: new Date().toISOString(),
    }
    this.contacts.push(entry)
    return entry
  }

  // OTP
  setOtp(email: string, code: string) {
    this.otps.set(email.toLowerCase(), {
      email: email.toLowerCase(),
      code,
      timestamp: Date.now(),
    })
  }

  getOtp(email: string): OtpRecord | undefined {
    return this.otps.get(email.toLowerCase())
  }

  deleteOtp(email: string) {
    this.otps.delete(email.toLowerCase())
  }

  // Sessions
  setSession(token: string, user: UserSession) {
    this.sessions.set(token, user)
  }

  getSession(token: string): UserSession | undefined {
    return this.sessions.get(token)
  }
}

export const db = new MemoryStore()

export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface AuditFlag {
  id: string
  type: 'duplicate' | 'calc_error' | 'tax_mismatch' | 'high_value' | 'missing_po'
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
  vendorCategory: 'Cloud & Infra' | 'Software / SaaS' | 'Logistics' | 'Professional Services' | 'Office Supplies'
  issueDate: string
  dueDate: string
  subtotal: number
  taxRate: number // e.g. 0.0825 (8.25%)
  taxAmount: number
  total: number
  currency: string
  status: 'Pending Audit' | 'Flagged' | 'Approved' | 'Rejected'
  flags: AuditFlag[]
  lineItems: LineItem[]
  auditHistory: AuditAction[]
  extractedByAI: boolean
  confidenceScore: number
  fileUrl?: string
  fileName?: string
}

const STORAGE_KEY = 'veyra_invoices_v1'

const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2026-9812',
    vendor: 'Amazon Web Services (AWS)',
    vendorCategory: 'Cloud & Infra',
    issueDate: '2026-11-04',
    dueDate: '2026-11-25',
    subtotal: 4820.00,
    taxRate: 0.0825,
    taxAmount: 397.65,
    total: 5217.65,
    currency: 'USD',
    status: 'Approved',
    confidenceScore: 0.99,
    extractedByAI: true,
    fileName: 'aws-us-east-monthly-nov.pdf',
    lineItems: [
      { id: 'li-1', description: 'EC2 Compute Elastic Nodes (c6i.4xlarge)', quantity: 4, unitPrice: 720.00, total: 2880.00 },
      { id: 'li-2', description: 'S3 Standard Storage (52 TB Multi-AZ)', quantity: 52, unitPrice: 23.00, total: 1196.00 },
      { id: 'li-3', description: 'CloudFront Regional Data Egress', quantity: 1, unitPrice: 744.00, total: 744.00 },
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
    subtotal: 6280.00,
    taxRate: 0.00,
    taxAmount: 0.00,
    total: 6280.00,
    currency: 'USD',
    status: 'Flagged',
    confidenceScore: 0.94,
    extractedByAI: true,
    fileName: 'northwind-drayage-fuel.pdf',
    lineItems: [
      { id: 'li-4', description: 'Cross-Border Drayage & Container Handling', quantity: 2, unitPrice: 2800.00, total: 5600.00 },
      { id: 'li-5', description: 'Fuel Surcharge Peak Adjustment', quantity: 1, unitPrice: 680.00, total: 680.00 },
    ],
    flags: [
      {
        id: 'flg-1',
        type: 'duplicate',
        severity: 'critical',
        message: 'Potential duplicate invoice: identical vendor ($6,280.00) was already disbursed on Oct 28 under INV-2026-4790.',
        field: 'total',
      },
      {
        id: 'flg-2',
        type: 'missing_po',
        severity: 'warning',
        message: 'No Purchase Order (PO) reference identified on original document.',
        field: 'invoiceNumber',
      },
    ],
    auditHistory: [
      { id: 'ah-4', action: 'Document Ingested', timestamp: '2026-11-05 14:02:11', actor: 'Veyra OCR Agent' },
      { id: 'ah-5', action: 'Flagged: Duplicate disbursement pattern detected', timestamp: '2026-11-05 14:02:15', actor: 'Automated Audit Engine' },
    ],
  },
  {
    id: 'inv-003',
    invoiceNumber: 'SUB-8921-OCT',
    vendor: 'Datadog Cloud Observability',
    vendorCategory: 'Software / SaaS',
    issueDate: '2026-11-01',
    dueDate: '2026-11-15',
    subtotal: 2840.00,
    taxRate: 0.0825,
    taxAmount: 234.30,
    total: 3074.30,
    currency: 'USD',
    status: 'Approved',
    confidenceScore: 0.98,
    extractedByAI: true,
    fileName: 'datadog-inv-8921.pdf',
    lineItems: [
      { id: 'li-6', description: 'Datadog APM Pro Host Agents (32 nodes)', quantity: 32, unitPrice: 65.00, total: 2080.00 },
      { id: 'li-7', description: 'Log Management Ingestion (3.8 TB)', quantity: 1, unitPrice: 760.00, total: 760.00 },
    ],
    flags: [],
    auditHistory: [
      { id: 'ah-6', action: 'Document Extracted', timestamp: '2026-11-01 10:15:00', actor: 'Veyra OCR Agent' },
      { id: 'ah-7', action: 'Auto-Matched against recurring SaaS contract #SaaS-44', timestamp: '2026-11-01 10:15:05', actor: 'Automated Audit Engine' },
      { id: 'ah-8', action: 'Approved', timestamp: '2026-11-01 10:20:00', actor: 'System Auto-Approval' },
    ],
  },
  {
    id: 'inv-004',
    invoiceNumber: 'INV-10943',
    vendor: 'Apex Office & Hardware Depot',
    vendorCategory: 'Office Supplies',
    issueDate: '2026-11-06',
    dueDate: '2026-12-06',
    subtotal: 1450.00,
    taxRate: 0.08,
    taxAmount: 180.00, // Error: 1450 * 0.08 is 116.00, not 180.00!
    total: 1630.00,
    currency: 'USD',
    status: 'Pending Audit',
    confidenceScore: 0.92,
    extractedByAI: true,
    fileName: 'apex-supplies-ergonomic.png',
    lineItems: [
      { id: 'li-8', description: 'Ergonomic Mesh Task Chairs (Model X)', quantity: 3, unitPrice: 350.00, total: 1050.00 },
      { id: 'li-9', description: 'Dual Monitor Aluminum Arms', quantity: 4, unitPrice: 100.00, total: 400.00 },
    ],
    flags: [
      {
        id: 'flg-3',
        type: 'tax_mismatch',
        severity: 'critical',
        message: 'Tax calculation mismatch: listed tax ($180.00) does not match subtotal rate 8% ($116.00). Overbilled by $64.00.',
        field: 'taxAmount',
      },
    ],
    auditHistory: [
      { id: 'ah-9', action: 'Receipt Scanned & Extracted', timestamp: '2026-11-06 16:45:00', actor: 'Veyra OCR Agent' },
      { id: 'ah-10', action: 'Flagged for Tax Inconsistency', timestamp: '2026-11-06 16:45:03', actor: 'Automated Audit Engine' },
    ],
  },
]

export const invoiceService = {
  getAll(): InvoiceRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INVOICES))
        return INITIAL_INVOICES
      }
      return JSON.parse(data)
    } catch {
      return INITIAL_INVOICES
    }
  },

  getById(id: string): InvoiceRecord | undefined {
    return this.getAll().find((inv) => inv.id === id)
  },

  saveAll(invoices: InvoiceRecord[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
  },

  async syncWithBackend(): Promise<InvoiceRecord[]> {
    try {
      const res = await fetch('/api/invoices')
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          this.saveAll(json.data)
          return json.data
        }
      }
    } catch (e) {
      // Background sync failed or offline; local storage continues working
    }
    return this.getAll()
  },

  approve(id: string, actor: string = 'Current User'): InvoiceRecord {
    const list = this.getAll()
    const item = list.find((i) => i.id === id)
    if (!item) throw new Error('Invoice not found')

    item.status = 'Approved'
    item.flags = []
    item.auditHistory.unshift({
      id: `ah-${Date.now()}`,
      action: 'Invoice Approved for Disbursement',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor,
      note: 'Verified and authorized for AP ledger.',
    })

    this.saveAll(list)

    // Notify backend
    fetch(`/api/invoices/${encodeURIComponent(id)}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor }),
    }).catch(() => {})

    return item
  },

  reject(id: string, reason: string, actor: string = 'Current User'): InvoiceRecord {
    const list = this.getAll()
    const item = list.find((i) => i.id === id)
    if (!item) throw new Error('Invoice not found')

    item.status = 'Rejected'
    item.auditHistory.unshift({
      id: `ah-${Date.now()}`,
      action: 'Invoice Rejected',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor,
      note: reason,
    })

    this.saveAll(list)

    // Notify backend
    fetch(`/api/invoices/${encodeURIComponent(id)}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, actor }),
    }).catch(() => {})

    return item
  },

  flagForReview(id: string, comment: string, actor: string = 'Current User'): InvoiceRecord {
    const list = this.getAll()
    const item = list.find((i) => i.id === id)
    if (!item) throw new Error('Invoice not found')

    item.status = 'Flagged'
    item.auditHistory.unshift({
      id: `ah-${Date.now()}`,
      action: 'Flagged for Human Review',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor,
      note: comment,
    })

    this.saveAll(list)

    // Notify backend
    fetch(`/api/invoices/${encodeURIComponent(id)}/flag`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment, actor }),
    }).catch(() => {})

    return item
  },

  updateInvoice(updated: InvoiceRecord, actor: string = 'Current User'): InvoiceRecord {
    const list = this.getAll()
    const idx = list.findIndex((i) => i.id === updated.id)
    if (idx === -1) throw new Error('Invoice not found')

    // Re-run automated rule validation checks
    const flags = this.runAuditRules(updated, list.filter((i) => i.id !== updated.id))
    updated.flags = flags
    if (flags.length > 0 && updated.status !== 'Rejected') {
      updated.status = 'Flagged'
    } else if (flags.length === 0 && updated.status === 'Flagged') {
      updated.status = 'Pending Audit'
    }

    updated.auditHistory.unshift({
      id: `ah-${Date.now()}`,
      action: 'Manual Correction Applied',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor,
      note: 'Fields modified and re-verified by validation logic.',
    })

    list[idx] = updated
    this.saveAll(list)
    return updated
  },

  runAuditRules(invoice: InvoiceRecord, existingInvoices: InvoiceRecord[]): AuditFlag[] {
    const flags: AuditFlag[] = []

    // 1. Duplicate Check
    const duplicate = existingInvoices.find(
      (other) =>
        other.invoiceNumber.toLowerCase() === invoice.invoiceNumber.toLowerCase() ||
        (other.vendor.toLowerCase() === invoice.vendor.toLowerCase() &&
          Math.abs(other.total - invoice.total) < 0.01 &&
          other.id !== invoice.id)
    )
    if (duplicate) {
      flags.push({
        id: `f-${Date.now()}-dup`,
        type: 'duplicate',
        severity: 'critical',
        message: `Potential duplicate submission: matches invoice #${duplicate.invoiceNumber} (${duplicate.vendor}) for $${duplicate.total.toFixed(2)}.`,
        field: 'invoiceNumber',
      })
    }

    // 2. Line Items Math Sum Check
    const calculatedSubtotal = invoice.lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
    if (Math.abs(calculatedSubtotal - invoice.subtotal) > 0.05) {
      flags.push({
        id: `f-${Date.now()}-sum`,
        type: 'calc_error',
        severity: 'critical',
        message: `Subtotal mismatch: line items sum ($${calculatedSubtotal.toFixed(2)}) does not equal stated subtotal ($${invoice.subtotal.toFixed(2)}).`,
        field: 'subtotal',
      })
    }

    // 3. Tax Amount Check
    if (invoice.taxRate > 0) {
      const expectedTax = invoice.subtotal * invoice.taxRate
      if (Math.abs(expectedTax - invoice.taxAmount) > 0.5) {
        flags.push({
          id: `f-${Date.now()}-tax`,
          type: 'tax_mismatch',
          severity: 'warning',
          message: `Tax discrepancy: calculated tax at ${(invoice.taxRate * 100).toFixed(1)}% is $${expectedTax.toFixed(2)}, but document claims $${invoice.taxAmount.toFixed(2)}.`,
          field: 'taxAmount',
        })
      }
    }

    // 4. High Value Audit Threshold Check
    if (invoice.total >= 10000) {
      flags.push({
        id: `f-${Date.now()}-high`,
        type: 'high_value',
        severity: 'warning',
        message: 'High-value threshold exceeded ($10,000+). Requires dual executive approval under Corporate Spend Policy.',
        field: 'total',
      })
    }

    return flags
  },

  addInvoice(newInv: Omit<InvoiceRecord, 'id' | 'flags' | 'auditHistory'>): InvoiceRecord {
    const list = this.getAll()
    const id = `inv-${Date.now().toString(36)}`

    const record: InvoiceRecord = {
      ...newInv,
      id,
      flags: [],
      auditHistory: [
        {
          id: `ah-${Date.now()}`,
          action: 'Document Processed & AI OCR Extraction Complete',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          actor: 'Veyra OCR Agent',
        },
      ],
    }

    const flags = this.runAuditRules(record, list)
    record.flags = flags
    record.status = flags.length > 0 ? 'Flagged' : 'Pending Audit'

    list.unshift(record)
    this.saveAll(list)
    return record
  },

  uploadAndIngest(newInv: Omit<InvoiceRecord, 'id' | 'flags' | 'auditHistory'>): InvoiceRecord {
    return this.addInvoice(newInv)
  },

  resetDefaults(): InvoiceRecord[] {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INVOICES))
    return INITIAL_INVOICES
  },
}

import { InvoiceRecord, AuditFlag } from '../types.ts'

export class AuditEngine {
  /**
   * Run all deterministic compliance & anomaly rules on an invoice record
   */
  static runAudit(
    invoice: InvoiceRecord,
    existingInvoices: InvoiceRecord[]
  ): { flags: AuditFlag[]; status: 'Approved' | 'Flagged' | 'Pending Audit' | 'Rejected' } {
    const flags: AuditFlag[] = []

    // Rule 1: Duplicate Submission Check
    const duplicate = existingInvoices.find(
      (other) =>
        other.id !== invoice.id &&
        (other.invoiceNumber.toLowerCase() === invoice.invoiceNumber.toLowerCase() ||
          (other.vendor.toLowerCase() === invoice.vendor.toLowerCase() &&
            Math.abs(other.total - invoice.total) < 0.01 &&
            Math.abs(new Date(other.issueDate).getTime() - new Date(invoice.issueDate).getTime()) < 35 * 86400000))
    )

    if (duplicate) {
      flags.push({
        id: `flg-dup-${Date.now()}`,
        type: 'duplicate',
        severity: 'critical',
        message: `Potential duplicate submission: matches invoice #${duplicate.invoiceNumber} (${duplicate.vendor}) for $${duplicate.total.toFixed(2)}.`,
        field: 'invoiceNumber',
      })
    }

    // Rule 2: Line Items Mathematical Sum Check
    if (invoice.lineItems && invoice.lineItems.length > 0) {
      const calculatedSubtotal = invoice.lineItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      )
      if (Math.abs(calculatedSubtotal - invoice.subtotal) > 0.05) {
        flags.push({
          id: `flg-sum-${Date.now()}`,
          type: 'calc_error',
          severity: 'critical',
          message: `Subtotal reconciliation mismatch: line items total ($${calculatedSubtotal.toFixed(2)}) does not equal declared subtotal ($${invoice.subtotal.toFixed(2)}). Discrepancy: $${Math.abs(calculatedSubtotal - invoice.subtotal).toFixed(2)}.`,
          field: 'subtotal',
        })
      }
    }

    // Rule 3: Tax Rate Calculation Consistency
    if (invoice.taxRate > 0) {
      const expectedTax = invoice.subtotal * invoice.taxRate
      if (Math.abs(expectedTax - invoice.taxAmount) > 0.25) {
        flags.push({
          id: `flg-tax-${Date.now()}`,
          type: 'tax_mismatch',
          severity: 'critical',
          message: `Tax calculation mismatch: expected $${expectedTax.toFixed(2)} (${(invoice.taxRate * 100).toFixed(1)}% of $${invoice.subtotal.toFixed(2)}), but document bills $${invoice.taxAmount.toFixed(2)}.`,
          field: 'taxAmount',
        })
      }
    }

    // Rule 4: Total Sum Verification (Subtotal + Tax = Total)
    const expectedTotal = invoice.subtotal + invoice.taxAmount
    if (Math.abs(expectedTotal - invoice.total) > 0.1) {
      flags.push({
        id: `flg-tot-${Date.now()}`,
        type: 'calc_error',
        severity: 'critical',
        message: `Grand total mismatch: Subtotal ($${invoice.subtotal.toFixed(2)}) + Tax ($${invoice.taxAmount.toFixed(2)}) equals $${expectedTotal.toFixed(2)}, but invoice states $${invoice.total.toFixed(2)}.`,
        field: 'total',
      })
    }

    // Rule 5: High-Value Threshold Check ($10,000+)
    if (invoice.total >= 10000) {
      flags.push({
        id: `flg-high-${Date.now()}`,
        type: 'high_value',
        severity: 'warning',
        message: `High-value spend threshold exceeded ($10,000+). Requires secondary executive sign-off under Section 4.2 Corporate AP Policy.`,
        field: 'total',
      })
    }

    // Determine Status based on flags
    const hasCritical = flags.some((f) => f.severity === 'critical')
    const hasWarning = flags.some((f) => f.severity === 'warning')

    let status: 'Approved' | 'Flagged' | 'Pending Audit' | 'Rejected' = 'Pending Audit'
    if (hasCritical || hasWarning) {
      status = 'Flagged'
    } else {
      status = 'Pending Audit'
    }

    return { flags, status }
  }
}

const cents = (n) => Math.round((n + Number.EPSILON) * 100)
/**
 * @param {import('./types').InvoiceRecord} invoice
 * @param {import('./types').InvoiceRecord[]} existing
 * @returns {import('./types').AuditFlag[]}
 */
export function auditInvoice(invoice, existing) {
  const flags = []
  const flag = (type, field, message, severity = 'critical') =>
    flags.push({ id: `${type}-${field}`, type, field, message, severity })
  const duplicate = existing.find(
    (other) =>
      other.id !== invoice.id &&
      other.currency === invoice.currency &&
      ((other.vendor.toLowerCase() === invoice.vendor.toLowerCase() &&
        other.invoiceNumber.toLowerCase() ===
          invoice.invoiceNumber.toLowerCase()) ||
        (other.vendor.toLowerCase() === invoice.vendor.toLowerCase() &&
          cents(other.total) === cents(invoice.total) &&
          other.issueDate === invoice.issueDate))
  )
  if (duplicate)
    flag(
      'duplicate',
      'invoiceNumber',
      `Possible duplicate of ${duplicate.invoiceNumber}. Review the original before approval.`
    )
  if (!invoice.lineItems.length)
    flag(
      'calc_error',
      'lineItems',
      'Invoice must contain at least one line item.'
    )
  for (const item of invoice.lineItems) {
    if (Math.abs(cents(item.quantity * item.unitPrice) - cents(item.total)) > 1)
      flag(
        'calc_error',
        'lineItems',
        `Line item “${item.description}” does not equal quantity × unit price.`
      )
  }
  const subtotal = invoice.lineItems.reduce(
    (sum, item) => sum + cents(item.total),
    0
  )
  if (Math.abs(subtotal - cents(invoice.subtotal)) > 1)
    flag(
      'calc_error',
      'subtotal',
      'Line item totals do not match the subtotal.'
    )
  if (
    Math.abs(
      cents(invoice.subtotal * invoice.taxRate) - cents(invoice.taxAmount)
    ) > 1
  )
    flag(
      'tax_mismatch',
      'taxAmount',
      'Tax amount does not match the stated tax rate, including zero-rated tax.'
    )
  if (
    Math.abs(
      cents(invoice.subtotal) + cents(invoice.taxAmount) - cents(invoice.total)
    ) > 1
  )
    flag(
      'calc_error',
      'total',
      'Subtotal plus tax does not match the grand total.'
    )
  // This is a review threshold in the stated currency, not an exchange-rate conversion.
  if (invoice.total >= 10000)
    flag(
      'high_value',
      'total',
      `High-value invoice (10,000+ ${invoice.currency}). Review carefully before approving.`,
      'warning'
    )
  return flags
}

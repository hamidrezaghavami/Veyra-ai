/**
 * @param {import('./types').InvoiceRecord[]} invoices
 * @returns {import('./types').CurrencySummary[]}
 */

export function summarizeLedger(invoices) {
  const currencies = [...new Set(invoices.map((i) => i.currency))].sort()
  return currencies.map((currency) => {
    const records = invoices.filter((i) => i.currency === currency)
    const sum = (status) =>
      records
        .filter((i) => i.status === status)
        .reduce((total, i) => total + i.total, 0)
    return {
      currency,
      count: records.length,
      totalTracked: records.reduce((total, i) => total + i.total, 0),
      totalExcludingRejected: records
        .filter((i) => i.status !== 'Rejected')
        .reduce((total, i) => total + i.total, 0),
      approved: sum('Approved'),
      pending: sum('Pending Audit'),
      flagged: sum('Flagged'),
      rejected: sum('Rejected'),
      categories: records
        .filter((i) => i.status !== 'Rejected')
        .reduce((categories, i) => {
          categories[i.vendorCategory] =
            (categories[i.vendorCategory] || 0) + i.total
          return categories
        }, {}),
    }
  })
}

import { db } from '../db/store.ts'
import { SpendAnalytics } from '../types.ts'

export class AnalyticsService {
  static getMetrics(): SpendAnalytics {
    const invoices = db.getInvoices()

    const totalSpend = invoices.reduce((acc, i) => acc + i.total, 0)
    const approved = invoices.filter((i) => i.status === 'Approved')
    const flagged = invoices.filter((i) => i.status === 'Flagged' || i.flags.length > 0)
    const pending = invoices.filter((i) => i.status === 'Pending Audit')
    const rejected = invoices.filter((i) => i.status === 'Rejected')

    const avgConfidence =
      invoices.length > 0
        ? invoices.reduce((acc, i) => acc + i.confidenceScore, 0) / invoices.length
        : 0.98

    // Spend by category
    const spendByCategory: Record<string, number> = {}
    for (const inv of invoices) {
      spendByCategory[inv.vendorCategory] = (spendByCategory[inv.vendorCategory] || 0) + inv.total
    }

    // Spend by vendor
    const vendorMap = new Map<string, { amount: number; count: number; category: string }>()
    for (const inv of invoices) {
      const cur = vendorMap.get(inv.vendor) || { amount: 0, count: 0, category: inv.vendorCategory }
      cur.amount += inv.total
      cur.count += 1
      vendorMap.set(inv.vendor, cur)
    }

    const spendByVendor = Array.from(vendorMap.entries())
      .map(([vendor, data]) => ({ vendor, ...data }))
      .sort((a, b) => b.amount - a.amount)

    // Monthly trends (group by YYYY-MM)
    const monthMap = new Map<string, { amount: number; count: number }>()
    for (const inv of invoices) {
      const month = inv.issueDate.slice(0, 7) || '2026-11'
      const cur = monthMap.get(month) || { amount: 0, count: 0 }
      cur.amount += inv.total
      cur.count += 1
      monthMap.set(month, cur)
    }

    const monthlyTrends = Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))

    const recentFlags = invoices
      .flatMap((i) => i.flags)
      .slice(0, 6)

    return {
      totalSpend,
      totalInvoices: invoices.length,
      approvedCount: approved.length,
      approvedAmount: approved.reduce((acc, i) => acc + i.total, 0),
      flaggedCount: flagged.length,
      flaggedAmount: flagged.reduce((acc, i) => acc + i.total, 0),
      pendingCount: pending.length,
      pendingAmount: pending.reduce((acc, i) => acc + i.total, 0),
      rejectedCount: rejected.length,
      rejectedAmount: rejected.reduce((acc, i) => acc + i.total, 0),
      averageConfidence: avgConfidence,
      spendByCategory,
      spendByVendor,
      monthlyTrends,
      recentFlags,
    }
  }
}

import { invoiceService, InvoiceRecord } from './invoiceService'

export interface AssistantMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
  suggestedActions?: { label: string; action: string }[]
  referencedInvoices?: InvoiceRecord[]
}

export const aiAssistantService = {
  processQuestion(query: string): AssistantMessage {
    const invoices = invoiceService.getAll()
    const q = query.toLowerCase()

    let responseText = ''
    let referenced: InvoiceRecord[] = []
    let suggestions: { label: string; action: string }[] = []

    const flaggedInvoices = invoices.filter((i) => i.status === 'Flagged' || i.flags.length > 0)
    const pendingInvoices = invoices.filter((i) => i.status === 'Pending Audit')
    const approvedInvoices = invoices.filter((i) => i.status === 'Approved')
    const totalSpend = invoices.reduce((acc, i) => acc + i.total, 0)

    if (q.includes('error') || q.includes('flag') || q.includes('issue') || q.includes('problem') || q.includes('duplicate')) {
      if (flaggedInvoices.length === 0) {
        responseText = `Great news! There are currently **0 flagged issues** across your active invoices. All documents have passed math calculations, tax consistency, and duplicate checks.`
      } else {
        referenced = flaggedInvoices
        const details = flaggedInvoices
          .map(
            (inv) =>
              `• **${inv.vendor}** (Invoice #${inv.invoiceNumber}): $${inv.total.toFixed(2)} — ${inv.flags.map((f) => f.message).join(' ')}`
          )
          .join('\n')

        responseText = `I found **${flaggedInvoices.length} invoice(s) with flagged issues** requiring your review before approval:\n\n${details}\n\nWould you like me to open the correction modal or reject the duplicate submission?`
        suggestions = [
          { label: 'View Flagged Invoices', action: 'filter_flagged' },
          { label: 'Reject Duplicate Northwind Freight', action: 'reject_inv_002' },
        ]
      }
    } else if (q.includes('spend') || q.includes('total') || q.includes('cost') || q.includes('much') || q.includes('budget')) {
      const byCategory = invoices.reduce((acc, inv) => {
        acc[inv.vendorCategory] = (acc[inv.vendorCategory] || 0) + inv.total
        return acc
      }, {} as Record<string, number>)

      const catBreakdown = Object.entries(byCategory)
        .map(([cat, amt]) => `• **${cat}**: $${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
        .join('\n')

      responseText = `Your total tracked financial disbursements across all ${invoices.length} records is **$${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}**.\n\n**Spending Breakdown by Category:**\n${catBreakdown}\n\n**Status Summary:**\n• Approved: $${approvedInvoices.reduce((a, b) => a + b.total, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} (${approvedInvoices.length} invoices)\n• Flagged: $${flaggedInvoices.reduce((a, b) => a + b.total, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} (${flaggedInvoices.length} invoices)\n• Pending Audit: $${pendingInvoices.reduce((a, b) => a + b.total, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} (${pendingInvoices.length} invoices)`
      suggestions = [
        { label: 'Show Cloud & Infra Details', action: 'filter_cloud' },
        { label: 'Show Pending Invoices', action: 'filter_pending' },
      ]
    } else if (q.includes('vendor') || q.includes('supplier')) {
      const vendorSpend = invoices.reduce((acc, inv) => {
        acc[inv.vendor] = (acc[inv.vendor] || 0) + inv.total
        return acc
      }, {} as Record<string, number>)

      const topVendors = Object.entries(vendorSpend)
        .sort((a, b) => b[1] - a[1])
        .map(([v, amt]) => `• **${v}**: $${amt.toFixed(2)}`)
        .join('\n')

      responseText = `Here is your current vendor disbursement summary:\n\n${topVendors}\n\nYour highest disbursement this period is **${Object.entries(vendorSpend).sort((a, b) => b[1] - a[1])[0][0]}**.`
    } else if (q.includes('approve') || q.includes('pending')) {
      referenced = pendingInvoices
      responseText = `You currently have **${pendingInvoices.length} invoices pending audit** ($${pendingInvoices.reduce((a, b) => a + b.total, 0).toFixed(2)} total).\n\n${pendingInvoices.map((i) => `• ${i.vendor} (#${i.invoiceNumber}) — $${i.total.toFixed(2)}`).join('\n')}`
    } else {
      responseText = `I analyzed your current financial records (${invoices.length} invoices, $${totalSpend.toFixed(2)} total volume). I can help you with:\n\n• **Identifying flagged errors** and duplicate disbursements\n• **Category spending trends** (Cloud, SaaS, Logistics, Office)\n• **Vendor analysis** and contract reconciliation\n• **Approval status & history tracking**\n\nTry asking: *"Which invoices have errors?"* or *"What did we spend on Cloud infrastructure?"*`
      suggestions = [
        { label: 'Which invoices have errors?', action: 'ask_errors' },
        { label: 'How much did we spend on Cloud?', action: 'ask_cloud' },
        { label: 'List all pending approvals', action: 'ask_pending' },
      ]
    }

    return {
      id: `asst-${Date.now()}`,
      sender: 'assistant',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      referencedInvoices: referenced,
      suggestedActions: suggestions,
    }
  },
}

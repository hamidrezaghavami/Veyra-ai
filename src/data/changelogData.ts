export interface ChangelogItem {
  version: string
  date: string
  title: string
  description: string
  highlights: string[]
  quote?: {
    text: string
    author: string
  }
}

export const CHANGELOG_ITEMS: ChangelogItem[] = [
  {
    version: 'v2.4',
    date: 'Added Oct 21, 2026',
    title: 'Small things, fixed',
    description: 'A round of stability and accuracy enhancements based on customer feedback, focusing on scheduled batch auditing and error recovery.',
    highlights: [
      "Failed invoice parsing tasks retry automatically up to three times with enhanced vision models before being flagged for manual review",
      'Scheduled audits respect your workspace time zone, so "Daily 9:00 AM" means your local accounting day',
      'Queued documents now show real-time processing position and estimated completion time',
      'Status and vendor category filters now remember your last selection across sessions',
      'Webhook notifications no longer send twice after an automated retry',
    ],
  },
  {
    version: 'v2.3',
    date: 'Added Sep 30, 2026',
    title: 'See the work as it happens',
    description: 'Invoice inspection pages now update live with step-by-step audit timelines. Instead of waiting for a black-box result, you can follow each rule verification in real time.',
    highlights: [
      'Live execution progress bar showing verified checks (math sum, tax check, duplicate scan)',
      'Step-by-step audit trail timeline with plain-language rationale for every flagged item',
      'Confidence score badge and specific agent identifier handling the document',
      'Cancel & Reject button to halt disbursement immediately if an anomaly is spotted',
    ],
    quote: {
      text: 'Being able to read why the agent flagged a tax inconsistency is what made our accounting team comfortable letting it run on its own.',
      author: 'Sarah Mitchell, Product Lead at Lumen Labs',
    },
  },
  {
    version: 'v2.2',
    date: 'Added Sep 9, 2026',
    title: 'Know what your automations are worth',
    description: 'Spend Insights brings the critical numbers into a unified financial dashboard, showing the exact value and risk reduction of your automated audits.',
    highlights: [
      'Tasks automated: Total invoices, receipts, and line items verified',
      'Time saved: Estimated hours your finance team reclaimed this billing cycle',
      'Anomaly capture rate: Dollars saved from caught duplicate billings and calculation errors',
      'Interactive timeline chart switchable between total spend, flagged volume, and approval velocity',
      'Top vendors summary ranked by run volume, average amount, and payment frequency',
    ],
  },
  {
    version: 'v2.1',
    date: 'Added Aug 19, 2026',
    title: 'A home for each agent',
    description: 'As finance teams add specialized extraction rules for freight, SaaS, and office expenses, dedicated rule profiles keep everything transparent.',
    highlights: [
      'Overview: vendor coverage, creation date, version, and last active audit run',
      'Key metrics: document throughput, average processing time, and accuracy score',
      'Recent runs table: audit trail with status, duration, and flagged anomalies',
      'Direct deep-link from flagged invoice to the exact rule that triggered the notice',
    ],
  },
  {
    version: 'v2.0',
    date: 'Added Jul 29, 2026',
    title: 'Set it once, let it run',
    description: 'Most accounting work happens on a rhythm: end-of-month close, Friday disbursements, and new vendor onboarding. Scheduled automations run on timers and webhooks without manual prompts.',
    highlights: [
      'Scheduled runs: Every Friday, Daily at 9:00 AM, First Monday of the month',
      'Event triggers: On email forward, on drag-and-drop upload, on ERP webhook',
      'Unified Scheduled Tasks view showing active routines, run count, and health status',
      'Instant search and filter by status: Running, Done, Queued, or Flagged',
    ],
  },
]

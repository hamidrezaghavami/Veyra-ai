export interface BlogPost {
  slug: string
  title: string
  subtitle: string
  date: string
  readTime: string
  category: string
  coverGradient: string
  content: {
    intro: string
    sections: {
      heading: string
      paragraphs: string[]
    }[]
    summary: string
  }
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'automate-your-first-workflow',
    title: 'How to automate your first workflow in an afternoon',
    subtitle: 'A practical starting point for teams that know they do too much by hand.',
    date: 'Oct 28, 2026',
    readTime: '6 min read',
    category: 'Workflows',
    coverGradient: 'from-cyan-500/20 via-sky-600/10 to-transparent',
    content: {
      intro:
        'Most teams do not need a massive six-month IT project. They need one workflow that runs on its own, eliminates human transcription error, and gives a few hours back every single week. Here is how to pick it, build it, and trust it in an afternoon.',
      sections: [
        {
          heading: '1. List the work that repeats',
          paragraphs: [
            'Spend twenty minutes writing down the tasks your team does the exact same way every time: copying vendor totals from emails into an ERP, re-keying receipt dates, sending payment confirmations, or sorting incoming freight invoices.',
            'Ask three simple questions about each candidate: Does it happen more than 10 times a week? Does a clear rule determine the outcome? Is the input data structured or easily extractable?',
          ],
        },
        {
          heading: '2. Score your candidates',
          paragraphs: [
            'Rank candidates on two axes: time consumed vs. cost of failure. Avoid automating high-liability edge cases on day one. Start with invoice data extraction and matching: high repetition, deterministic rules, and massive time savings.',
          ],
        },
        {
          heading: '3. Map the steps before you build',
          paragraphs: [
            'Draw the path from raw document receipt to approved ledger entry. Define the trigger (new PDF uploaded or email received), the extraction step (OCR & AI parsing of vendor, date, line items, and taxes), and the validation checkpoints (duplicate check, math verification).',
          ],
        },
        {
          heading: '4. Run it next to the manual process',
          paragraphs: [
            'Do not flip the switch blindly. Run your automated pipeline in parallel with your manual review for one week. Compare the extracted numbers side-by-side with your manual entries. If the system flags a duplicate or a tax mismatch, verify whether the human caught it too.',
          ],
        },
        {
          heading: '5. Measure, then move to the next one',
          paragraphs: [
            'Track hours saved per operator, error reduction rates, and approval velocity. Once your team sees 15+ hours reclaimed every week, expansion to the next workflow becomes effortless.',
          ],
        },
      ],
      summary: 'Start small, prove the accuracy with parallel verification, and let automation handle the heavy lifting while your humans control final approvals.',
    },
  },
  {
    slug: 'the-hidden-cost-of-manual-handoffs',
    title: 'The hidden cost of manual handoffs',
    subtitle: 'Where work stalls between people and tools, and how to find those gaps.',
    date: 'Oct 14, 2026',
    readTime: '5 min read',
    category: 'Operations',
    coverGradient: 'from-blue-500/20 via-indigo-600/10 to-transparent',
    content: {
      intro:
        'Work rarely slows down inside an individual task. It slows down between tasks, when an invoice sits in an inbox waiting for an approval, or when a receipt sits in Slack waiting for someone to paste it into the accounting system.',
      sections: [
        {
          heading: 'Follow one request from start to finish',
          paragraphs: [
            'Pick a common financial request—like a contractor submitting an invoice—and trace every handoff. Notice who opens it, who forwards it, who verifies the line items, and how long it sits idle at each step. In 80% of organizations, the active work takes 4 minutes, but the total turnaround time is 6 days.',
          ],
        },
        {
          heading: 'Look for the waiting, not the working',
          paragraphs: [
            'The true friction is context switching. When an operator has to ask "Did we already pay this?", they stop their day to search through shared folders and banking records. This delay breeds duplicate disbursements.',
          ],
        },
        {
          heading: 'Automate the handoff, not the decision',
          paragraphs: [
            'You do not need to let AI blindly transfer money. Instead, let the system handle 100% of the extraction, the duplicate checks, and the tax calculations, and present a pre-audited summary to the manager with a 1-click Approve or Flag button.',
          ],
        },
        {
          heading: 'Make the context travel with the document',
          paragraphs: [
            'When every document carries its own audit trail—showing exactly which validation rules ran and why a flag was triggered—approvers make informed decisions in seconds rather than days.',
          ],
        },
      ],
      summary: 'Eliminate the friction between systems and keep your team in the driver seat with continuous automated context.',
    },
  },
  {
    slug: 'measure-what-automation-saves',
    title: 'How to measure what automation actually saves',
    subtitle: 'Simple metrics that show whether a workflow is paying off.',
    date: 'Sep 30, 2026',
    readTime: '4 min read',
    category: 'Finance',
    coverGradient: 'from-emerald-500/20 via-teal-600/10 to-transparent',
    content: {
      intro:
        'Automation feels productive. Proving it to leadership is another matter. A few simple numbers are enough to show whether a workflow earns its place and which areas to optimize next.',
      sections: [
        {
          heading: 'Start with a baseline',
          paragraphs: [
            'Before switching a workflow on, document the current baseline: how many minutes it takes to manually process one invoice, how often calculation errors slip through, and how many duplicate submissions are caught each month.',
          ],
        },
        {
          heading: 'Track four numbers',
          paragraphs: [
            '1. Tasks automated: total volume of documents processed.\n2. Hours returned: estimated time saved per operator per week.\n3. Error & anomaly capture rate: exact dollar value of duplicate billing and tax overcharges intercepted.\n4. Cycle time: elapsed hours from invoice receipt to final ledger entry.',
          ],
        },
        {
          heading: 'Watch for the quiet failures',
          paragraphs: [
            'A good automation system does not just succeed silently—it gracefully flags anomalies that require human eyes. If 95% of clean invoices pass instantly and 5% are flagged with clear warnings, your risk drops to zero while throughput spikes.',
          ],
        },
      ],
      summary: 'Hard financial data turns automation from an experiment into your company’s core operational advantage.',
    },
  },
  {
    slug: 'when-to-keep-a-human-in-the-loop',
    title: 'When to keep a human in the loop',
    subtitle: 'A short framework for deciding which steps run on their own and which need review.',
    date: 'Sep 16, 2026',
    readTime: '5 min read',
    category: 'Strategy',
    coverGradient: 'from-purple-500/20 via-pink-600/10 to-transparent',
    content: {
      intro:
        'Not every step should run untouched. The goal of modern financial AI is to automate what is safe and keep people where their judgment and fiduciary responsibility matter most.',
      sections: [
        {
          heading: 'Sort steps by risk',
          paragraphs: [
            'Ask one question about each step: What happens if this goes wrong? An incorrectly extracted line item name is easy to adjust. An unauthorized $50,000 disbursement sent to an unverified bank account is catastrophic.',
          ],
        },
        {
          heading: 'Let low-risk steps run on their own',
          paragraphs: [
            'Document OCR, line item summation, tax rate verification, vendor identification, and duplicate history checks should run automatically without human intervention.',
          ],
        },
        {
          heading: 'Add a review step where it counts',
          paragraphs: [
            'Final disbursement authorization and edge-case exceptions should always require human sign-off. The human should never have to re-type the document; they should simply review the findings and click Approve or Reject.',
          ],
        },
        {
          heading: 'Move the line as trust grows',
          paragraphs: [
            'As your system proves its precision over thousands of clean invoices, you can set auto-approval rules for recurring, verified vendors under $500 while preserving human reviews for larger or anomalous sums.',
          ],
        },
      ],
      summary: 'AI delivers clarity and error detection; you stay in control of every final approval.',
    },
  },
]

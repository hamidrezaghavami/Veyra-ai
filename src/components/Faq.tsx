import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const faqs = [
    {
      q: 'What does Veyra AI do?',
      a: 'Veyra AI processes invoices and receipts, tracks expenses, and flags potential financial errors. AI explains findings while validation logic checks calculations and financial consistency.',
    },
    {
      q: 'Which documents can I upload?',
      a: 'Upload invoices and receipts in PDF or image formats. Veyra AI extracts vendor names, invoice numbers, dates, line items, taxes, and totals.',
    },
    {
      q: 'Does AI approve invoices for me?',
      a: 'No. You review the findings, make corrections, and decide whether to approve or reject an invoice. Veyra AI keeps a history of the review process.',
    },
    {
      q: 'What issues can it identify?',
      a: 'Veyra AI flags potential duplicates, incorrect totals, tax inconsistencies, missing information, and unusual spending patterns for you to review.',
    },
    {
      q: 'What can I ask the AI assistant?',
      a: 'Ask about monthly spending, invoices with errors, or changes in expense categories. The assistant uses your financial records to provide understandable answers.',
    },
    {
      q: 'Who is Veyra AI built for?',
      a: 'Veyra AI is designed for freelancers, small businesses, and accounting teams that want to reduce manual invoice processing and better understand expenses.',
    },
  ]

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx)
  }

  return (
    <section id="faq" className="py-24 sm:py-32 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="eyebrow-tag mb-3">
            <span>FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-[-0.04em] text-white leading-[1.05]">
            Your questions. <br />
            Clear answers.
          </h2>
        </div>

        {/* Accordions */}
        <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {faqs.map((item, idx) => {
            const isOpen = openIdx === idx
            return (
              <div key={item.q} className="py-6">
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <span className="text-[17px] font-medium text-white group-hover:text-[#21d2ed] transition-colors pr-4">
                    {item.q}
                  </span>
                  <div className="size-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-[#b0b0b0] group-hover:text-white transition-colors">
                    {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="mt-3.5 pr-10 text-[15px] text-[#b0b0b0] leading-[1.5] animate-in fade-in duration-200">
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

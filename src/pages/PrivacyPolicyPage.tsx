import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-between relative overflow-hidden">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 max-w-3xl mx-auto w-full relative z-10">
        <div className="mb-12">
          <div className="eyebrow-tag mb-3">
            <span>Legal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-[14px] text-neutral-400">
            Last Updated: November 7, 2026
          </p>
        </div>

        <div className="surface-card p-6 sm:p-10 space-y-8 text-[15px] text-[#b0b0b0] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-white">Who We Are</h2>
            <p>
              Veyra AI is an AI automation and invoice intelligence platform. Use our <a href="/contact" className="text-cyan-300 underline">contact form</a> for privacy questions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-white">What Data We Collect</h2>
            <p>We may collect the following types of information when operating our financial services:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-300">
              <li>Contact details: Name, work email address, and company identifier.</li>
              <li>Document data: Vendor names, invoice line items, tax IDs, and totals extracted from uploaded PDFs and images.</li>
              <li>Audit logs: Timestamps, approval actions, flagged issues, and operator comments.</li>
              <li>Account data: Email address, name, and account identifier used to secure your records. Clerk manages sign-in, recovery, and authentication data. Existing password records from the previous login system are retained but no longer used for sign-in.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-white">How We Use Your Data</h2>
            <p>
              We process your documents strictly to execute optical character extraction, check duplicate submissions, verify calculation math, and maintain your AP approval trail. We do not sell your financial data to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-white">Processing and Storage</h2>
            <p>Vercel hosts the application and Neon PostgreSQL stores accounts, extracted invoice fields, review history, contact messages, and waitlist registrations. PDF and image contents are sent to Google Gemini for extraction. Assistant questions and your ledger summaries are sent to Gemini when you use the assistant. Provider processing is subject to their applicable terms. Google’s free-tier terms permit submitted content to be used to improve its products; paid-tier terms differ. Avoid uploading sensitive documents when using the free-tier service. Original upload files are not retained by Veyra. Session cookies keep you signed in; extracted records remain until deletion is requested through our contact form.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-white">Your Rights</h2>
            <p>
              Under applicable data protection laws (including GDPR and CCPA), you have the right to access, rectify, port, or request deletion of your financial records at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-white">Contact</h2>
            <p>
              For questions regarding this policy or data processing practices, please contact <a href="/contact" className="text-cyan-300 underline">our contact form</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

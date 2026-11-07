import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-between relative overflow-hidden">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 max-w-3xl mx-auto w-full relative z-10">
        <div className="mb-12">
          <div className="eyebrow-tag mb-3">
            <span>Legal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-white mb-3">
            Terms of Service
          </h1>
          <p className="text-[14px] text-neutral-400">
            Last Updated: Apr 22, 2026
          </p>
        </div>

        <div className="surface-card p-6 sm:p-10 space-y-8 text-[15px] text-[#b0b0b0] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-white">Use of the Platform</h2>
            <p>
              By accessing or using Veyra AI, you agree to be bound by these Terms of Service. Veyra provides software to assist in invoice processing and financial auditing. You remain solely responsible for authorizing financial disbursements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-white">Account Responsibility</h2>
            <p>
              You must maintain the confidentiality of your account credentials and one-time verification codes. You agree to notify us immediately of any unauthorized access to your workspace.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-white">Intellectual Property</h2>
            <p>
              All trademarks, algorithms, UI designs, and software components of Veyra AI are the property of Veyra AI and its licensors. You retain full ownership of all documents and invoice data uploaded to your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-white">Limitation of Liability</h2>
            <p>
              Veyra AI provides rule-based checking and artificial intelligence extraction as an assistive tool. While our models target maximum accuracy, final payment execution decisions rest with your designated finance operators.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-white">Contact</h2>
            <p>
              If you have inquiries concerning these terms, contact <span className="text-[#21d2ed]">hello@veyra.ai</span>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

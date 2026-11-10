import { useLanguage } from '../context/LanguageContext'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'

export function TermsOfServicePage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-between relative overflow-hidden">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 max-w-3xl mx-auto w-full relative z-10">
        <div className="mb-12">
          <div className="eyebrow-tag mb-3">
            <span>{t("Legal")}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-white mb-3">{t("Terms of Service")}</h1>
          <p className="text-[14px] text-neutral-400">{t("Last Updated: November 7, 2026")}</p>
        </div>

        <div className="surface-card p-6 sm:p-10 space-y-8 text-[15px] text-[#b0b0b0] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-medium text-white">{t("Use of the Platform")}</h2>
            <p>{t("By accessing or using Veyra AI, you agree to be bound by these Terms of Service. Veyra provides software to assist in invoice processing and financial auditing. You remain solely responsible for authorizing financial disbursements.")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-white">{t("Account Responsibility")}</h2>
            <p>{t("You must maintain the confidentiality of your account credentials . You agree to notify us immediately of any unauthorized access to your workspace.")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-white">{t("Intellectual Property")}</h2>
            <p>{t("All trademarks, algorithms, UI designs, and software components of Veyra AI are the property of Veyra AI and its licensors. You retain full ownership of all documents and invoice data uploaded to your account.")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-white">{t("Limitation of Liability")}</h2>
            <p>{t("Veyra AI provides rule-based checking and artificial intelligence extraction as an assistive tool. While our models target maximum accuracy, final payment execution decisions rest with your designated finance operators.")}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-medium text-white">{t("Contact")}</h2>
            <p>{t("If you have inquiries concerning these terms, contact ")}<a href="/contact" className="text-cyan-300 underline">{t("our contact form")}</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

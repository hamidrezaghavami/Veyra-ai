import { useLanguage } from '../context/LanguageContext'
import { ArrowLeft, Clock, Calendar, Share2, Check } from 'lucide-react'
import { useState } from 'react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { CtaBanner } from '../components/CtaBanner'
import { LiquidButton } from '../components/LiquidButton'
import { BLOG_POSTS } from '../data/blogData'
import { useRouter } from '../context/RouterContext'

export function BlogPostPage({ slug }: { slug: string }) {
  const { t } = useLanguage()

  const { navigate } = useRouter()
  const [copied, setCopied] = useState(false)

  const post = BLOG_POSTS.find((p) => p.slug === slug) || BLOG_POSTS[0]

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-between relative overflow-hidden">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 max-w-4xl mx-auto w-full relative z-10">
        {/* Back Link */}
        <button
          onClick={() => navigate('/blog')}
          className="inline-flex items-center gap-2 text-[14px] text-neutral-400 hover:text-white transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>{t("← Back to blog")}</span>
        </button>

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 text-[13px] text-neutral-400 mb-4">
            <span className="px-3 py-0.5 rounded-full liquid-glass-secondary border-[#21d2ed]/30 text-[#21d2ed] font-medium text-[12px]">
              {t(post.category)}
            </span>
            <span>{t(post.date)}</span>
            <span>·</span>
            <span>{t(post.readTime)}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-[-0.04em] text-white leading-[1.08] mb-6">
            {t(post.title)}
          </h1>

          <p className="text-lg sm:text-xl text-[#b0b0b0] leading-[1.5] font-normal">
            {t(post.subtitle)}
          </p>
        </header>

        {/* Hero Decorative Banner */}
        <div className={`h-48 sm:h-64 rounded-2xl bg-gradient-to-br ${post.coverGradient} border border-white/10 mb-12 flex items-center justify-center p-6 relative overflow-hidden`}>
          <div className="text-center">
            <span className="text-[12px] uppercase font-mono tracking-widest text-[#21d2ed] block mb-2">{t("Veyra Operational Architecture")}</span>
            <div className="text-2xl font-medium text-white tracking-tight">{t("Continuous Financial Intelligence")}</div>
          </div>
        </div>

        {/* Article Body */}
        <article className="prose prose-invert max-w-none space-y-10 text-[16px] text-[#b0b0b0] leading-relaxed">
          <p className="text-lg text-white font-normal leading-relaxed">
            {t(post.content.intro)}
          </p>

          {post.content.sections.map((sec) => (
            <div key={sec.heading} className="space-y-4 pt-4">
              <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-[-0.03em]">
                {t(sec.heading)}
              </h2>
              {sec.paragraphs.map((p, idx) => (
                <p key={idx} className="whitespace-pre-line">
                  {t(p)}
                </p>
              ))}
            </div>
          ))}

          {/* Key Takeaway Callout */}
          <div className="surface-card p-6 border-l-4 border-l-[#21d2ed] rounded-r-xl my-8">
            <div className="text-[12px] font-mono uppercase tracking-wider text-[#21d2ed] mb-1">{t("Key Takeaway")}</div>
            <p className="text-white text-[15px] font-normal italic">
              "{t(post.content.summary)}"
            </p>
          </div>
        </article>

        {/* Author & Share Footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-[#18181c] border border-white/10 flex items-center justify-center text-[#21d2ed] font-medium text-[13px]">{t("KC")}</div>
            <div>
              <div className="text-[14px] font-medium text-white">{t("Kadir Calik")}</div>
              <div className="text-[12px] text-neutral-400">{t("Founder & Product Architect, Veyra AI")}</div>
            </div>
          </div>

          <LiquidButton
            variant="secondary"
            size="sm"
            onClick={handleShare}
            icon={copied ? <Check className="size-3.5 text-emerald-400" /> : <Share2 className="size-3.5" />}
          >
            {copied ? t('Copied link!') : t('Share article')}
          </LiquidButton>
        </div>

        <div className="mt-20">
          <CtaBanner />
        </div>
      </main>

      <Footer />
    </div>
  )
}

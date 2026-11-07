import { useState } from 'react'
import { ArrowRight, Search, Clock, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { CtaBanner } from '../components/CtaBanner'
import { BLOG_POSTS } from '../data/blogData'
import { useRouter } from '../context/RouterContext'

export function BlogPage() {
  const { navigate } = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')

  const categories = ['All', 'Workflows', 'Operations', 'Finance', 'Strategy']

  const filtered = BLOG_POSTS.filter((post) => {
    const matchCat = selectedCategory === 'All' || post.category === selectedCategory
    const matchSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.subtitle.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-between relative overflow-hidden">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6 max-w-6xl mx-auto w-full relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="eyebrow-tag mb-3">
            <span>Blog</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-medium tracking-[-0.04em] text-white leading-[1.05] mb-4">
            The Veyra AI blog
          </h1>
          <p className="text-lg text-[#b0b0b0]">
            Guides to invoice auditing, expense management, and clearer financial decisions.
          </p>
        </div>

        {/* Filters with Liquid Glass Styling */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-8 border-b border-white/[0.06] mb-10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'liquid-glass-primary shadow-md'
                    : 'text-[#b0b0b0] hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search guides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#141824]/80 border border-white/10 rounded-full pl-9 pr-3 py-1.5 text-[13px] text-white focus:outline-none focus:border-[#21d2ed]"
            />
          </div>
        </div>

        {/* Blog Posts 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {filtered.map((post) => (
            <motion.article
              key={post.slug}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="surface-card p-6 sm:p-7 flex flex-col justify-between group hover:border-white/20 transition-all duration-300 cursor-pointer"
            >
              <div>
                {/* Visual Header */}
                <div className={`h-40 rounded-xl bg-gradient-to-br ${post.coverGradient} border border-white/5 p-5 flex flex-col justify-between mb-5`}>
                  <span className="self-start text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full liquid-glass-secondary text-[#21d2ed] border border-[#21d2ed]/30">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-4 text-[12px] text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-medium text-white tracking-[-0.03em] leading-snug group-hover:text-[#21d2ed] transition-colors mb-3">
                  {post.title}
                </h2>
                <p className="text-[14px] text-[#b0b0b0] leading-[1.5]">
                  {post.subtitle}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-1.5 text-[13px] font-medium text-white group-hover:text-[#21d2ed] transition-colors">
                <span>Read article</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.article>
          ))}
        </div>

        <CtaBanner />
      </main>

      <Footer />
    </div>
  )
}

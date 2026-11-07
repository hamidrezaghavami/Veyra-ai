import { useState, useEffect } from 'react'
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
  Sparkles,
  DollarSign,
  BarChart3,
  Bot,
  Send,
  LogOut,
  Clock,
  ShieldAlert,
  ArrowRight,
  User,
  ExternalLink,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { invoiceService, InvoiceRecord } from '../services/invoiceService'
import { authService, UserSession } from '../services/authService'
import { aiAssistantService, AssistantMessage } from '../services/aiAssistantService'
import { useRouter } from '../context/RouterContext'
import { useClerkConfig, useUser, UserButton, SignedIn, SignedOut } from '../lib/clerk'

export function DashboardPage() {
  const { navigate } = useRouter()
  const { isConfigured } = useClerkConfig()
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [activeTab, setActiveTab] = useState<'invoices' | 'upload' | 'analytics' | 'assistant'>('invoices')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null)
  const [isProcessingUpload, setIsProcessingUpload] = useState(false)
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('')

  // AI Assistant chat state
  const [chatMessages, setChatMessages] = useState<AssistantMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Hello! I am your **Veyra Financial Assistant**. I've audited your active invoices and flagged 2 items needing review (duplicate freight invoice & tax mismatch). How can I assist you today?",
      timestamp: 'Just now',
      suggestedActions: [
        { label: 'Which invoices have errors?', action: 'ask_errors' },
        { label: 'What is our total spend this quarter?', action: 'ask_spend' },
        { label: 'Show Cloud infrastructure expenses', action: 'ask_cloud' },
      ],
    },
  ])
  const [inputQuery, setInputQuery] = useState('')

  // Initial load
  useEffect(() => {
    if (!isConfigured) {
      let user = authService.getCurrentUser()
      if (!user) {
        user = authService.createUserSession('controller@veyra.ai', 'Finance Controller')
      }
      setCurrentUser(user)
    }
    setInvoices(invoiceService.getAll())
  }, [isConfigured])

  const reloadInvoices = () => {
    const list = invoiceService.getAll()
    setInvoices(list)
    if (selectedInvoice) {
      const updated = list.find((i) => i.id === selectedInvoice.id)
      setSelectedInvoice(updated || null)
    }
  }

  // Sign out handler
  const handleSignOut = () => {
    try {
      authService.logout()
    } catch {
      // ignore
    }
    navigate('/sign-in')
  }

  // Handle Approve
  const handleApprove = (id: string) => {
    const approverName = currentUser?.name || 'Controller'
    invoiceService.approve(id, approverName)
    reloadInvoices()
  }

  // Handle Reject
  const handleReject = (id: string) => {
    const reason = prompt(
      'Please enter the rejection reason for AP audit log:',
      'Disbursement rejected due to policy mismatch / duplicate submission.'
    )
    if (reason) {
      const approverName = currentUser?.name || 'Controller'
      invoiceService.reject(id, reason, approverName)
      reloadInvoices()
    }
  }

  // Handle Flag for Review
  const handleFlag = (id: string) => {
    const comment = prompt('Enter a note for the auditing team:', 'Please verify vendor tax ID with procurement.')
    if (comment) {
      const approverName = currentUser?.name || 'Controller'
      invoiceService.flagForReview(id, comment, approverName)
      reloadInvoices()
    }
  }

  // Quick Sample Ingest
  const handleIngestSample = (type: 'clean' | 'duplicate' | 'tax_err') => {
    setIsProcessingUpload(true)
    setUploadSuccessMessage('')

    setTimeout(() => {
      let sample
      if (type === 'clean') {
        sample = {
          invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
          vendor: 'Figma Design Cloud',
          vendorCategory: 'Software / SaaS' as const,
          issueDate: new Date().toISOString().slice(0, 10),
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          subtotal: 1800.0,
          taxRate: 0.0825,
          taxAmount: 148.5,
          total: 1948.5,
          currency: 'USD',
          fileName: 'figma-enterprise-seats.pdf',
          lineItems: [
            { id: 'li-1', description: 'Enterprise Design Editor Seats (x10)', quantity: 10, unitPrice: 75.0, total: 750.0 },
            { id: 'li-2', description: 'FigJam Organization Whiteboard Tier', quantity: 1, unitPrice: 1050.0, total: 1050.0 },
          ],
        }
      } else if (type === 'duplicate') {
        sample = {
          invoiceNumber: 'INV-2026-4828', // Same number as existing invoice
          vendor: 'Northwind Global Freight LLC',
          vendorCategory: 'Logistics' as const,
          issueDate: new Date().toISOString().slice(0, 10),
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
          subtotal: 6280.0,
          taxRate: 0.0,
          taxAmount: 0.0,
          total: 6280.0,
          currency: 'USD',
          fileName: 'northwind-resubmission-copy.pdf',
          lineItems: [
            { id: 'li-dup', description: 'Cross-Border Drayage & Container Handling', quantity: 2, unitPrice: 2800.0, total: 5600.0 },
            { id: 'li-fuel', description: 'Fuel Surcharge Peak Adjustment', quantity: 1, unitPrice: 680.0, total: 680.0 },
          ],
        }
      } else {
        sample = {
          invoiceNumber: `INV-TAX-${Math.floor(1000 + Math.random() * 9000)}`,
          vendor: 'Global Cloud Systems Inc',
          vendorCategory: 'Cloud & Infra' as const,
          issueDate: new Date().toISOString().slice(0, 10),
          dueDate: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
          subtotal: 2500.0,
          taxRate: 0.05, // Expected $125
          taxAmount: 305.0, // Error: $180 mismatch
          total: 2805.0,
          currency: 'USD',
          fileName: 'cloud-infra-tax-err.pdf',
          lineItems: [
            { id: 'li-err1', description: 'Dedicated Virtual Host Cluster (Tier 2)', quantity: 2, unitPrice: 1250.0, total: 2500.0 },
          ],
        }
      }

      invoiceService.uploadAndIngest(sample)
      setIsProcessingUpload(false)
      setUploadSuccessMessage(`Successfully ingested "${sample.invoiceNumber}" from ${sample.vendor}. Audit completed!`)
      reloadInvoices()
    }, 800)
  }

  // Handle AI Chat query
  const handleSendQuery = (textToSend?: string) => {
    const q = textToSend || inputQuery
    if (!q.trim()) return

    const userMsg: AssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: 'Just now',
    }

    setChatMessages((prev) => [...prev, userMsg])
    setInputQuery('')

    setTimeout(async () => {
      const response = await aiAssistantService.processQuestion(q)
      setChatMessages((prev) => [...prev, response])
    }, 400)
  }

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'flagged'
        ? inv.status === 'Flagged' || inv.flags.length > 0
        : statusFilter === 'approved'
        ? inv.status === 'Approved'
        : statusFilter === 'pending'
        ? inv.status === 'Pending Audit'
        : inv.status === 'Rejected'

    const matchesSearch =
      inv.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.vendorCategory.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  // Financial Stats
  const totalVolume = invoices.reduce((acc, i) => acc + i.total, 0)
  const flaggedCount = invoices.filter((i) => i.status === 'Flagged' || i.flags.length > 0).length
  const approvedTotal = invoices.filter((i) => i.status === 'Approved').reduce((acc, i) => acc + i.total, 0)

  // Clean, comfortable, cohesive dashboard with gentle light-blue ambient lighting
  const dashboardContent = (
    <div className="min-h-screen bg-[#07090e] text-neutral-100 flex flex-col relative selection:bg-[#21d2ed]/30 selection:text-white font-sans antialiased overflow-hidden">
      {/* Gentle ambient light-blue background gradients (calm, static, restful for the eyes) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Soft light-blue radial glow at top-center */}
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(33,210,237,0.12),transparent_70%)] blur-2xl" />
        {/* Gentle cyan glow at top-right */}
        <div className="absolute top-[25%] right-[-10%] w-[700px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.07),transparent_65%)] blur-3xl" />
        {/* Soft indigo glow at bottom-left */}
        <div className="absolute bottom-[-15%] left-[-10%] w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06),transparent_70%)] blur-3xl" />
        {/* Very subtle static micro-grid for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />
      </div>

      {/* Top Header Bar — Refined, Cohesive Glass Header */}
      <header className="sticky top-0 z-40 bg-[#090d18]/85 backdrop-blur-xl border-b border-cyan-500/15 px-4 sm:px-8 py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 text-white hover:opacity-85 transition-opacity cursor-pointer group"
            >
              <div className="size-8 rounded-lg bg-[#121829] border border-cyan-500/30 flex items-center justify-center p-1.5 text-[#21d2ed] shadow-[0_0_12px_rgba(33,210,237,0.2)] group-hover:border-cyan-400 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="size-full">
                  <path
                    d="M4 6L12 18L20 6"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="1.8" fill="currentColor" />
                </svg>
              </div>
              <span className="font-semibold text-[17px] tracking-tight text-white">Veyra Console</span>
            </button>
            <span className="text-neutral-700 hidden sm:inline">|</span>
            <span className="text-[13px] text-cyan-200/60 hidden sm:inline font-medium">Audit Ledger & Spend Control</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                invoiceService.resetDefaults()
                reloadInvoices()
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121829]/90 hover:bg-[#1a2238] text-neutral-300 hover:text-white border border-cyan-500/20 text-[12.5px] font-medium transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className="size-3.5 text-cyan-400" />
              <span>Reset Sample Data</span>
            </button>

            {/* User Profile Pill & Explicit Sign Out */}
            <DashboardUserBar currentUser={currentUser} onSignOut={handleSignOut} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* KPI Strip — Visible, Calm, High-Visibility Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Volume */}
          <div className="bg-[#0d1220]/80 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-500/35 rounded-xl p-5 shadow-[0_6px_24px_rgba(0,0,0,0.35)] relative overflow-hidden group transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />
            <div className="text-[12px] text-neutral-400 font-medium tracking-wide uppercase mb-2">
              Total Audited Volume
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight tabular-nums">
              ${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[12px] text-neutral-400 mt-2.5 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#21d2ed] shadow-[0_0_8px_rgba(33,210,237,0.6)]" />
              <span>{invoices.length} invoices on corporate record</span>
            </div>
          </div>

          {/* Card 2: Flagged Anomalies */}
          <div className="bg-[#18111a]/85 backdrop-blur-md border border-rose-500/30 hover:border-rose-500/50 rounded-xl p-5 shadow-[0_6px_24px_rgba(0,0,0,0.35)] relative overflow-hidden group transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/35 to-transparent" />
            <div className="text-[12px] text-rose-300 font-medium tracking-wide uppercase mb-2 flex items-center justify-between">
              <span>Flagged Anomalies</span>
              <AlertTriangle className="size-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-rose-400 tracking-tight tabular-nums">
              {flaggedCount} {flaggedCount === 1 ? 'Invoice' : 'Invoices'}
            </div>
            <div className="text-[12px] text-rose-300/80 mt-2.5 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              <span>Requires controller action</span>
            </div>
          </div>

          {/* Card 3: Approved Disbursements */}
          <div className="bg-[#0b1716]/85 backdrop-blur-md border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl p-5 shadow-[0_6px_24px_rgba(0,0,0,0.35)] relative overflow-hidden group transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent" />
            <div className="text-[12px] text-emerald-300 font-medium tracking-wide uppercase mb-2 flex items-center justify-between">
              <span>Approved Disbursements</span>
              <CheckCircle2 className="size-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-emerald-400 tracking-tight tabular-nums">
              ${approvedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[12px] text-emerald-300/80 mt-2.5 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span>Cleared for payment disbursement</span>
            </div>
          </div>

          {/* Card 4: AI OCR Engine */}
          <div className="bg-[#0c1524]/85 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl p-5 shadow-[0_6px_24px_rgba(0,0,0,0.35)] relative overflow-hidden group transition-all">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />
            <div className="text-[12px] text-cyan-300 font-medium tracking-wide uppercase mb-2 flex items-center justify-between">
              <span>AI Validation Accuracy</span>
              <Sparkles className="size-4 text-[#21d2ed]" />
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight tabular-nums">
              99.4%
            </div>
            <div className="text-[12px] text-cyan-200/70 mt-2.5 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#21d2ed] shadow-[0_0_8px_rgba(33,210,237,0.6)]" />
              <span>Vision OCR & 4-tier rule engine</span>
            </div>
          </div>
        </div>

        {/* Tab Controls — Refined, Soft-Border Segmented Bar */}
        <div className="bg-[#0d1220]/85 backdrop-blur-md border border-cyan-500/20 p-1.5 rounded-xl flex items-center gap-2 overflow-x-auto no-scrollbar shadow-sm">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-lg text-[13.5px] font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-gradient-to-r from-[#21d2ed] to-[#1cb5cc] text-neutral-950 font-semibold shadow-[0_0_16px_rgba(33,210,237,0.3)]'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <FileText className="size-4" />
            <span>Invoices & Audits</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-semibold tabular-nums ${
                activeTab === 'invoices' ? 'bg-black/20 text-neutral-950' : 'bg-white/10 text-neutral-300'
              }`}
            >
              {invoices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-lg text-[13.5px] font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-[#21d2ed] to-[#1cb5cc] text-neutral-950 font-semibold shadow-[0_0_16px_rgba(33,210,237,0.3)]'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <UploadCloud className="size-4" />
            <span>Upload Document</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-[13.5px] font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-[#21d2ed] to-[#1cb5cc] text-neutral-950 font-semibold shadow-[0_0_16px_rgba(33,210,237,0.3)]'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <BarChart3 className="size-4" />
            <span>Spend Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-4 py-2 rounded-lg text-[13.5px] font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'assistant'
                ? 'bg-gradient-to-r from-[#21d2ed] to-[#1cb5cc] text-neutral-950 font-semibold shadow-[0_0_16px_rgba(33,210,237,0.3)]'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Bot className="size-4" />
            <span>AI Financial Assistant</span>
            <span className="size-2 rounded-full bg-[#21d2ed] shadow-[0_0_6px_rgba(33,210,237,0.8)]" />
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: INVOICES & AUDITS TABLE */}
        {/* ==================================================== */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-[#0d1220]/85 backdrop-blur-md border border-cyan-500/20 p-3 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {['all', 'flagged', 'pending', 'approved', 'rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-[12.5px] capitalize font-medium transition-all shrink-0 cursor-pointer ${
                      statusFilter === st
                        ? 'bg-white text-neutral-950 font-semibold shadow-sm'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/60" />
                <input
                  type="text"
                  placeholder="Search vendor, invoice #, amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121727] border border-cyan-500/25 rounded-lg pl-9 pr-3 py-1.5 text-[13px] text-white placeholder-neutral-500 focus:outline-none focus:border-[#21d2ed] focus:ring-1 focus:ring-[#21d2ed]/30 transition-all"
                />
              </div>
            </div>

            {/* Invoices Table Box */}
            <div className="bg-[#0d1220]/85 backdrop-blur-md border border-cyan-500/20 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-[#111728] text-neutral-400 text-[11.5px] font-semibold uppercase tracking-wider border-b border-cyan-500/15">
                      <th className="py-3.5 px-4">Invoice / File</th>
                      <th className="py-3.5 px-4">Vendor</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Billing Date</th>
                      <th className="py-3.5 px-4 text-right">Amount</th>
                      <th className="py-3.5 px-4">Audit Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#172036]">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-neutral-400">
                          No invoices matching the current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((inv) => (
                        <tr
                          key={inv.id}
                          onClick={() => setSelectedInvoice(inv)}
                          className="hover:bg-[#131b2e] transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-4 text-white">
                            <div className="flex items-center gap-2">
                              <FileText className="size-3.5 text-cyan-400/70 group-hover:text-[#21d2ed] transition-colors" />
                              <span className="font-semibold text-[13.5px] tracking-tight">{inv.invoiceNumber}</span>
                            </div>
                            {inv.fileName && (
                              <div className="text-[11.5px] text-neutral-400 mt-0.5">{inv.fileName}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-neutral-200">{inv.vendor}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-medium">
                              {inv.vendorCategory}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-400 text-[12.5px] tabular-nums">{inv.issueDate}</td>
                          <td className="py-3.5 px-4 text-right font-semibold text-white text-[14px] tabular-nums">
                            ${inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4">
                            {inv.status === 'Approved' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11.5px] font-medium">
                                <CheckCircle2 className="size-3" />
                                Approved
                              </span>
                            )}
                            {inv.status === 'Flagged' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/40 text-[11.5px] font-medium">
                                <AlertTriangle className="size-3 text-rose-400" />
                                Flagged ({inv.flags.length})
                              </span>
                            )}
                            {inv.status === 'Pending Audit' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/40 text-[11.5px] font-medium">
                                <Clock className="size-3" />
                                Pending
                              </span>
                            )}
                            {inv.status === 'Rejected' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-400 border border-neutral-700 text-[11.5px] font-medium">
                                <XCircle className="size-3" />
                                Rejected
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {inv.status !== 'Approved' && (
                                <button
                                  onClick={() => handleApprove(inv.id)}
                                  className="px-2.5 py-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/40 text-[11.5px] font-semibold transition-all cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              {inv.status !== 'Rejected' && (
                                <button
                                  onClick={() => handleReject(inv.id)}
                                  className="px-2.5 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-[11.5px] font-semibold transition-all cursor-pointer"
                                >
                                  Reject
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedInvoice(inv)}
                                className="px-2.5 py-1 rounded-md bg-[#161c2d] hover:bg-[#202840] text-neutral-300 hover:text-white border border-cyan-500/20 text-[11.5px] font-medium transition-all cursor-pointer"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: UPLOAD & INGESTION */}
        {/* ==================================================== */}
        {activeTab === 'upload' && (
          <div className="max-w-3xl mx-auto space-y-5">
            {/* Comfortable Drop Zone */}
            <div className="bg-[#0d1220]/80 backdrop-blur-md border-2 border-dashed border-cyan-500/25 hover:border-cyan-400/50 rounded-xl p-8 text-center transition-all shadow-md">
              <div className="size-14 rounded-xl bg-[#121829] border border-cyan-500/30 flex items-center justify-center text-[#21d2ed] mx-auto mb-4 shadow-[0_0_15px_rgba(33,210,237,0.2)]">
                <UploadCloud className="size-7" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Upload invoice or receipt</h3>
              <p className="text-[13.5px] text-neutral-400 max-w-md mx-auto mb-6">
                Ingest any PDF, PNG, or JPEG. Veyra AI will parse vendors, calculate math sums, extract taxes, and check duplicate records.
              </p>

              {isProcessingUpload ? (
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-lg bg-[#121829] border border-[#21d2ed]/40 text-[#21d2ed] text-sm animate-pulse">
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Extracting document with Gemini OCR & auditing...</span>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#21d2ed] to-[#1cb5cc] hover:opacity-95 text-neutral-950 font-semibold text-sm transition-all cursor-pointer shadow-[0_0_20px_rgba(33,210,237,0.3)]">
                  <UploadCloud className="size-4" />
                  <span>Choose Document from Computer</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={() => handleIngestSample('clean')}
                  />
                </label>
              )}

              {uploadSuccessMessage && (
                <div className="mt-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[13px] font-medium">
                  {uploadSuccessMessage}
                </div>
              )}
            </div>

            {/* Quick 1-Click Test Scenarios */}
            <div className="bg-[#0d1220]/80 backdrop-blur-md border border-cyan-500/20 rounded-xl p-6 shadow-md">
              <div className="text-[12px] uppercase tracking-wider text-[#21d2ed] font-semibold mb-2">
                1-Click Audit Test Scenarios
              </div>
              <p className="text-[13px] text-neutral-400 mb-4">
                Click any pre-configured document scenario to immediately test how Veyra catches anomalies:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleIngestSample('clean')}
                  disabled={isProcessingUpload}
                  className="p-4 rounded-lg bg-[#121727] border border-cyan-500/20 hover:border-emerald-500/50 text-left transition-all cursor-pointer group"
                >
                  <div className="text-[13.5px] font-semibold text-white mb-1 flex items-center justify-between">
                    <span>Clean Invoice</span>
                    <CheckCircle2 className="size-4 text-emerald-400" />
                  </div>
                  <div className="text-[11.5px] text-neutral-400 leading-snug">
                    Figma SaaS subscription ($1,948.50). 100% clean check.
                  </div>
                </button>

                <button
                  onClick={() => handleIngestSample('duplicate')}
                  disabled={isProcessingUpload}
                  className="p-4 rounded-lg bg-[#121727] border border-cyan-500/20 hover:border-rose-500/50 text-left transition-all cursor-pointer group"
                >
                  <div className="text-[13.5px] font-semibold text-white mb-1 flex items-center justify-between">
                    <span>Duplicate Submission</span>
                    <AlertTriangle className="size-4 text-rose-400" />
                  </div>
                  <div className="text-[11.5px] text-neutral-400 leading-snug">
                    Re-submitted Northwind Freight invoice. Triggers duplicate alert.
                  </div>
                </button>

                <button
                  onClick={() => handleIngestSample('tax_err')}
                  disabled={isProcessingUpload}
                  className="p-4 rounded-lg bg-[#121727] border border-cyan-500/20 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
                >
                  <div className="text-[13.5px] font-semibold text-white mb-1 flex items-center justify-between">
                    <span>Tax Calculation Error</span>
                    <AlertTriangle className="size-4 text-amber-400" />
                  </div>
                  <div className="text-[11.5px] text-neutral-400 leading-snug">
                    Cloud invoice with $180 overbilled tax mismatch.
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: SPEND ANALYTICS */}
        {/* ==================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Category Breakdown Box */}
              <div className="bg-[#0d1220]/80 backdrop-blur-md border border-cyan-500/20 rounded-xl p-6 shadow-md">
                <h3 className="text-base font-semibold text-white mb-4">Disbursements by Category</h3>
                <div className="space-y-4">
                  {[
                    { cat: 'Cloud & Infrastructure', amount: 5217.65, pct: 41, color: 'bg-[#21d2ed]' },
                    { cat: 'Freight & Logistics', amount: 6280.0, pct: 38, color: 'bg-indigo-400' },
                    { cat: 'Software & SaaS', amount: 3074.3, pct: 14, color: 'bg-violet-400' },
                    { cat: 'Hardware & Supplies', amount: 1630.0, pct: 7, color: 'bg-emerald-400' },
                  ].map((row) => (
                    <div key={row.cat}>
                      <div className="flex justify-between text-[13px] mb-1.5">
                        <span className="text-neutral-300 font-medium">{row.cat}</span>
                        <span className="text-white font-semibold tabular-nums">
                          ${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({row.pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#182033] rounded-full overflow-hidden">
                        <div className={`h-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Vendors Box */}
              <div className="bg-[#0d1220]/80 backdrop-blur-md border border-cyan-500/20 rounded-xl p-6 shadow-md">
                <h3 className="text-base font-semibold text-white mb-4">Top Vendor Disbursements</h3>
                <div className="divide-y divide-[#172036]">
                  {invoices.slice(0, 5).map((inv) => (
                    <div key={inv.id} className="py-3 flex items-center justify-between text-[13px]">
                      <div>
                        <div className="font-semibold text-white">{inv.vendor}</div>
                        <div className="text-[11.5px] text-neutral-400 tabular-nums">Invoice #{inv.invoiceNumber}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold tabular-nums">${inv.total.toFixed(2)}</div>
                        <div className="text-[11px] text-neutral-400 font-medium">{inv.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: AI FINANCIAL ASSISTANT */}
        {/* ==================================================== */}
        {activeTab === 'assistant' && (
          <div className="max-w-3xl mx-auto bg-[#0d1220]/85 backdrop-blur-md border border-cyan-500/20 rounded-xl p-5 flex flex-col h-[600px] shadow-xl">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-cyan-500/15">
              <div className="size-9 rounded-lg bg-[#121829] border border-cyan-500/30 flex items-center justify-center text-[#21d2ed] shadow-[0_0_12px_rgba(33,210,237,0.2)]">
                <Bot className="size-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-white">Veyra Financial Assistant</h3>
                <p className="text-[11.5px] text-neutral-400">Grounded in corporate invoice records and anomaly checks</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-xl text-[13.5px] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-[#21d2ed] to-[#1cb5cc] text-neutral-950 font-semibold rounded-br-none shadow-[0_0_15px_rgba(33,210,237,0.25)]'
                        : 'bg-[#121727] border border-cyan-500/20 text-white rounded-bl-none whitespace-pre-wrap'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 px-1">{msg.timestamp}</span>

                  {/* Suggested chips */}
                  {msg.suggestedActions && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.suggestedActions.map((sug) => (
                        <button
                          key={sug.label}
                          onClick={() => handleSendQuery(sug.label)}
                          className="text-[11.5px] px-3 py-1 rounded-md bg-[#121727] hover:bg-[#1a2238] text-neutral-300 hover:text-white border border-cyan-500/20 transition-all cursor-pointer"
                        >
                          {sug.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="pt-3 border-t border-cyan-500/15 flex gap-2">
              <input
                type="text"
                placeholder="Ask about invoices, spend, or duplicate alerts..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
                className="flex-1 bg-[#121727] border border-cyan-500/25 rounded-lg px-4 py-2.5 text-[13.5px] text-white placeholder-neutral-500 focus:outline-none focus:border-[#21d2ed] focus:ring-1 focus:ring-[#21d2ed]/30 transition-all"
              />
              <button
                onClick={() => handleSendQuery()}
                className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#21d2ed] to-[#1cb5cc] hover:opacity-95 text-neutral-950 font-semibold transition-all cursor-pointer flex items-center justify-center shadow-[0_0_15px_rgba(33,210,237,0.3)]"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* INVOICE DETAILS MODAL */}
      {/* ==================================================== */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0c111e] border border-cyan-500/30 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>{selectedInvoice.vendor}</span>
                  <span className="text-xs text-neutral-400 font-normal">({selectedInvoice.invoiceNumber})</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Billed: {selectedInvoice.issueDate} · Due: {selectedInvoice.dueDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-md bg-[#121727] border border-cyan-500/20 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Flags Alert if any */}
            {selectedInvoice.flags.length > 0 && (
              <div className="p-3.5 rounded-lg bg-rose-500/15 border border-rose-500/40 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5 text-rose-400" />
                  <span>Detected Anomaly Alerts</span>
                </div>
                {selectedInvoice.flags.map((f) => (
                  <div key={f.id} className="text-xs text-rose-200">
                    • {f.message}
                  </div>
                ))}
              </div>
            )}

            {/* Line Items Table */}
            <div>
              <div className="text-xs uppercase font-semibold tracking-wider text-neutral-400 mb-2">
                Itemized Line Items
              </div>
              <div className="bg-[#121727] border border-cyan-500/20 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161d31] text-neutral-400 uppercase text-[10px] border-b border-cyan-500/15">
                    <tr>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b233a]">
                    {selectedInvoice.lineItems.map((item) => (
                      <tr key={item.id} className="text-neutral-200">
                        <td className="py-2 px-3 font-medium">{item.description}</td>
                        <td className="py-2 px-3 text-center text-neutral-400 tabular-nums">{item.quantity}</td>
                        <td className="py-2 px-3 text-right text-neutral-300 tabular-nums">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-semibold text-white tabular-nums">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#121727] border border-cyan-500/20 rounded-lg p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span className="font-semibold text-white tabular-nums">${selectedInvoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Tax ({((selectedInvoice.taxRate || 0) * 100).toFixed(1)}%)</span>
                <span className="font-semibold text-white tabular-nums">${(selectedInvoice.taxAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-white pt-1.5 border-t border-cyan-500/20">
                <span>Total Due</span>
                <span className="font-bold text-[#21d2ed] tabular-nums">${selectedInvoice.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => handleFlag(selectedInvoice.id)}
                className="px-3 py-1.5 rounded-lg bg-[#161d31] hover:bg-[#1e2742] text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors cursor-pointer"
              >
                Flag with Note
              </button>
              <button
                onClick={() => handleReject(selectedInvoice.id)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-semibold transition-colors cursor-pointer"
              >
                Reject Invoice
              </button>
              <button
                onClick={() => handleApprove(selectedInvoice.id)}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#21d2ed] to-[#1cb5cc] hover:opacity-95 text-neutral-950 text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(33,210,237,0.3)]"
              >
                Approve Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  if (isConfigured) {
    return (
      <>
        <SignedIn>{dashboardContent}</SignedIn>
        <SignedOut>
          <SignedOutRedirect />
        </SignedOut>
      </>
    )
  }

  return dashboardContent
}

// User Profile Bar with clear, reliable Sign Out button
function DashboardUserBar({
  currentUser,
  onSignOut,
}: {
  currentUser: UserSession | null
  onSignOut: () => void
}) {
  const { isConfigured } = useClerkConfig()

  if (isConfigured) {
    return <ClerkUserWidget />
  }

  const name = currentUser?.name || 'Finance Controller'
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex items-center gap-2">
      {/* User Info Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121829] border border-cyan-500/25 text-[13px]">
        <div className="size-6 rounded-md bg-[#21d2ed]/20 text-[#21d2ed] flex items-center justify-center text-[10.5px] font-bold border border-[#21d2ed]/40">
          {initials || 'FC'}
        </div>
        <span className="text-white font-medium hidden sm:inline">{name}</span>
      </div>

      {/* Explicit, high-visibility Sign Out Button that works on click */}
      <button
        onClick={onSignOut}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-[12.5px] font-semibold transition-all cursor-pointer shadow-sm"
        title="Sign Out of Veyra AI"
      >
        <LogOut className="size-3.5" />
        <span className="hidden sm:inline">Sign Out</span>
      </button>
    </div>
  )
}

function ClerkUserWidget() {
  const { user } = useUser()
  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
    'Auditor'

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121829] border border-cyan-500/25 text-[13px]">
        <UserButton />
        <span className="text-white font-medium hidden sm:inline">{displayName}</span>
      </div>
    </div>
  )
}

function SignedOutRedirect() {
  const { navigate } = useRouter()
  useEffect(() => {
    navigate('/sign-up')
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center text-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#21d2ed]"></div>
    </div>
  )
}

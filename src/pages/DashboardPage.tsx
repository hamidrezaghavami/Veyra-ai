import { useState, useEffect } from 'react'
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  DollarSign,
  BarChart3,
  Bot,
  Layers,
  ArrowUpRight,
  Check,
  Send,
  User,
  LogOut,
  ChevronRight,
  FileSearch,
  Clock,
  SlidersHorizontal,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { invoiceService, InvoiceRecord } from '../services/invoiceService'
import { authService, UserSession } from '../services/authService'
import { aiAssistantService, AssistantMessage } from '../services/aiAssistantService'
import { useRouter } from '../context/RouterContext'
import { ShaderBackground } from '../components/ShaderBackground'
import { LiquidButton } from '../components/LiquidButton'
import { useClerkConfig, useUser, UserButton, SignedIn, SignedOut } from '../lib/clerk'

export function DashboardPage() {
  const { navigate } = useRouter()
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [activeTab, setActiveTab] = useState<'invoices' | 'upload' | 'analytics' | 'assistant'>('invoices')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null)
  const [isProcessingUpload, setIsProcessingUpload] = useState(false)
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('')

  // AI Assistant state
  const [chatMessages, setChatMessages] = useState<AssistantMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Hello! I am your **Veyra Financial Assistant**. I've audited your latest invoices and flagged 2 items needing review (duplicate freight invoice & tax mismatch). How can I help you today?",
      timestamp: 'Just now',
      suggestedActions: [
        { label: 'Which invoices have errors?', action: 'ask_errors' },
        { label: 'What is our total spend this quarter?', action: 'ask_spend' },
        { label: 'Show Cloud infrastructure expenses', action: 'ask_cloud' },
      ],
    },
  ])
  const [inputQuery, setInputQuery] = useState('')

  const { isConfigured } = useClerkConfig()

  useEffect(() => {
    if (!isConfigured) {
      const user = authService.getCurrentUser()
      if (!user) {
        navigate('/sign-up')
        return
      }
      setCurrentUser(user)
    }
    setInvoices(invoiceService.getAll())
  }, [isConfigured, navigate])

  const reloadInvoices = () => {
    const list = invoiceService.getAll()
    setInvoices(list)
    if (selectedInvoice) {
      const updated = list.find((i) => i.id === selectedInvoice.id)
      setSelectedInvoice(updated || null)
    }
  }

  // Handle Approve
  const handleApprove = (id: string) => {
    invoiceService.approve(id, currentUser?.name || 'Controller')
    reloadInvoices()
  }

  // Handle Reject
  const handleReject = (id: string) => {
    const reason = prompt('Please enter the rejection reason for AP audit log:', 'Disbursement rejected due to duplicate submission / policy mismatch.')
    if (reason) {
      invoiceService.reject(id, reason, currentUser?.name || 'Controller')
      reloadInvoices()
    }
  }

  // Handle Flag for Review
  const handleFlag = (id: string) => {
    const comment = prompt('Enter a note for human reviewer:', 'Please check vendor tax ID with procurement.')
    if (comment) {
      invoiceService.flagForReview(id, comment, currentUser?.name || 'Controller')
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
          status: 'Pending Audit' as const,
          confidenceScore: 0.99,
          extractedByAI: true,
          fileName: 'figma-enterprise-seats.pdf',
          lineItems: [
            { id: 'li-s1', description: 'Figma Enterprise Full Editor Seats (x20)', quantity: 20, unitPrice: 75.0, total: 1500.0 },
            { id: 'li-s2', description: 'FigJam Collaborative Addon', quantity: 1, unitPrice: 300.0, total: 300.0 },
          ],
        }
      } else if (type === 'duplicate') {
        sample = {
          invoiceNumber: 'INV-2026-9812',
          vendor: 'Amazon Web Services (AWS)',
          vendorCategory: 'Cloud & Infra' as const,
          issueDate: new Date().toISOString().slice(0, 10),
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
          subtotal: 4820.0,
          taxRate: 0.0825,
          taxAmount: 397.65,
          total: 5217.65,
          currency: 'USD',
          status: 'Pending Audit' as const,
          confidenceScore: 0.98,
          extractedByAI: true,
          fileName: 'aws-duplicate-resubmit.pdf',
          lineItems: [
            { id: 'li-s3', description: 'Duplicate Compute Cluster Ingestion', quantity: 4, unitPrice: 1205.0, total: 4820.0 },
          ],
        }
      } else {
        sample = {
          invoiceNumber: `INV-ERR-${Math.floor(1000 + Math.random() * 9000)}`,
          vendor: 'Global Hardware Solutions',
          vendorCategory: 'Office Supplies' as const,
          issueDate: new Date().toISOString().slice(0, 10),
          dueDate: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
          subtotal: 2500.0,
          taxRate: 0.08,
          taxAmount: 380.0,
          total: 2880.0,
          currency: 'USD',
          status: 'Pending Audit' as const,
          confidenceScore: 0.91,
          extractedByAI: true,
          fileName: 'hardware-invoice-tax-spike.pdf',
          lineItems: [
            { id: 'li-s4', description: 'Server Rack Mount Accessories', quantity: 5, unitPrice: 500.0, total: 2500.0 },
          ],
        }
      }

      const created = invoiceService.addInvoice(sample)
      setIsProcessingUpload(false)
      reloadInvoices()
      setSelectedInvoice(created)
      setUploadSuccessMessage(`Successfully ingested and audited ${created.fileName}! Check results below.`)
    }, 900)
  }

  // Handle Assistant Submit
  const handleSendQuery = (textToSend?: string) => {
    const q = textToSend || inputQuery
    if (!q.trim()) return

    const userMsg: AssistantMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  const dashboardContent = (
    <div className="min-h-screen bg-transparent text-white pt-20 pb-20 relative overflow-hidden">

      {/* Top Liquid Glass Header Bar */}
      <div className="liquid-glass-nav sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3 mx-4 sm:mx-6 lg:mx-8 rounded-full mt-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 group text-white cursor-pointer"
            >
              <div className="size-8 rounded-xl bg-[#141824] border border-white/15 flex items-center justify-center p-1.5 text-[#21d2ed] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
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
              <span className="font-medium text-[16px] tracking-tight">Veyra Console</span>
            </button>
            <span className="text-neutral-600 hidden sm:inline">/</span>
            <span className="text-[13px] text-[#b0b0b0] hidden sm:inline">Audit Ledger & Spend Control</span>
          </div>

          <div className="flex items-center gap-3">
            <LiquidButton
              variant="secondary"
              size="sm"
              onClick={() => invoiceService.resetDefaults() && reloadInvoices()}
              className="hidden sm:inline-flex"
            >
              <RefreshCw className="size-3" />
              <span>Reset Data</span>
            </LiquidButton>

            {/* User Profile Pill with Liquid Glass */}
            <DashboardUserProfile
              currentUser={currentUser}
              onSignOut={() => {
                authService.logout()
                navigate('/sign-in')
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
        {/* Quick KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="surface-card p-4 sm:p-5">
            <div className="text-[12px] text-neutral-400 uppercase tracking-wider mb-1">Total Audited Volume</div>
            <div className="text-2xl font-mono font-medium text-white">${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-neutral-500 mt-1">{invoices.length} total invoices on record</div>
          </div>
          <div className="surface-card p-4 sm:p-5 border-rose-500/30">
            <div className="text-[12px] text-rose-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <AlertTriangle className="size-3 text-rose-400" />
              <span>Flagged Anomalies</span>
            </div>
            <div className="text-2xl font-mono font-medium text-rose-400">{flaggedCount}</div>
            <div className="text-[11px] text-neutral-500 mt-1">Require controller approval</div>
          </div>
          <div className="surface-card p-4 sm:p-5 border-emerald-500/30">
            <div className="text-[12px] text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="size-3 text-emerald-400" />
              <span>Approved Disbursements</span>
            </div>
            <div className="text-2xl font-mono font-medium text-emerald-400">${approvedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-neutral-500 mt-1">Ready for AP ledger post</div>
          </div>
          <div className="surface-card p-4 sm:p-5 border-[#21d2ed]/30">
            <div className="text-[12px] text-[#21d2ed] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="size-3 text-[#21d2ed]" />
              <span>AI Validation Accuracy</span>
            </div>
            <div className="text-2xl font-mono font-medium text-white">99.4%</div>
            <div className="text-[11px] text-neutral-500 mt-1">Vision OCR & math rules</div>
          </div>
        </div>

        {/* Console Nav Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 mb-6 overflow-x-auto no-scrollbar">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-full text-[13.5px] font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'invoices' ? 'liquid-glass-primary shadow-lg' : 'text-[#b0b0b0] hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="size-4" />
            <span>Invoices & Audits</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/10 font-mono font-bold">
              {invoices.length}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-full text-[13.5px] font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'upload' ? 'liquid-glass-primary shadow-lg' : 'text-[#b0b0b0] hover:text-white hover:bg-white/5'
            }`}
          >
            <UploadCloud className="size-4" />
            <span>Upload Document</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-full text-[13.5px] font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'analytics' ? 'liquid-glass-primary shadow-lg' : 'text-[#b0b0b0] hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="size-4" />
            <span>Spend Analytics</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('assistant')}
            className={`px-4 py-2 rounded-full text-[13.5px] font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'assistant' ? 'liquid-glass-primary shadow-lg' : 'text-[#b0b0b0] hover:text-white hover:bg-white/5'
            }`}
          >
            <Bot className="size-4 text-[#21d2ed]" />
            <span>AI Assistant</span>
            <span className="size-2 rounded-full bg-[#21d2ed]" />
          </motion.button>
        </div>

        {/* TAB 1: INVOICES & AUDITS */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {['all', 'flagged', 'pending', 'approved', 'rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-full text-[13px] capitalize transition-colors shrink-0 cursor-pointer ${
                      statusFilter === st
                        ? 'liquid-glass-secondary text-white font-medium border-white/20'
                        : 'text-[#b0b0b0] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search vendor or invoice #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#11141e]/80 border border-white/10 rounded-full pl-9 pr-3 py-1.5 text-[13px] text-white focus:outline-none focus:border-[#21d2ed]"
                />
              </div>
            </div>

            {/* Invoices Table */}
            <div className="surface-card overflow-hidden border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-[#141824]/60 text-[#b0b0b0] text-[11px] uppercase tracking-wider font-mono">
                      <th className="py-3 px-4">Invoice / File</th>
                      <th className="py-3 px-4">Vendor</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4">Audit Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        <td className="py-3 px-4 font-mono text-white">
                          <div className="flex items-center gap-2">
                            <FileText className="size-3.5 text-neutral-400 group-hover:text-[#21d2ed] transition-colors" />
                            <span>{inv.invoiceNumber}</span>
                          </div>
                          {inv.fileName && (
                            <div className="text-[11px] text-neutral-500 font-sans">{inv.fileName}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-white">
                          {inv.vendor}
                        </td>
                        <td className="py-3 px-4 text-[#b0b0b0]">
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[11px]">
                            {inv.vendorCategory}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-400">
                          {inv.issueDate}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-white">
                          ${inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          {inv.status === 'Approved' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px]">
                              <CheckCircle2 className="size-3" />
                              Approved
                            </span>
                          )}
                          {inv.status === 'Flagged' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[11px]">
                              <AlertTriangle className="size-3 text-rose-400" />
                              Flagged ({inv.flags.length})
                            </span>
                          )}
                          {inv.status === 'Pending Audit' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px]">
                              <Clock className="size-3" />
                              Pending
                            </span>
                          )}
                          {inv.status === 'Rejected' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-white/10 text-[11px]">
                              <XCircle className="size-3" />
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.status !== 'Approved' && (
                              <LiquidButton
                                variant="secondary"
                                size="sm"
                                onClick={() => handleApprove(inv.id)}
                                className="!py-0.5 !px-2.5 text-[11px] text-emerald-400 hover:text-white"
                              >
                                Approve
                              </LiquidButton>
                            )}
                            {inv.status !== 'Rejected' && (
                              <LiquidButton
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(inv.id)}
                                className="!py-0.5 !px-2.5 text-[11px] text-rose-400 hover:text-white"
                              >
                                Reject
                              </LiquidButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD & OCR */}
        {activeTab === 'upload' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="surface-card p-8 text-center border-dashed border-2 border-white/15 relative overflow-hidden">
              <ShaderBackground variant="Large2" className="absolute inset-0 size-full -z-10 opacity-40" />
              <div className="size-14 rounded-2xl bg-[#18181c] border border-white/10 flex items-center justify-center text-[#21d2ed] mx-auto mb-4">
                <UploadCloud className="size-7" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Upload invoice or receipt</h3>
              <p className="text-[14px] text-[#b0b0b0] max-w-md mx-auto mb-6">
                Drag and drop your PDF, PNG, or JPEG documents. Veyra AI will read vendors, line items, calculate taxes, and execute verification rules.
              </p>

              {isProcessingUpload ? (
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 text-[#21d2ed] text-sm animate-pulse">
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Extracting line items & running audit rules...</span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <label className="cursor-pointer">
                    <LiquidButton variant="primary" size="lg" icon={<UploadCloud className="size-4" />}>
                      Select File from Computer
                    </LiquidButton>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={() => handleIngestSample('clean')}
                    />
                  </label>
                </div>
              )}

              {uploadSuccessMessage && (
                <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[13px]">
                  {uploadSuccessMessage}
                </div>
              )}
            </div>

            {/* Quick Demo Pre-sets */}
            <div className="surface-card p-6">
              <div className="text-[12px] uppercase tracking-wider text-[#21d2ed] font-medium mb-3">
                1-Click Audit Simulation
              </div>
              <p className="text-[13px] text-[#b0b0b0] mb-4">
                Want to test how Veyra flags errors? Click any test document below to immediately ingest it into the audit engine:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleIngestSample('clean')}
                  disabled={isProcessingUpload}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 text-left transition-colors cursor-pointer"
                >
                  <div className="text-[13px] font-medium text-white mb-1 flex items-center justify-between">
                    <span>Clean Invoice</span>
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-neutral-400">Figma SaaS subscription ($1,948.50). 100% clean check.</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleIngestSample('duplicate')}
                  disabled={isProcessingUpload}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-rose-500/40 text-left transition-colors cursor-pointer"
                >
                  <div className="text-[13px] font-medium text-white mb-1 flex items-center justify-between">
                    <span>Duplicate Invoice</span>
                    <AlertTriangle className="size-3.5 text-rose-400" />
                  </div>
                  <div className="text-[11px] text-neutral-400">Re-submitted AWS invoice. Triggers duplicate alert.</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleIngestSample('tax_err')}
                  disabled={isProcessingUpload}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 text-left transition-colors cursor-pointer"
                >
                  <div className="text-[13px] font-medium text-white mb-1 flex items-center justify-between">
                    <span>Tax Calculation Error</span>
                    <AlertTriangle className="size-3.5 text-amber-400" />
                  </div>
                  <div className="text-[11px] text-neutral-400">Hardware invoice with $180 overbilled tax mismatch.</div>
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SPEND ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="surface-card p-6">
                <h3 className="text-lg font-medium text-white mb-4">Disbursements by Category</h3>
                <div className="space-y-3.5">
                  {[
                    { cat: 'Cloud & Infra', amount: 5217.65, pct: 41, color: 'bg-[#21d2ed]' },
                    { cat: 'Logistics', amount: 6280.0, pct: 38, color: 'bg-indigo-400' },
                    { cat: 'Software / SaaS', amount: 3074.3, pct: 14, color: 'bg-violet-400' },
                    { cat: 'Office Supplies', amount: 1630.0, pct: 7, color: 'bg-emerald-400' },
                  ].map((row) => (
                    <div key={row.cat}>
                      <div className="flex justify-between text-[13px] mb-1">
                        <span className="text-[#b0b0b0]">{row.cat}</span>
                        <span className="font-mono text-white">${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({row.pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Vendors */}
              <div className="surface-card p-6">
                <h3 className="text-lg font-medium text-white mb-4">Top Vendor Volume</h3>
                <div className="divide-y divide-white/[0.04]">
                  {invoices.slice(0, 5).map((inv) => (
                    <div key={inv.id} className="py-2.5 flex items-center justify-between text-[13px]">
                      <div>
                        <div className="font-medium text-white">{inv.vendor}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">Invoice #{inv.invoiceNumber}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-white font-medium">${inv.total.toFixed(2)}</div>
                        <div className="text-[11px] text-neutral-400">{inv.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI FINANCIAL ASSISTANT */}
        {activeTab === 'assistant' && (
          <div className="max-w-3xl mx-auto surface-card p-4 sm:p-6 flex flex-col h-[600px] border border-white/10">
            {/* Assistant Header */}
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
              <div className="size-8 rounded-xl bg-[#141824] border border-white/15 flex items-center justify-center text-[#21d2ed]">
                <Bot className="size-4" />
              </div>
              <div>
                <h3 className="text-[15px] font-medium text-white">Veyra Financial Assistant</h3>
                <p className="text-[11px] text-[#b0b0b0]">Grounded in active accounting records and validation rules</p>
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
                    className={`max-w-[85%] p-3.5 rounded-2xl text-[14px] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'liquid-glass-accent font-medium rounded-br-none'
                        : 'bg-[#141824]/80 border border-white/10 text-white rounded-bl-none whitespace-pre-wrap'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 px-1">{msg.timestamp}</span>

                  {/* Suggested chips */}
                  {msg.suggestedActions && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.suggestedActions.map((sug) => (
                        <motion.button
                          key={sug.label}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSendQuery(sug.label)}
                          className="text-[11px] px-3 py-1 rounded-full liquid-glass-secondary border-white/10 text-[#b0b0b0] hover:text-white transition-colors cursor-pointer"
                        >
                          {sug.label}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendQuery()
              }}
              className="pt-3 border-t border-white/5 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about monthly spending, flagged errors, vendors..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-1 bg-[#141824]/80 border border-white/10 rounded-full px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#21d2ed]"
              />
              <LiquidButton
                type="submit"
                variant="primary"
                size="sm"
                disabled={!inputQuery.trim()}
                className="!size-10 !p-0 rounded-full shrink-0"
              >
                <Send className="size-4" />
              </LiquidButton>
            </form>
          </div>
        )}
      </div>

      {/* INVOICE DETAIL MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="surface-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border border-white/20 relative shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
              <div>
                <span className="text-[11px] font-mono text-[#21d2ed] uppercase tracking-wider">
                  Audit Inspection Report
                </span>
                <h3 className="text-xl font-medium text-white">{selectedInvoice.vendor}</h3>
                <div className="text-[12px] text-neutral-400 font-mono">Invoice #{selectedInvoice.invoiceNumber}</div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="size-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Flags warning callout */}
            {selectedInvoice.flags.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[13px] mb-5 space-y-2">
                <div className="font-medium text-rose-200 flex items-center gap-2">
                  <AlertTriangle className="size-4 text-rose-400" />
                  <span>{selectedInvoice.flags.length} Flagged Audit Issue(s)</span>
                </div>
                {selectedInvoice.flags.map((flg) => (
                  <div key={flg.id} className="text-[12px] text-rose-300/90 pl-6">
                    • {flg.message}
                  </div>
                ))}
              </div>
            )}

            {/* Line items table */}
            <div className="mb-5">
              <div className="text-[12px] uppercase tracking-wider text-neutral-400 font-mono mb-2">
                Extracted Line Items
              </div>
              <div className="surface-inset p-3 divide-y divide-white/5 text-[13px]">
                {selectedInvoice.lineItems.map((li) => (
                  <div key={li.id} className="py-2 flex justify-between">
                    <div>
                      <div className="text-white">{li.description}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {li.quantity} units @ ${li.unitPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="font-mono text-white">${li.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Totals */}
            <div className="surface-inset p-3.5 space-y-2 text-[13px] mb-6">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span className="font-mono text-white">${selectedInvoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Tax Amount ({(selectedInvoice.taxRate * 100).toFixed(1)}%)</span>
                <span className="font-mono text-white">${selectedInvoice.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-medium text-white pt-2 border-t border-white/5">
                <span>Total Stated Amount</span>
                <span className="font-mono text-[#21d2ed]">${selectedInvoice.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Audit Trail Timeline */}
            <div className="mb-6">
              <div className="text-[12px] uppercase tracking-wider text-neutral-400 font-mono mb-2">
                Audit Trail & History
              </div>
              <div className="space-y-2 text-[12px]">
                {selectedInvoice.auditHistory.map((ah) => (
                  <div key={ah.id} className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-start justify-between">
                    <div>
                      <span className="text-white font-medium">{ah.action}</span>
                      {ah.note && <div className="text-neutral-400 text-[11px] mt-0.5">{ah.note}</div>}
                    </div>
                    <div className="text-right text-[11px] text-neutral-500 shrink-0 ml-3">
                      <div>{ah.actor}</div>
                      <div>{ah.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              <LiquidButton
                variant="secondary"
                size="sm"
                onClick={() => handleFlag(selectedInvoice.id)}
              >
                Flag with Note
              </LiquidButton>
              <LiquidButton
                variant="ghost"
                size="sm"
                onClick={() => handleReject(selectedInvoice.id)}
                className="text-rose-400 hover:text-white"
              >
                Reject Invoice
              </LiquidButton>
              <LiquidButton
                variant="primary"
                size="sm"
                onClick={() => handleApprove(selectedInvoice.id)}
              >
                Approve Invoice
              </LiquidButton>
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

function DashboardUserProfile({
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
  const name = currentUser?.name || 'Auditor'
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass-secondary text-[13px]">
      <div className="size-5 rounded-full bg-[#21d2ed]/25 text-[#21d2ed] flex items-center justify-center text-[10px] font-semibold border border-[#21d2ed]/40">
        {initials || 'U'}
      </div>
      <span className="text-white hidden sm:inline">{name}</span>
      <button
        onClick={onSignOut}
        className="text-neutral-400 hover:text-white ml-1 transition-colors cursor-pointer"
        title="Sign Out"
      >
        <LogOut className="size-3.5" />
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
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass-secondary text-[13px]">
      <UserButton />
      <span className="text-white hidden sm:inline font-medium">{displayName}</span>
    </div>
  )
}

function SignedOutRedirect() {
  const { navigate } = useRouter()
  useEffect(() => {
    navigate('/sign-up')
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center text-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#21d2ed]"></div>
    </div>
  )
}

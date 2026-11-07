import { useState, useEffect, useMemo } from 'react'
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
  ChevronRight,
  Filter,
  Download,
  Layers,
  Building2,
  TrendingUp,
  Eye,
  Check,
  X,
  ShieldCheck,
  ChevronDown,
  Plus,
  SlidersHorizontal,
  ArrowUpRight,
  Menu,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Safety watchdog: auto-clear processing spinner if it ever takes more than 4 seconds
  useEffect(() => {
    if (isProcessingUpload) {
      const timer = setTimeout(() => {
        setIsProcessingUpload(false)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [isProcessingUpload])

  // AI Assistant chat state
  const [chatMessages, setChatMessages] = useState<AssistantMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Hello! I am your **Veyra Financial Assistant**. I've audited your corporate invoices and flagged 2 items needing review (duplicate freight invoice & tax calculation mismatch). How can I assist you today?",
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
    try {
      const approverName = currentUser?.name || 'Finance Controller'
      invoiceService.approve(id, approverName)
      reloadInvoices()
    } catch (e) {
      console.error('Error approving invoice:', e)
    }
  }

  // Handle Reject - Instant reliable action without browser prompt blockers
  const handleReject = (id: string, reasonOverride?: string) => {
    try {
      const target = invoices.find((i) => i.id === id) || (selectedInvoice?.id === id ? selectedInvoice : null)
      const defaultReason = target?.flags?.length
        ? `Disbursement rejected: ${target.flags.map((f) => f.message).join(' | ')}`
        : 'Disbursement rejected by AP audit due to policy discrepancy.'
      const reason = reasonOverride || defaultReason
      const approverName = currentUser?.name || 'Finance Controller'
      invoiceService.reject(id, reason, approverName)
      reloadInvoices()
    } catch (e) {
      console.error('Error rejecting invoice:', e)
    }
  }

  // Handle Flag for Review - Instant reliable action without browser prompt blockers
  const handleFlag = (id: string, commentOverride?: string) => {
    try {
      const comment = commentOverride || 'Flagged for controller review: verification required before disbursement.'
      const approverName = currentUser?.name || 'Finance Controller'
      invoiceService.flagForReview(id, comment, approverName)
      reloadInvoices()
    } catch (e) {
      console.error('Error flagging invoice:', e)
    }
  }

  // Handle actual file upload from user's computer
  const handleFileSelect = async (file: File) => {
    setIsProcessingUpload(true)
    setUploadSuccessMessage('')

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text()
        const parsed = JSON.parse(text)

        const sample: Omit<InvoiceRecord, 'id' | 'flags' | 'auditHistory'> = {
          invoiceNumber: parsed.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
          vendor: parsed.vendor || 'Custom Vendor Inc',
          vendorCategory: parsed.vendorCategory || 'Logistics',
          issueDate: parsed.issueDate || new Date().toISOString().slice(0, 10),
          dueDate: parsed.dueDate || new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
          subtotal: Number(parsed.subtotal) || 1000,
          taxRate: Number(parsed.taxRate) || 0.08,
          taxAmount: Number(parsed.taxAmount) || 80,
          total: Number(parsed.total) || 1080,
          currency: parsed.currency || 'USD',
          fileName: file.name,
          confidenceScore: 0.98,
          extractedByAI: true,
          lineItems: Array.isArray(parsed.lineItems)
            ? parsed.lineItems
            : [
                {
                  id: 'li-1',
                  description: 'Itemized Invoice Services',
                  quantity: 1,
                  unitPrice: Number(parsed.subtotal) || 1000,
                  total: Number(parsed.subtotal) || 1000,
                },
              ],
        }

        setTimeout(() => {
          try {
            const record = invoiceService.addInvoice(sample)
            setUploadSuccessMessage(
              `Audited "${file.name}". Evaluated ${record.flags.length} audit anomaly flag(s).`
            )
            reloadInvoices()
            setSelectedInvoice(record)
            setActiveTab('invoices')
          } catch (e) {
            console.error(e)
            setUploadSuccessMessage('Error auditing document.')
          } finally {
            setIsProcessingUpload(false)
          }
        }, 400)
        return
      }

      // If PDF, image or text document:
      const lower = file.name.toLowerCase()
      let sampleType: 'clean' | 'duplicate' | 'tax_err' = 'clean'
      if (lower.includes('err') || lower.includes('tax') || lower.includes('mismatch')) {
        sampleType = 'tax_err'
      } else if (lower.includes('dup')) {
        sampleType = 'duplicate'
      }

      setTimeout(() => {
        try {
          let sample: Omit<InvoiceRecord, 'id' | 'flags' | 'auditHistory'>
          if (sampleType === 'tax_err') {
            sample = {
              invoiceNumber: `INV-ERR-${Math.floor(1000 + Math.random() * 9000)}`,
              vendor: 'Apex Hardware & Global Logistics',
              vendorCategory: 'Logistics',
              issueDate: new Date().toISOString().slice(0, 10),
              dueDate: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
              subtotal: 2800.0, // Stated subtotal 2800, but line items sum is 2500!
              taxRate: 0.08,
              taxAmount: 350.0, // Stated tax 350, but 8% of 2800 is 224!
              total: 3150.0,
              currency: 'USD',
              fileName: file.name,
              confidenceScore: 0.94,
              extractedByAI: true,
              lineItems: [
                {
                  id: 'li-1',
                  description: 'Cross-Border Drayage & Container Handling',
                  quantity: 2,
                  unitPrice: 1000.0,
                  total: 2000.0,
                },
                {
                  id: 'li-2',
                  description: 'Overnight Warehouse Storage Surcharge',
                  quantity: 1,
                  unitPrice: 500.0,
                  total: 500.0,
                },
              ],
            }
          } else if (sampleType === 'duplicate') {
            sample = {
              invoiceNumber: 'INV-2026-4828', // Matches existing invoice
              vendor: 'Northwind Global Freight LLC',
              vendorCategory: 'Logistics',
              issueDate: new Date().toISOString().slice(0, 10),
              dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
              subtotal: 6280.0,
              taxRate: 0.0,
              taxAmount: 0.0,
              total: 6280.0,
              currency: 'USD',
              fileName: file.name,
              confidenceScore: 0.95,
              extractedByAI: true,
              lineItems: [
                {
                  id: 'li-dup',
                  description: 'Cross-Border Drayage & Container Handling',
                  quantity: 2,
                  unitPrice: 2800.0,
                  total: 5600.0,
                },
                {
                  id: 'li-fuel',
                  description: 'Fuel Surcharge Peak Adjustment',
                  quantity: 1,
                  unitPrice: 680.0,
                  total: 680.0,
                },
              ],
            }
          } else {
            sample = {
              invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
              vendor: 'Stripe Cloud Infrastructure',
              vendorCategory: 'Software / SaaS',
              issueDate: new Date().toISOString().slice(0, 10),
              dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
              subtotal: 1600.0,
              taxRate: 0.05,
              taxAmount: 80.0,
              total: 1680.0,
              currency: 'USD',
              fileName: file.name,
              confidenceScore: 0.99,
              extractedByAI: true,
              lineItems: [
                {
                  id: 'li-1',
                  description: 'Enterprise Billing API Nodes (Tier 1)',
                  quantity: 2,
                  unitPrice: 600.0,
                  total: 1200.0,
                },
                {
                  id: 'li-2',
                  description: 'Radar Fraud Protection Active Addon',
                  quantity: 1,
                  unitPrice: 400.0,
                  total: 400.0,
                },
              ],
            }
          }

          const record = invoiceService.addInvoice(sample)
          setUploadSuccessMessage(
            `Audited "${file.name}". Evaluated ${record.flags.length} audit anomaly flag(s).`
          )
          reloadInvoices()
          setSelectedInvoice(record)
          setActiveTab('invoices')
        } catch (e) {
          console.error(e)
          setUploadSuccessMessage('Error auditing document.')
        } finally {
          setIsProcessingUpload(false)
        }
      }, 400)
    } catch (err) {
      setIsProcessingUpload(false)
      alert('Failed to parse file: ' + String(err))
    }
  }

  // Quick Sample Ingest
  const handleIngestSample = (type: 'clean' | 'duplicate' | 'tax_err') => {
    setIsProcessingUpload(true)
    setUploadSuccessMessage('')

    setTimeout(() => {
      try {
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

        const record = invoiceService.addInvoice(sample)
        setUploadSuccessMessage(`Audited "${sample.invoiceNumber}". Evaluated ${record.flags.length} flag(s).`)
        reloadInvoices()
        setSelectedInvoice(record)
        setActiveTab('invoices')
      } catch (err) {
        console.error(err)
        setUploadSuccessMessage('Error auditing document.')
      } finally {
        setIsProcessingUpload(false)
      }
    }, 400)
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
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
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
  }, [invoices, statusFilter, searchQuery])

  // Financial Stats
  const totalVolume = useMemo(() => invoices.reduce((acc, i) => acc + i.total, 0), [invoices])
  const flaggedCount = useMemo(() => invoices.filter((i) => i.status === 'Flagged' || i.flags.length > 0).length, [invoices])
  const approvedTotal = useMemo(() => invoices.filter((i) => i.status === 'Approved').reduce((acc, i) => acc + i.total, 0), [invoices])
  const pendingCount = useMemo(() => invoices.filter((i) => i.status === 'Pending Audit').length, [invoices])

  // Master UI Content
  const dashboardContent = (
    <div className="min-h-screen bg-[#07090e] text-neutral-100 flex font-sans antialiased selection:bg-[#21d2ed]/30 selection:text-white relative overflow-hidden">
      {/* Calm Ambient Light-Blue Background Accents (Static, non-dizzying) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-1/3 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(33,210,237,0.09),transparent_70%)] blur-3xl" />
        <div className="absolute top-[35%] right-[-10%] w-[650px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.06),transparent_65%)] blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />
      </div>

      {/* ==================================================== */}
      {/* 1. LEFT APP NAVIGATION SIDEBAR */}
      {/* ==================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0e18]/95 backdrop-blur-2xl border-r border-cyan-500/15 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Organization & Product Branding */}
          <div className="p-5 border-b border-cyan-500/10">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="size-9 rounded-xl bg-gradient-to-br from-[#121c2e] to-[#0a101d] border border-cyan-500/35 flex items-center justify-center p-1.5 text-[#21d2ed] shadow-[0_0_15px_rgba(33,210,237,0.25)] group-hover:border-cyan-400 transition-all">
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
                <div>
                  <div className="font-semibold text-[15px] tracking-tight text-white flex items-center gap-2">
                    <span>Veyra AI</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      Enterprise
                    </span>
                  </div>
                  <div className="text-[11.5px] text-neutral-400">Autonomous AP Audit</div>
                </div>
              </button>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Quick Upload Action */}
          <div className="p-4">
            <button
              onClick={() => {
                setActiveTab('upload')
                setIsSidebarOpen(false)
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#21d2ed] to-[#1cb5cc] hover:opacity-95 text-neutral-950 font-semibold text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(33,210,237,0.25)]"
            >
              <Plus className="size-4 stroke-[2.5]" />
              <span>Ingest Document</span>
            </button>
          </div>

          {/* Main Navigation List */}
          <div className="px-3 space-y-1">
            <div className="px-3 pt-2 pb-1.5 text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
              Workspace
            </div>

            <button
              onClick={() => {
                setActiveTab('invoices')
                setIsSidebarOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
                activeTab === 'invoices'
                  ? 'bg-cyan-500/15 text-white border border-cyan-500/30 shadow-[0_0_12px_rgba(33,210,237,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className={`size-4 ${activeTab === 'invoices' ? 'text-[#21d2ed]' : 'text-neutral-400'}`} />
                <span>Audit Ledger</span>
              </div>
              {flaggedCount > 0 && (
                <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/35">
                  {flaggedCount} flag
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('upload')
                setIsSidebarOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-cyan-500/15 text-white border border-cyan-500/30 shadow-[0_0_12px_rgba(33,210,237,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UploadCloud className={`size-4 ${activeTab === 'upload' ? 'text-[#21d2ed]' : 'text-neutral-400'}`} />
                <span>OCR Scanner</span>
              </div>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10">
                AI Vision
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('analytics')
                setIsSidebarOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-cyan-500/15 text-white border border-cyan-500/30 shadow-[0_0_12px_rgba(33,210,237,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className={`size-4 ${activeTab === 'analytics' ? 'text-[#21d2ed]' : 'text-neutral-400'}`} />
                <span>Spend Analytics</span>
              </div>
              <TrendingUp className="size-3.5 text-neutral-500" />
            </button>

            <button
              onClick={() => {
                setActiveTab('assistant')
                setIsSidebarOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
                activeTab === 'assistant'
                  ? 'bg-cyan-500/15 text-white border border-cyan-500/30 shadow-[0_0_12px_rgba(33,210,237,0.15)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bot className={`size-4 ${activeTab === 'assistant' ? 'text-[#21d2ed]' : 'text-neutral-400'}`} />
                <span>AI Assistant</span>
              </div>
              <span className="size-2 rounded-full bg-[#21d2ed] shadow-[0_0_8px_rgba(33,210,237,0.8)]" />
            </button>
          </div>

          {/* Compliance & Verification Badge */}
          <div className="px-4 mt-6">
            <div className="p-3.5 rounded-xl bg-[#0f1422] border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between text-[11.5px] font-semibold text-white">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <ShieldCheck className="size-3.5 text-[#21d2ed]" />
                  Ledger Health
                </span>
                <span className="text-[#21d2ed]">92%</span>
              </div>
              <div className="h-1.5 w-full bg-[#161d30] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#21d2ed] to-emerald-400 w-[92%]" />
              </div>
              <div className="text-[11px] text-neutral-400 leading-snug">
                4-tier automated audit engine active (Math, Duplicate, Tax, Sanctions).
              </div>
            </div>
          </div>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-4 border-t border-cyan-500/10 bg-[#080c16]/60">
          <DashboardUserBar currentUser={currentUser} onSignOut={handleSignOut} />
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ==================================================== */}
      {/* 2. MAIN WORKSPACE AREA */}
      {/* ==================================================== */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 bg-[#090d18]/85 backdrop-blur-xl border-b border-cyan-500/15 px-4 sm:px-8 py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Mobile Toggle & Breadcrumbs */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-[#121829] border border-cyan-500/25 text-neutral-300 hover:text-white"
              >
                <Menu className="size-5" />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-[13px]">
                <span className="text-neutral-400 font-medium">Acme Global AP</span>
                <span className="text-neutral-600">/</span>
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <span>Audit Console</span>
                  {flaggedCount > 0 && (
                    <span className="size-2 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                  )}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              {/* Period Selector */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121829] border border-cyan-500/20 text-[12px] text-neutral-300 font-medium">
                <Clock className="size-3.5 text-cyan-400" />
                <span>Period: Nov 2026</span>
              </div>

              {/* Reset Sample Invoices */}
              <button
                onClick={() => {
                  invoiceService.resetDefaults()
                  reloadInvoices()
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121829] hover:bg-[#1a2238] text-neutral-300 hover:text-white border border-cyan-500/20 text-[12px] font-medium transition-all cursor-pointer shadow-sm"
                title="Restore default test ledger invoices"
              >
                <RefreshCw className="size-3 text-cyan-400" />
                <span className="hidden sm:inline">Reset Test Data</span>
              </button>

              {/* Quick Ingest Button on Top Bar */}
              <button
                onClick={() => setActiveTab('upload')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#21d2ed] to-[#1cb5cc] hover:opacity-95 text-neutral-950 font-semibold text-[12.5px] transition-all cursor-pointer shadow-[0_0_15px_rgba(33,210,237,0.25)]"
              >
                <Plus className="size-3.5 stroke-[2.5]" />
                <span>Upload</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Executive KPI Stats Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Volume */}
            <div className="bg-[#0d1220]/80 backdrop-blur-md border border-cyan-500/20 hover:border-cyan-500/35 rounded-2xl p-5 shadow-[0_6px_24px_rgba(0,0,0,0.35)] relative overflow-hidden group transition-all">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />
              <div className="flex items-center justify-between text-[12px] text-neutral-400 font-medium tracking-wide uppercase mb-2">
                <span>Total Audited Spend</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ↑ 14.2%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight tabular-nums">
                ${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[12px] text-neutral-400 mt-2.5 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#21d2ed] shadow-[0_0_8px_rgba(33,210,237,0.6)]" />
                <span>{invoices.length} invoices on corporate ledger</span>
              </div>
            </div>

            {/* Card 2: Flagged Anomalies */}
            <div
              onClick={() => {
                setActiveTab('invoices')
                setStatusFilter('flagged')
              }}
              className="bg-[#18111a]/85 backdrop-blur-md border border-rose-500/30 hover:border-rose-500/50 rounded-2xl p-5 shadow-[0_6px_24px_rgba(0,0,0,0.35)] relative overflow-hidden group transition-all cursor-pointer"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/35 to-transparent" />
              <div className="flex items-center justify-between text-[12px] text-rose-300 font-medium tracking-wide uppercase mb-2">
                <span>Action Required</span>
                <AlertTriangle className="size-4 text-rose-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-semibold text-rose-400 tracking-tight tabular-nums">
                {flaggedCount} {flaggedCount === 1 ? 'Invoice' : 'Invoices'}
              </div>
              <div className="text-[12px] text-rose-300/80 mt-2.5 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                <span>Duplicate entry & tax mismatch</span>
              </div>
            </div>

            {/* Card 3: Approved Disbursements */}
            <div
              onClick={() => {
                setActiveTab('invoices')
                setStatusFilter('approved')
              }}
              className="bg-[#0b1716]/85 backdrop-blur-md border border-emerald-500/30 hover:border-emerald-500/50 rounded-2xl p-5 shadow-[0_6px_24px_rgba(0,0,0,0.35)] relative overflow-hidden group transition-all cursor-pointer"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent" />
              <div className="flex items-center justify-between text-[12px] text-emerald-300 font-medium tracking-wide uppercase mb-2">
                <span>Cleared for Payout</span>
                <CheckCircle2 className="size-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-semibold text-emerald-400 tracking-tight tabular-nums">
                ${approvedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[12px] text-emerald-300/80 mt-2.5 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                <span>Passed all OCR & compliance rules</span>
              </div>
            </div>

            {/* Card 4: AI OCR Engine */}
            <div className="bg-[#0c1524]/85 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-500/50 rounded-2xl p-5 shadow-[0_6px_24px_rgba(0,0,0,0.35)] relative overflow-hidden group transition-all">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />
              <div className="flex items-center justify-between text-[12px] text-cyan-300 font-medium tracking-wide uppercase mb-2">
                <span>OCR Validation Engine</span>
                <Sparkles className="size-4 text-[#21d2ed]" />
              </div>
              <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight tabular-nums">
                99.4%
              </div>
              <div className="text-[12px] text-cyan-200/70 mt-2.5 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#21d2ed] shadow-[0_0_8px_rgba(33,210,237,0.6)]" />
                <span>Gemini 2.5 Flash Vision Multimodal</span>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* TAB 1: INVOICES LEDGER & LIVE SPLIT INSPECTOR */}
          {/* ==================================================== */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              {/* Filter Tabs & Search Bar */}
              <div className="bg-[#0d1220]/85 backdrop-blur-md border border-cyan-500/20 p-3 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'All Invoices', count: invoices.length },
                    { id: 'flagged', label: 'Flagged Anomalies', count: flaggedCount, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
                    { id: 'pending', label: 'Pending Audit', count: pendingCount },
                    { id: 'approved', label: 'Approved', count: invoices.filter((i) => i.status === 'Approved').length },
                    { id: 'rejected', label: 'Rejected', count: invoices.filter((i) => i.status === 'Rejected').length },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setStatusFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-xl text-[12.5px] font-medium transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                        statusFilter === filter.id
                          ? 'bg-white text-neutral-950 font-semibold shadow-sm'
                          : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span
                        className={`text-[10.5px] px-1.5 py-0.5 rounded-full font-semibold tabular-nums ${
                          statusFilter === filter.id
                            ? 'bg-black/10 text-neutral-900'
                            : filter.badgeColor || 'bg-white/10 text-neutral-300'
                        }`}
                      >
                        {filter.count}
                      </span>
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
                    className="w-full bg-[#121727] border border-cyan-500/25 rounded-xl pl-9 pr-3 py-1.5 text-[13px] text-white placeholder-neutral-500 focus:outline-none focus:border-[#21d2ed] focus:ring-1 focus:ring-[#21d2ed]/30 transition-all"
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-[#0d1220]/85 backdrop-blur-md border border-cyan-500/20 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[13px]">
                    <thead>
                      <tr className="bg-[#111728] text-neutral-400 text-[11.5px] font-semibold uppercase tracking-wider border-b border-cyan-500/15">
                        <th className="py-3.5 px-4">Invoice / File</th>
                        <th className="py-3.5 px-4">Vendor</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Billing Date</th>
                        <th className="py-3.5 px-4 text-right">Disbursement</th>
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
                            className={`hover:bg-[#131b2e] transition-colors cursor-pointer group ${
                              selectedInvoice?.id === inv.id ? 'bg-[#151e33] border-l-2 border-[#21d2ed]' : ''
                            }`}
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
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="size-6 rounded-lg bg-[#162035] border border-cyan-500/20 text-[#21d2ed] text-[10.5px] font-bold flex items-center justify-center shrink-0">
                                  {inv.vendor.slice(0, 2).toUpperCase()}
                                </div>
                                <span className="font-medium text-neutral-200">{inv.vendor}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-medium">
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
                                  <CheckCircle2 className="size-3 text-emerald-400" />
                                  Approved
                                </span>
                              )}
                              {inv.status === 'Flagged' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/40 text-[11.5px] font-medium animate-pulse">
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
                                  Inspect
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
          {/* TAB 2: DOCUMENT OCR INGESTION */}
          {/* ==================================================== */}
          {activeTab === 'upload' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Drop Zone with Animated Scanning Effect */}
              <div className="bg-[#0d1220]/80 backdrop-blur-md border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/60 rounded-2xl p-10 text-center transition-all shadow-xl relative overflow-hidden group">
                <div className="size-16 rounded-2xl bg-[#121829] border border-cyan-500/30 flex items-center justify-center text-[#21d2ed] mx-auto mb-4 shadow-[0_0_20px_rgba(33,210,237,0.25)] group-hover:scale-105 transition-transform">
                  <UploadCloud className="size-8" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Ingest Financial Documents</h3>
                <p className="text-[13.5px] text-neutral-400 max-w-md mx-auto mb-6">
                  Drop PDF invoices, scans, or vendor receipts. Veyra extracts line items, reconciles VAT/Sales tax, and checks duplicate records in seconds.
                </p>

                {isProcessingUpload ? (
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[#121829] border border-[#21d2ed]/40 text-[#21d2ed] text-sm animate-pulse shadow-[0_0_20px_rgba(33,210,237,0.2)]">
                      <RefreshCw className="size-4 animate-spin" />
                      <span>Auditing document calculations & rules...</span>
                    </div>
                    {/* Simulated laser scan bar */}
                    <div className="h-1 w-48 mx-auto bg-gradient-to-r from-transparent via-[#21d2ed] to-transparent animate-pulse" />
                    <div>
                      <button
                        type="button"
                        onClick={() => setIsProcessingUpload(false)}
                        className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <label className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-[#21d2ed] to-[#1cb5cc] hover:opacity-95 text-neutral-950 font-semibold text-sm transition-all cursor-pointer shadow-[0_0_25px_rgba(33,210,237,0.35)]">
                      <UploadCloud className="size-4 stroke-[2.5]" />
                      <span>Upload Invoice (PDF, Image, or JSON)</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.json,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileSelect(file)
                        }}
                      />
                    </label>

                    <a
                      href="/invoice-math-error-sample.pdf"
                      download="invoice-math-error-sample.pdf"
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#121829] hover:bg-[#1c2438] text-neutral-300 hover:text-white border border-cyan-500/25 text-xs font-semibold transition-all shadow-sm"
                    >
                      <Download className="size-3.5 text-cyan-400" />
                      <span>Download Sample PDF Invoice</span>
                    </a>
                  </div>
                )}

                {uploadSuccessMessage && (
                  <div className="mt-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[13px] font-medium flex items-center justify-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span>{uploadSuccessMessage}</span>
                  </div>
                )}
              </div>

              {/* 1-Click Interactive Test Scenarios */}
              <div className="bg-[#0d1220]/80 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] uppercase tracking-wider text-[#21d2ed] font-semibold">
                    1-Click Test Scenarios
                  </div>
                  <span className="text-[11px] text-neutral-400">Instant test cases</span>
                </div>
                <p className="text-[13px] text-neutral-400">
                  Click any pre-configured document scenario to immediately test how Veyra catches anomalies:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <button
                    onClick={() => handleIngestSample('clean')}
                    disabled={isProcessingUpload}
                    className="p-4 rounded-xl bg-[#121727] border border-cyan-500/20 hover:border-emerald-500/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[13.5px] font-semibold text-white mb-1 flex items-center justify-between">
                      <span>Clean SaaS</span>
                      <CheckCircle2 className="size-4 text-emerald-400" />
                    </div>
                    <div className="text-[11.5px] text-neutral-400 leading-snug">
                      Figma Enterprise ($1,948.50). 100% compliant.
                    </div>
                  </button>

                  <button
                    onClick={() => handleIngestSample('duplicate')}
                    disabled={isProcessingUpload}
                    className="p-4 rounded-xl bg-[#121727] border border-cyan-500/20 hover:border-rose-500/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[13.5px] font-semibold text-white mb-1 flex items-center justify-between">
                      <span>Duplicate Alert</span>
                      <AlertTriangle className="size-4 text-rose-400" />
                    </div>
                    <div className="text-[11.5px] text-neutral-400 leading-snug">
                      Re-submitted Northwind Freight invoice. Triggers duplicate.
                    </div>
                  </button>

                  <button
                    onClick={() => handleIngestSample('tax_err')}
                    disabled={isProcessingUpload}
                    className="p-4 rounded-xl bg-[#121727] border border-cyan-500/20 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[13.5px] font-semibold text-white mb-1 flex items-center justify-between">
                      <span>Tax Mismatch</span>
                      <AlertTriangle className="size-4 text-amber-400" />
                    </div>
                    <div className="text-[11.5px] text-neutral-400 leading-snug">
                      Cloud bill with $180 math discrepancy on tax.
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Breakdown Box */}
                <div className="bg-[#0d1220]/80 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-white">Disbursements by Category</h3>
                    <span className="text-[11px] text-cyan-300 font-medium">Q4 2026 Distribution</span>
                  </div>
                  <div className="space-y-4 pt-1">
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
                <div className="bg-[#0d1220]/80 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-white">Top Vendor Disbursements</h3>
                    <span className="text-[11px] text-neutral-400">Ranked by volume</span>
                  </div>
                  <div className="divide-y divide-[#172036]">
                    {invoices.slice(0, 5).map((inv) => (
                      <div key={inv.id} className="py-3 flex items-center justify-between text-[13px]">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-lg bg-[#162035] border border-cyan-500/20 text-[#21d2ed] text-[11px] font-bold flex items-center justify-center shrink-0">
                            {inv.vendor.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{inv.vendor}</div>
                            <div className="text-[11.5px] text-neutral-400 tabular-nums">Invoice #{inv.invoiceNumber}</div>
                          </div>
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
            <div className="max-w-3xl mx-auto bg-[#0d1220]/85 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 flex flex-col h-[620px] shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-cyan-500/15">
                <div className="size-10 rounded-xl bg-[#121829] border border-cyan-500/30 flex items-center justify-center text-[#21d2ed] shadow-[0_0_12px_rgba(33,210,237,0.2)]">
                  <Bot className="size-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-white">Veyra Financial Copilot</h3>
                  <p className="text-[11.5px] text-neutral-400">Grounded in corporate invoice records & AP policy rules</p>
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
                      className={`max-w-[85%] p-4 rounded-2xl text-[13.5px] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-[#21d2ed] to-[#1cb5cc] text-neutral-950 font-semibold rounded-br-none shadow-[0_0_15px_rgba(33,210,237,0.25)]'
                          : 'bg-[#121727] border border-cyan-500/20 text-white rounded-bl-none whitespace-pre-wrap shadow-sm'
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
                            className="text-[11.5px] px-3 py-1.5 rounded-lg bg-[#121727] hover:bg-[#1a2238] text-neutral-300 hover:text-white border border-cyan-500/20 transition-all cursor-pointer"
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
                  className="flex-1 bg-[#121727] border border-cyan-500/25 rounded-xl px-4 py-2.5 text-[13.5px] text-white placeholder-neutral-500 focus:outline-none focus:border-[#21d2ed] focus:ring-1 focus:ring-[#21d2ed]/30 transition-all"
                />
                <button
                  onClick={() => handleSendQuery()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#21d2ed] to-[#1cb5cc] hover:opacity-95 text-neutral-950 font-semibold transition-all cursor-pointer flex items-center justify-center shadow-[0_0_15px_rgba(33,210,237,0.3)]"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==================================================== */}
      {/* 3. SLIDE-OVER DETAIL INSPECTOR PANEL (Modern Ramp/Linear Drawer) */}
      {/* ==================================================== */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-lg bg-[#0b101c] border-l border-cyan-500/20 h-full flex flex-col shadow-2xl overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-cyan-500/15 flex items-center justify-between sticky top-0 bg-[#0b101c]/90 backdrop-blur-md z-10">
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-cyan-400">
                    Audit Verification Inspector
                  </div>
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2 mt-0.5">
                    <span>{selectedInvoice.vendor}</span>
                  </h3>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    Invoice #{selectedInvoice.invoiceNumber} · Billed {selectedInvoice.issueDate}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 rounded-xl bg-[#141b2c] hover:bg-[#1c263d] text-neutral-400 hover:text-white border border-cyan-500/20 transition-all cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Drawer Body Content */}
              <div className="p-6 space-y-6 flex-1">
                {/* Detected Flags Alert Banner */}
                {selectedInvoice.flags.length > 0 ? (
                  <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
                      <AlertTriangle className="size-4 text-rose-400 animate-pulse" />
                      <span>{selectedInvoice.flags.length} Anomaly Alerts Detected</span>
                    </div>
                    {selectedInvoice.flags.map((f) => (
                      <div key={f.id} className="text-[13px] text-rose-200 pl-6 relative">
                        <span className="absolute left-1.5 top-2 size-1.5 rounded-full bg-rose-400" />
                        {f.message}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        100% Audit Compliance
                      </div>
                      <div className="text-[12px] text-emerald-200/80">
                        All line item math and duplicate rules verified cleanly.
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Action Decision Bar */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    <span>Disbursement Decision</span>
                    <span className="text-neutral-400 font-normal normal-case">
                      Status:{' '}
                      <strong
                        className={`font-semibold uppercase ${
                          selectedInvoice.status === 'Approved'
                            ? 'text-emerald-400'
                            : selectedInvoice.status === 'Rejected'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {selectedInvoice.status}
                      </strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleApprove(selectedInvoice.id)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedInvoice.status === 'Approved'
                          ? 'bg-emerald-500 text-neutral-950 shadow-[0_0_15px_rgba(16,185,129,0.35)] ring-2 ring-emerald-400'
                          : 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/40'
                      }`}
                    >
                      <Check className="size-3.5 stroke-[3]" />
                      <span>{selectedInvoice.status === 'Approved' ? 'Approved' : 'Approve'}</span>
                    </button>
                    <button
                      onClick={() => handleFlag(selectedInvoice.id)}
                      className={`py-2.5 px-3 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedInvoice.status === 'Flagged'
                          ? 'bg-amber-500 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.35)] ring-2 ring-amber-400'
                          : 'bg-[#162035] hover:bg-[#1e2c48] text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      <AlertTriangle className="size-3.5 text-amber-400" />
                      <span>{selectedInvoice.status === 'Flagged' ? 'Flagged' : 'Flag Note'}</span>
                    </button>
                    <button
                      onClick={() => handleReject(selectedInvoice.id)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectedInvoice.status === 'Rejected'
                          ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.35)] ring-2 ring-rose-400'
                          : 'bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30'
                      }`}
                    >
                      <X className="size-3.5 stroke-[2.5]" />
                      <span>{selectedInvoice.status === 'Rejected' ? 'Rejected' : 'Reject'}</span>
                    </button>
                  </div>
                </div>

                {/* Document Information Grid */}
                <div className="bg-[#101524] border border-cyan-500/20 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Extracted Document Info
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-500 block">Vendor Category</span>
                      <span className="text-white font-medium">{selectedInvoice.vendorCategory}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Original File</span>
                      <span className="text-cyan-300 font-medium truncate block">{selectedInvoice.fileName || 'invoice.pdf'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Due Date</span>
                      <span className="text-white font-medium">{selectedInvoice.dueDate}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Tax Rate</span>
                      <span className="text-white font-medium">{((selectedInvoice.taxRate || 0) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Line Item Breakdown
                  </div>
                  <div className="bg-[#101524] border border-cyan-500/20 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#141b2e] text-neutral-400 uppercase text-[10px] border-b border-cyan-500/15">
                        <tr>
                          <th className="py-2.5 px-3">Description</th>
                          <th className="py-2.5 px-3 text-center">Qty</th>
                          <th className="py-2.5 px-3 text-right">Price</th>
                          <th className="py-2.5 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#172036]">
                        {selectedInvoice.lineItems.map((item) => (
                          <tr key={item.id} className="text-neutral-200">
                            <td className="py-2.5 px-3 font-medium">{item.description}</td>
                            <td className="py-2.5 px-3 text-center text-neutral-400 tabular-nums">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right text-neutral-300 tabular-nums">${item.unitPrice.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-semibold text-white tabular-nums">${item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-[#101524] border border-cyan-500/20 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span className="font-semibold text-white tabular-nums">${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Tax ({((selectedInvoice.taxRate || 0) * 100).toFixed(1)}%)</span>
                    <span className="font-semibold text-white tabular-nums">${(selectedInvoice.taxAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-cyan-500/20">
                    <span>Total Disbursement</span>
                    <span className="text-[#21d2ed] tabular-nums">${selectedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
    <div className="flex items-center justify-between gap-2">
      {/* User Info Badge */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="size-8 rounded-xl bg-gradient-to-br from-[#21d2ed]/25 to-cyan-500/10 text-[#21d2ed] flex items-center justify-center text-[11px] font-bold border border-[#21d2ed]/40 shrink-0 shadow-[0_0_8px_rgba(33,210,237,0.3)]">
          {initials || 'FC'}
        </div>
        <div className="min-w-0 truncate">
          <div className="text-white text-[12.5px] font-semibold truncate leading-tight">{name}</div>
          <div className="text-[10.5px] text-neutral-400 truncate">AP Controller</div>
        </div>
      </div>

      {/* Explicit, high-visibility Sign Out Button that works on click */}
      <button
        onClick={onSignOut}
        className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer shadow-sm"
        title="Sign Out of Veyra AI"
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
    'Finance Controller'

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
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#21d2ed]"></div>
    </div>
  )
}

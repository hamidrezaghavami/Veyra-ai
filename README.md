# Veyra AI — Invoice & Expense Auditing Platform

> **"Your invoices, audited. Your expenses, clear."**
> Full-stack web application faithfully re-created from the official Framer design system (`earlier-weather-453183.framer.app`).

---

## 🚀 Overview

**Veyra AI** is an intelligent invoice processing, expense tracking, and automated financial auditing platform designed for freelancers, high-growth startups, and modern accounting teams.

It extracts key line items from invoices and receipts using vision OCR, executes automated deterministic rule validations (duplicate detection, math sum checks, tax rate consistency, high-value spend thresholds), and maintains a human-in-the-loop approval workflow with an embedded AI Financial Assistant.

---

## 🎨 Design System & Aesthetics (1:1 with Framer)

Built using the exact **Verity / Veyra Design System Tokens**:

| Token | Value | Application |
|---|---|---|
| **Dark/Background** | `#0d0d0f` (`rgb(13, 13, 15)`) | Page base & canvas |
| **Dark/Surface 1** | `#111113` (`rgb(17, 17, 19)`) | Cards, panels (16px border radius) |
| **Dark/Surface 2** | `#141416` (`rgb(20, 20, 22)`) | Nested insets (12px border radius) |
| **Dark/Accent** | `#21d2ed` (`rgb(33, 210, 237)`) | Eyebrow badges, focus states, cyan glow |
| **Dark/Border** | `rgba(255, 255, 255, 0.06)` | Hairline dividers & borders |
| **Text/Primary** | `#ffffff` | Headings & high-contrast labels |
| **Text/Secondary** | `#b0b0b0` | Body copy, card subtitles |
| **Typography** | `Onest`, sans-serif | Tight tracking (`-0.04em` on H1/H2) |
| **Shader Backgrounds** | Canvas WebGL Wave Mesh | Ambient cyan motion inside cards |

---

## 📦 Route Architecture

Every single page and route from the Framer project is fully implemented:

* **`/` (Landing Page)**:
  * Sleek floating glass navbar with brand mark and active page indicators
  * Hero with `NEW · Invoice and expense auditing with AI` badge, primary CTAs, and interactive live invoice preview card with active Approve/Flag toggling
  * Partner logo marquee (`Corebit`, `Lumen Labs`, `Aerix`, `Driftwave`)
  * `What Veyra AI does`: 3 feature cards with animated shader canvas backgrounds
  * `Use cases`: 4-tab interactive workflow showcase (Process Invoices, Audit Financial Records, Track Expenses, Ask Financial Questions)
  * `How it works`: 3-phase progression from raw upload to reviewed record
  * `Built for teams`: 6 feature grid cards
  * `Why Veyra AI`: Side-by-side comparison table (Manual vs Veyra)
  * `Customer stories`: Testimonial quotes from verified finance leads
  * `Metrics`: 4-column live operational KPIs
  * `Pricing`: Monthly / Yearly toggle (20% off) across Starter ($0), Pro ($19), Teams ($29)
  * `FAQ`: 6 expandable accordions with precise answers
  * Closing CTA & comprehensive footer
* **`/account` / `/dashboard` (Full-Stack Audit Application)**:
  * **Invoices & Audits**: Live searchable ledger with status filters (All, Flagged, Pending, Approved, Rejected)
  * **Document Ingestion & OCR**: Drag-and-drop file upload zone + 1-click test scenarios (Clean, Duplicate, Tax Mismatch)
  * **Rule Engine**: Deterministic duplicate checking, line-item sum reconciliation, and tax rate calculation verification
  * **Spend Analytics**: Real-time spending breakdown by category and top vendors
  * **AI Financial Assistant**: Conversational assistant grounded in uploaded accounting records with suggested action chips
  * **Inspection Modal**: Line-item inspection, triggered flags, and audit history trail
* **`/waitlist`**: Early access signup with instant queue positioning (#412+), validation, and persistent storage
* **`/contact`**: Interactive inquiry form with validation and confirmation
* **`/sign-in` & `/sign-up`**: Clean FrameAuth passwordless authentication with OTP dispatch
* **`/otp`**: 6-box OTP entry screen with auto-focus, countdown timer, and automatic login
* **`/blog` & `/blog/:slug`**: Full blog reader with all 4 official Framer guides
* **`/changelog`**: Version history from v2.0 to v2.4 with timeline, feature tags, and quotes
* **`/legal/privacy-policy` & `/legal/terms-of-service`**: Complete legal documentation
* **`/design-system`**: Interactive token inspector for colors, typography, radii, and shaders

---

## 🧠 Backend Infrastructure (`src/backend`)

The application is powered by a high-performance backend with **Google Gemini AI** and deterministic financial audit rules:

```
src/backend/
├── config/        # Environment & Google Cloud Gemini configurations
├── gemini/        # Google Gemini AI client (vision OCR & financial chat)
├── audit/         # Deterministic audit engine (duplicate, math, tax, high-value)
├── db/            # In-memory and persistent financial ledger store
├── services/      # Invoices, AI Chat, Analytics, Auth (OTP), Waitlist & Contact
├── routes/        # REST API endpoints (/api/invoices, /api/chat, /api/analytics, etc.)
├── vitePlugin.ts  # Vite middleware plugin: auto-mounts /api directly in dev server
└── index.ts       # Standalone Node.js Express server runner
```

### 🤖 Gemini AI Features:
- **Vision Document Ingestion:** Extracts vendors, line items, taxes, currency, and totals with confidence scoring.
- **Grounded Financial Assistant:** Conversational AI chat grounded in active ledger records, spend categories, and audit flags.
- **Dual-Layer Audit Engine:**
  1. *Duplicate Detection:* Flags identical invoice numbers or duplicate vendor disbursements.
  2. *Line-Item Reconciliation:* Verifies `sum(lineItems) == subtotal`.
  3. *Tax Rate Consistency:* Validates expected tax against document billing.
  4. *High-Value Spend Thresholds:* Flags transactions exceeding $10,000 for dual executive sign-off.

### 🌐 REST API Endpoints:
- `GET /api/health` — Backend health & Gemini AI status
- `GET /api/invoices` — List invoices with query filtering (status, category, search)
- `GET /api/invoices/:id` — Single invoice record with audit history
- `POST /api/invoices/upload-and-audit` — Ingest document & run full Gemini OCR audit
- `PATCH /api/invoices/:id/approve` — Approve invoice for AP disbursement
- `PATCH /api/invoices/:id/reject` — Reject invoice with reason
- `PATCH /api/invoices/:id/flag` — Flag invoice for human review
- `PUT /api/invoices/:id` — Correct fields and trigger automatic re-audit
- `DELETE /api/invoices/:id` — Delete record
- `POST /api/chat` — Conversational AI Assistant grounded in corporate ledger
- `GET /api/analytics` — Real-time spend volume, category breakdown & vendor KPIs
- `POST /api/auth/send-otp` & `POST /api/auth/verify-otp` — Passwordless authentication
- `POST /api/waitlist` & `POST /api/contact` — Lead ingestion

---

## 🛠 Tech Stack

* **Frontend:** React 19 + TypeScript, Tailwind CSS 4, Framer Motion, Lucide Icons
* **Backend:** Node.js, Express 5, TypeScript, Vite Connect Middleware
* **AI Engine:** Google Gemini AI (`@google/genai`, `gemini-3.8-flash` / `gemini-flash-latest`)
* **Package Manager:** pnpm 12
* **Build Tool:** Vite 8

---

## 💻 Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Start full-stack development server (Frontend + Backend on http://localhost:3000)
pnpm dev

# 3. (Optional) Run standalone backend API server on http://localhost:3001
pnpm dev:backend

# 4. Build for production
pnpm build

# 5. Preview production build
pnpm preview
```

# Veyra AI

Invoice extraction, deterministic audit checks, and a recorded human review workflow.

## Running locally

Use Node 22.19+ or Node 24 and pnpm 12.18. Copy `.env.example` to `.env` and fill in the server-only values. `BETTER_AUTH_SECRET` must be a randomly generated secret of at least 32 characters. Use an isolated PostgreSQL database for development.

```sh
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm dev
```

The Vite development server mounts the same Express API used in production at `/api`. No separate backend is needed for local development. `pnpm start:backend` is available for a standalone API.

## Checks

```sh
pnpm typecheck
pnpm test
pnpm build
```

`pnpm test` runs deterministic audit, validation, extraction error, and CSV safety tests. `pnpm test:integration` verifies accounts, wrong-password rejection, account isolation, saved uploads, approval history, correction invalidation, logout, and persistence through a fresh app instance against an isolated test database. Set `RUN_INTEGRATION_TESTS=1` and point `DATABASE_URL` at a verification branch. Never run integration tests against a database containing customer accounts.

## Deployment

The Vercel project serves the Vite frontend and `api/index.ts` together. `vercel.json` routes API requests to that function and browser paths to `index.html`, so direct links and refreshes work. Do not proxy this project to the previous Render URL.

Configure server-side environment variables:

- `DATABASE_URL`: pooled PostgreSQL URL for application requests.
- `BETTER_AUTH_SECRET`: a unique cryptographically random secret.
- `BETTER_AUTH_URL`: the exact application origin.
- `TRUSTED_ORIGINS`: comma-separated exact allowed origins; no wildcard credentials.
- `GEMINI_API_KEY`: enables PDF/image extraction and the financial assistant.
- `GEMINI_MODEL`: optional model override, default `gemini-2.5-flash`.

Apply `pnpm db:migrate` with a direct connection before releasing code. The migration creates Better Auth's version-matched tables and additive application tables. Test it on a database branch first. Do not run schema changes as a side effect of public requests. Preview deployments need a separate branch, secret, and explicit auth origin. Configure the function region near the database (Frankfurt).

Each account owns its invoices. There is no shared demo ledger, browser-created session, reset endpoint, or unauthenticated invoice API. Review actors come from the authenticated server session. There are no organization-sharing or dual-approval claims. Authentication uses Better Auth email/password with HTTP-only session cookies and database-backed rate limiting. Password recovery and social login are not offered without a configured provider.

Documents are limited to 2.8 MB to stay within serverless request limits. PDF and image contents are sent to Gemini; original files are not stored. Structured JSON imports do not use AI. Unreadable fields and AI/provider failures return errors instead of invented invoices. All amounts and dates are validated before persistence. Audit checks detect duplicate candidates, incorrect line totals, subtotal discrepancies, tax mismatches (including zero tax), grand total mismatches, and high-value amounts in the stated currency. No exchange rates or VAT jurisdiction rules are assumed. Review findings stay in the history after approval; flagged approvals require an explanation. Any correction resets approval.

Contact and waitlist messages are stored in PostgreSQL. They are not emailed. Administrators can retrieve them through authenticated database tooling. Success is shown only after the database write succeeds. Request-limit buckets contain hashed identifiers; periodically prune rows older than one day from `veyra_request_limits` through an administrative maintenance job.

CSV export includes currency and escapes spreadsheet formulas. Analytics keep currencies separate and exclude rejected invoices from category totals. No paid plans, unverified customer testimonials, uptime guarantees, accounting integrations, or fabricated accuracy claims are advertised.

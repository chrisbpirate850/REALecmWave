# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emerald Coast Marketing Wave (ECMWave) is a Next.js 16 application for a shared postcard advertising platform. Local businesses purchase ad spots on 9x12 postcards mailed via USPS Every Door Direct Mail to the Emerald Coast area (Niceville, Fort Walton Beach, Navarre, Gulf Breeze). The platform provides QR code tracking and analytics for measuring campaign performance.

**Production URL:** https://ecmwave.com

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm start            # Run production build locally
npm run lint         # Lint code
```

No test runner is configured. There are no test files or test scripts.

### Stripe Webhook Testing
```bash
# In separate terminal - forward webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Database Migrations
Numbered SQL migration files in `scripts/` (e.g., `001_create_tables.sql` through `008_add_crestview_mailing.sql`). Run migrations using the corresponding `.mjs` runner scripts:
```bash
node scripts/run-sql-migration.mjs
```
Additional utility scripts exist for tasks like resetting spots, updating QR URLs, and creating landing pages.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router and React 19
- **Database/Auth**: Supabase (PostgreSQL with Row Level Security)
- **Payments**: Stripe (live mode - embedded checkout + webhooks)
- **Email**: Resend with React Email templates (`emails/` directory: purchase confirmation, welcome, contact form)
- **Styling**: Tailwind CSS 4 with shadcn/ui (new-york style)
- **Deployment**: Vercel (auto-deploys on push to `main` at `github.com:chrisbpirate850/REALecmWave.git`)

### Middleware

The middleware file is `proxy.ts` at the project root (not the standard `middleware.ts`). It delegates to `lib/supabase/proxy.ts` which:
- Refreshes Supabase auth sessions on every request
- Redirects unauthenticated users away from `/admin/*` and `/dashboard/*` to `/auth/login`
- Excludes static assets from middleware via the matcher pattern

### Supabase Client Patterns

Three Supabase clients for different contexts:

| Client | Location | Usage |
|--------|----------|-------|
| `createClient()` | `@/lib/supabase/client` | Browser/client components (sync) |
| `createClient()` | `@/lib/supabase/server` | Server components (async, uses cookies, respects RLS) |
| `createAdminClient()` | `@/lib/supabase/admin` | Webhooks/server actions (bypasses RLS with service role key) |

**Important**: Server client is async (`await createClient()`), browser client is sync.

### Payment Flow

Stripe uses **embedded checkout** (`ui_mode: "embedded"`) — the checkout form renders inline, not via redirect.

1. User selects spots on `/mailings/[id]`
2. Server action `app/actions/stripe.ts` creates embedded Stripe session, marks spots as "reserved", creates pending payment records
3. On completion, `/api/webhooks/stripe` receives `checkout.session.completed`:
   - Updates spots to "purchased"
   - Creates landing pages with unique slugs
   - Generates QR code URLs
   - Sends confirmation email via Resend

Spot metadata (spotIds, mailingId, advertiserId, adCopyUrl, offerText) is passed through Stripe session metadata.

### Key Database Columns

- `ad_spots.ad_copy_url` - Uploaded artwork URL (NOT `artwork_url`)
- `ad_spots.landing_page_slug` - Links to QR landing page
- `profiles.is_admin` - Boolean for admin access control

### Admin Access

Admin routes (`/admin/*`) check `profiles.is_admin`. To make a user admin:
```sql
UPDATE profiles SET is_admin = true WHERE email = 'user@example.com';
```

### Custom Checkout (Admin Feature)

Admins generate payment links with negotiated pricing at `/admin/custom-checkout`. The flow uses `/api/custom-checkout` to create Stripe sessions with custom amounts.

### API Routes

All API routes are in `app/api/`:
- `checkout/` and `custom-checkout/` - Payment session creation
- `webhooks/stripe/` - Stripe event handler (uses admin client to bypass RLS)
- `admin-upload/` and `upload-ad-copy/` - File uploads
- `assign-spot/` - Manual spot assignment
- `claim-offer/` - Offer landing page claims
- `contact/` - Contact form submission
- `emails/send/` - Email trigger endpoint

## Styling

### Theme Colors (OKLCH)
Defined in `app/globals.css`:
- Primary: emerald-600 (`oklch(0.533 0.157 166.504)`)
- Accent: emerald-100 (`oklch(0.906 0.062 166.155)`)
- Full dark mode support

### Custom Animations
Wave animations defined in globals.css: `.animate-wave-slow`, `.animate-wave-medium`, `.animate-wave-fast`. All respect `prefers-reduced-motion`.

## Environment Variables

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

**Stripe (Live Mode):**
- `STRIPE_PUBLISHABLE_KEY` (pk_live_...)
- `STRIPE_SECRET_KEY` (sk_live_...)
- `STRIPE_WEBHOOK_SECRET` (whsec_...)

**Email:**
- `RESEND_API_KEY`

**App:**
- `NEXT_PUBLIC_BASE_URL` (https://ecmwave.com)

## Important Notes

- `next.config.mjs` has `typescript.ignoreBuildErrors: true` — address type errors when possible
- Project was generated with v0.dev; console logs use `[v0]` prefix
- Print export at `/admin/mailings/[id]/export` uses JSZip for artwork ZIP downloads
- Path alias: `@/*` maps to `./*` (e.g., `@/components`, `@/lib`)
- `images.unoptimized: true` in next.config — Next.js image optimization is disabled

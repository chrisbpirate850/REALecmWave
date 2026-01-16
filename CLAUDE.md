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

### Stripe Webhook Testing
```bash
# In separate terminal - forward webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Database Migrations
SQL migration files are in `scripts/`. Run migrations using the `.mjs` runner scripts:
```bash
node scripts/run-sql-migration.mjs
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router and React 19
- **Database/Auth**: Supabase (PostgreSQL with Row Level Security)
- **Payments**: Stripe (live mode - checkout sessions + webhooks)
- **Email**: Resend with React Email templates
- **Styling**: Tailwind CSS 4 with shadcn/ui (new-york style)
- **Deployment**: Vercel

### Supabase Client Patterns

Three Supabase clients for different contexts:

| Client | Location | Usage |
|--------|----------|-------|
| `createClient()` | `@/lib/supabase/client` | Browser/client components |
| `createClient()` | `@/lib/supabase/server` | Server components (uses cookies, respects RLS) |
| `createAdminClient()` | `@/lib/supabase/admin` | Webhooks/server actions (bypasses RLS with service role key) |

**Important**: Server client is async (`await createClient()`), browser client is sync.

### Payment Flow

1. User selects spots on `/mailings/[id]`
2. `POST /api/checkout` creates Stripe session, marks spots as "reserved"
3. Stripe redirects to `/checkout/success` on completion
4. `/api/webhooks/stripe` receives `checkout.session.completed`:
   - Updates spots to "purchased"
   - Creates landing pages with unique slugs
   - Generates QR code URLs
   - Sends confirmation email via Resend

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

## Styling

### Theme Colors (OKLCH)
Defined in `app/globals.css`:
- Primary: emerald-600 (`oklch(0.533 0.157 166.504)`)
- Accent: emerald-100 (`oklch(0.906 0.062 166.155)`)
- Full dark mode support

### Custom Animations
Wave animations defined in globals.css: `.animate-wave-slow`, `.animate-wave-medium`, `.animate-wave-fast`

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

- `next.config.mjs` has `typescript.ignoreBuildErrors: true` - address type errors when possible
- Email templates use React Email in `emails/` directory
- Project console logs use `[v0]` prefix (generated with v0.dev)
- Print export at `/admin/mailings/[id]/export` uses JSZip for artwork ZIP downloads
- Path alias: `@/*` maps to `./*` (e.g., `@/components`, `@/lib`)

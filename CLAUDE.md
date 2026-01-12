# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emerald Coast Marketing Wave is a Next.js 16 application for a shared postcard advertising platform. Local businesses purchase ad spots on 9x12 postcards mailed via USPS Every Door Direct Mail to the Emerald Coast area (Niceville, Navarre, Gulf Breeze). The platform provides QR code tracking and analytics for measuring campaign performance.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Lint code
npm run lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router and React 19
- **Database/Auth**: Supabase (PostgreSQL with Row Level Security)
- **Payments**: Stripe (checkout sessions + webhooks)
- **Styling**: Tailwind CSS 4 with shadcn/ui (new-york style)
- **Deployment**: Vercel with Analytics

### Directory Structure
```
emerald-coast-marketing-wave/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── checkout/      # Stripe checkout session creation
│   │   ├── webhooks/stripe/  # Stripe webhook handler
│   │   └── upload-ad-copy/   # File upload endpoint
│   ├── auth/              # Authentication pages (login, sign-up)
│   ├── dashboard/         # Protected user dashboard
│   ├── mailings/          # Public mailing listings
│   ├── offers/[slug]/     # Dynamic QR code landing pages
│   └── checkout/          # Checkout flow pages
├── components/
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── supabase/          # Supabase client utilities
│   │   ├── client.ts      # Browser client
│   │   └── server.ts      # Server client (uses cookies)
│   ├── stripe.ts          # Stripe server-only instance
│   └── utils.ts           # cn() utility for className merging
└── hooks/                 # Custom React hooks
```

### Supabase Data Model
The database includes these core tables (managed via Supabase dashboard):
- `profiles` - User business profiles linked to Supabase Auth
- `mailings` - Postcard mailing campaigns with status and dates
- `ad_spots` - Individual ad positions on postcards (6 per mailing)
- `landing_pages` - QR code destination pages with offer details
- `analytics` - QR scan tracking data
- `payments` - Stripe payment records

### Authentication Flow
- Supabase Auth with email/password
- Client components use `createClient()` from `@/lib/supabase/client`
- Server components use `await createClient()` from `@/lib/supabase/server`
- Protected routes redirect unauthenticated users to `/auth/login`

### Payment Flow
1. User selects spots on `/mailings/[id]`
2. POST to `/api/checkout` creates Stripe session and marks spots as "reserved"
3. Stripe redirects to `/checkout/success` on completion
4. `/api/webhooks/stripe` receives webhook, updates spots to "purchased", generates QR codes and landing pages

### Path Aliases
Configured in `tsconfig.json`:
- `@/*` → `./*` (e.g., `@/components`, `@/lib`, `@/hooks`)

## Styling

### Theme Colors
Uses OKLCH color space with emerald accent colors defined in `app/globals.css`:
- Primary: emerald-600 (`oklch(0.533 0.157 166.504)`)
- Accent: emerald-100 (`oklch(0.906 0.062 166.155)`)
- Full dark mode support

### Component Library
- All UI components in `components/ui/` follow shadcn/ui patterns
- Use `cn()` from `@/lib/utils` for conditional className merging
- RSC (React Server Components) enabled in shadcn config

## Environment Variables

A `.env.local` file exists with all required variables for local development.

**Required variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (`https://axqqicapljbxqymosdfe.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - For server-side Supabase operations
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key (pk_test_...)
- `STRIPE_SECRET_KEY` - Stripe secret key (sk_test_...)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (whsec_...)
- `NEXT_PUBLIC_BASE_URL` - App URL for QR code generation

**Production:** Variables are also configured in Vercel dashboard.

## Important Notes

- `next.config.mjs` has `ignoreBuildErrors: true` for TypeScript - address type errors when possible
- Custom email templates for Supabase Auth are in `supabase-email-templates/`
- The project was generated with v0.dev, reflected in some console log prefixes (`[v0]`)

---

## Current Development Status (Session Notes)

### What's Complete
- ✅ Local `.env.local` configured with Supabase and Stripe credentials
- ✅ Stripe CLI installed (v1.31.1) for local webhook testing
- ✅ Local webhook forwarding configured: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Pending Tasks

#### 1. Create Production Stripe Webhook (CRITICAL)
The checkout flow works but **post-payment processing is broken in production** because no webhook endpoint exists in Stripe.

**Using Stripe MCP (preferred):** Create a webhook endpoint with:
- URL: `https://[YOUR-VERCEL-DOMAIN]/api/webhooks/stripe`
- Event: `checkout.session.completed`

**Or via Stripe Dashboard:**
1. Go to Developers → Webhooks → Add endpoint
2. Set endpoint URL to your production domain + `/api/webhooks/stripe`
3. Select event `checkout.session.completed`
4. Copy the signing secret (`whsec_...`) and update:
   - Vercel environment variable `STRIPE_WEBHOOK_SECRET`
   - Local `.env.local` if testing production webhooks

#### 2. Verify Post-Payment Flow
After webhook is created, test that these work after successful checkout:
- Ad spots update to "purchased" status
- QR codes are generated
- Landing pages are created in `landing_pages` table
- Payment records update to "completed"

### Stripe Account Info
- **Account for this project:** Uses keys starting with `sk_test_51SaQ3ZEb9IJNY8GL...`
- **Stripe MCP:** Being configured - restart required to activate

### Local Development
```bash
cd emerald-coast-marketing-wave
npm install
npm run dev

# In separate terminal - forward Stripe webhooks locally:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
